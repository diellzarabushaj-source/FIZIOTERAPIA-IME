import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";
import { notifyPhysioLowAiScore } from "@/lib/clinical-notifications";

const CODE_COOKIE = "fizioplan_patient_code";
const MAX_AI_FEEDBACK_LENGTH = 600;
const allowedAlertTypes = new Set(["good", "needs_attention", "contact_physio"]);

type AiPayload = {
  planExerciseId?: string;
  score?: number;
  feedback?: string;
  alertType?: string;
  landmarksDetected?: number;
};

function parseScore(value: unknown) {
  const score = Number(value);
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return null;
  }

  return Math.round(score);
}

function normalizeFeedback(value: unknown) {
  const text = String(value || "AI check u ruajt.").trim().slice(0, MAX_AI_FEEDBACK_LENGTH);
  return text || "AI check u ruajt.";
}

function normalizeAlertType(value: unknown, score: number) {
  const alertType = String(value || "").trim();
  if (allowedAlertTypes.has(alertType)) return alertType;
  return score < 60 ? "contact_physio" : score < 80 ? "needs_attention" : "good";
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "missing_supabase_server_key" }, { status: 500 });
  }

  const cookieStore = await cookies();
  const code = normalizePatientCode(cookieStore.get(CODE_COOKIE)?.value || "");

  if (!code) {
    return NextResponse.json({ ok: false, error: "patient_not_logged_in" }, { status: 401 });
  }

  let body: AiPayload;
  try {
    body = (await request.json()) as AiPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const planExerciseId = String(body.planExerciseId || "").trim();
  const score = parseScore(body.score);

  if (!planExerciseId) {
    return NextResponse.json({ ok: false, error: "missing_plan_exercise_id" }, { status: 400 });
  }

  if (score === null) {
    return NextResponse.json({ ok: false, error: "invalid_ai_score" }, { status: 400 });
  }

  const feedback = normalizeFeedback(body.feedback);
  const alertType = normalizeAlertType(body.alertType, score);

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("patient_code", code)
    .eq("status", "active")
    .maybeSingle();

  if (!patient) {
    return NextResponse.json({ ok: false, error: "invalid_patient_session" }, { status: 401 });
  }

  const { data: assignedExercise } = await supabase
    .from("plan_exercises")
    .select("id,plans!inner(patient_id)")
    .eq("id", planExerciseId)
    .eq("plans.patient_id", patient.id)
    .maybeSingle();

  if (!assignedExercise) {
    return NextResponse.json({ ok: false, error: "exercise_not_assigned_to_patient" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("ai_checks")
    .insert({
      patient_id: patient.id,
      plan_exercise_id: planExerciseId,
      score,
      feedback,
      alert_type: alertType,
      created_at: new Date().toISOString(),
    })
    .select("id,score,alert_type,created_at")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (score < 60) {
    await notifyPhysioLowAiScore({
      supabase,
      patientId: patient.id,
      score,
      feedback,
    });
  }

  return NextResponse.json({ ok: true, aiCheck: data });
}
