import { NextResponse } from "next/server";
import { requireAssignedPlanExercise, verifyPatientCodeSignature } from "@/lib/backend-logic";
import {
  patientSessionRegistryEnabled,
  validatePatientSession,
} from "@/lib/backend/patient-sessions";
import { notifyPhysioHighPain, notifyPhysioLowAiScore } from "@/lib/clinical-notifications";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";
import { evaluatePainSafety } from "@/src/features/clinical-safety/domain/pain-safety";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

type ProgressBody = {
  code?: string;
  sessionToken?: string;
  patientId?: string;
  planExerciseId?: string;
  score?: number;
  feedback?: string;
  alertType?: "good" | "needs_attention" | "contact_physio";
  painScore?: number;
};

function isValidScore(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503, headers: noStoreHeaders });
  }

  const body = (await request.json().catch(() => ({}))) as ProgressBody;
  const sessionToken = getBearerToken(request) || String(body.sessionToken || "").trim();
  const patientId = String(body.patientId || "").trim();
  const planExerciseId = String(body.planExerciseId || "").trim();
  if (!sessionToken || !patientId || !planExerciseId) {
    return NextResponse.json(
      { error: "patient session, patientId and planExerciseId are required" },
      { status: 400, headers: noStoreHeaders },
    );
  }

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id,physio_id,patient_code")
    .eq("id", patientId)
    .eq("status", "active")
    .maybeSingle<{ id: string; physio_id: string | null; patient_code: string }>();
  if (patientError) {
    return NextResponse.json({ error: "database_error" }, { status: 500, headers: noStoreHeaders });
  }
  if (!patient) {
    return NextResponse.json({ error: "invalid_patient_session" }, { status: 401, headers: noStoreHeaders });
  }

  const sessionIsValid = patientSessionRegistryEnabled()
    ? await validatePatientSession({ supabase, patientId: patient.id, token: sessionToken })
    : (() => {
        const code = normalizePatientCode(String(body.code || ""));
        return Boolean(
          code &&
          patient.patient_code === code &&
          verifyPatientCodeSignature(code, sessionToken),
        );
      })();

  if (!sessionIsValid) {
    return NextResponse.json(
      { error: "invalid_or_expired_patient_session" },
      { status: 401, headers: noStoreHeaders },
    );
  }

  try {
    await requireAssignedPlanExercise({ supabase, patientId: patient.id, planExerciseId });
  } catch {
    return NextResponse.json(
      { error: "exercise_not_assigned_to_active_plan" },
      { status: 403, headers: noStoreHeaders },
    );
  }

  const painScore = isValidScore(body.painScore, 0, 10) ? body.painScore : undefined;
  const score = isValidScore(body.score, 0, 100) ? body.score : undefined;
  if (painScore === undefined && score === undefined) {
    return NextResponse.json(
      { error: "painScore or score is required" },
      { status: 400, headers: noStoreHeaders },
    );
  }

  const feedback = String(body.feedback || "").trim().slice(0, 600);
  const alertType = score === undefined
    ? undefined
    : score < 60
      ? "contact_physio"
      : score < 80
        ? "needs_attention"
        : "good";
  const now = new Date().toISOString();

  if (painScore !== undefined) {
    const { error } = await supabase.from("exercise_logs").insert({
      patient_id: patient.id,
      plan_exercise_id: planExerciseId,
      completed: true,
      pain_score: painScore,
      comment: "Raportuar nga mobile app",
      completed_at: now,
    });
    if (error) {
      return NextResponse.json({ error: "progress_write_failed" }, { status: 500, headers: noStoreHeaders });
    }
  }

  if (score !== undefined) {
    try {
      await requireAssignedPlanExercise({
        supabase,
        patientId: patient.id,
        planExerciseId,
        aiOnly: true,
      });
    } catch {
      return NextResponse.json(
        { error: "ai_not_enabled_for_exercise" },
        { status: 403, headers: noStoreHeaders },
      );
    }

    const { error } = await supabase.from("ai_checks").insert({
      patient_id: patient.id,
      plan_exercise_id: planExerciseId,
      score,
      feedback: feedback || "AI Movement Check nga mobile app",
      alert_type: alertType,
      created_at: now,
    });
    if (error) {
      return NextResponse.json({ error: "ai_write_failed" }, { status: 500, headers: noStoreHeaders });
    }
  }

  const painDecision = painScore === undefined ? null : evaluatePainSafety(painScore);
  if (painDecision?.action === "stop_and_contact_physio") {
    await notifyPhysioHighPain({ supabase, patientId: patient.id, painScore, comment: null });
  }
  if (score !== undefined && score < 60) {
    await notifyPhysioLowAiScore({ supabase, patientId: patient.id, score, feedback });
  }

  return NextResponse.json({
    saved: true,
    painAction: painDecision?.action ?? null,
  }, { headers: noStoreHeaders });
}
