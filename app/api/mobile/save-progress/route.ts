import { NextResponse } from "next/server";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";
import { requireAssignedPlanExercise } from "@/lib/backend-logic";
import { notifyPhysioHighPain, notifyPhysioLowAiScore } from "@/lib/clinical-notifications";

type ProgressBody = {
  code?: string;
  patientId?: string;
  planExerciseId?: string;
  score?: number;
  feedback?: string;
  alertType?: "good" | "needs_attention" | "contact_physio";
  painScore?: number;
};

function isValidScore(value: unknown, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "service_unavailable" }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as ProgressBody;
  const code = normalizePatientCode(String(body.code || ""));
  const patientId = String(body.patientId || "").trim();
  const planExerciseId = String(body.planExerciseId || "").trim();
  if (!code || !patientId || !planExerciseId) {
    return NextResponse.json({ error: "code, patientId and planExerciseId are required" }, { status: 400 });
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("id,physio_id")
    .eq("id", patientId)
    .eq("patient_code", code)
    .eq("status", "active")
    .maybeSingle<{ id: string; physio_id: string | null }>();
  if (!patient) return NextResponse.json({ error: "invalid_patient_session" }, { status: 401 });

  try {
    await requireAssignedPlanExercise({ supabase, patientId: patient.id, planExerciseId });
  } catch {
    return NextResponse.json({ error: "exercise_not_assigned_to_active_plan" }, { status: 403 });
  }

  const painScore = isValidScore(body.painScore, 0, 10) ? body.painScore : undefined;
  const score = isValidScore(body.score, 0, 100) ? body.score : undefined;
  if (painScore === undefined && score === undefined) {
    return NextResponse.json({ error: "painScore or score is required" }, { status: 400 });
  }

  const feedback = String(body.feedback || "").trim().slice(0, 600);
  const alertType = score === undefined ? undefined : score < 60 ? "contact_physio" : score < 80 ? "needs_attention" : "good";
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
    if (error) return NextResponse.json({ error: "progress_write_failed" }, { status: 500 });
  }

  if (score !== undefined) {
    try {
      await requireAssignedPlanExercise({ supabase, patientId: patient.id, planExerciseId, aiOnly: true });
    } catch {
      return NextResponse.json({ error: "ai_not_enabled_for_exercise" }, { status: 403 });
    }
    const { error } = await supabase.from("ai_checks").insert({
      patient_id: patient.id,
      plan_exercise_id: planExerciseId,
      score,
      feedback: feedback || "AI Movement Check nga mobile app",
      alert_type: alertType,
      created_at: now,
    });
    if (error) return NextResponse.json({ error: "ai_write_failed" }, { status: 500 });
  }

  if (painScore !== undefined && painScore >= 7) {
    await notifyPhysioHighPain({ supabase, patientId: patient.id, painScore, comment: null });
  }
  if (score !== undefined && score < 60) {
    await notifyPhysioLowAiScore({ supabase, patientId: patient.id, score, feedback });
  }

  return NextResponse.json({ saved: true });
}
