import { NextResponse } from "next/server";
import { notifyPhysioLowAiScore } from "@/lib/clinical-notifications";
import { getCurrentPatientSession } from "@/lib/patient-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { MAX_AI_FEEDBACK_LENGTH, requireAssignedPlanExercise } from "@/lib/backend-logic";

type AiPayload = { planExerciseId?: string; score?: number; feedback?: string; landmarksDetected?: number };

function parseScore(value: unknown) {
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 100 ? Math.round(score) : null;
}

function normalizeFeedback(value: unknown) {
  const text = String(value || "AI check u ruajt.").trim().slice(0, MAX_AI_FEEDBACK_LENGTH);
  return text || "AI check u ruajt.";
}

function deriveAlertType(score: number) {
  return score < 60 ? "contact_physio" : score < 80 ? "needs_attention" : "good";
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: "service_unavailable" }, { status: 503 });

  const patient = await getCurrentPatientSession();
  if (!patient) return NextResponse.json({ ok: false, error: "patient_not_logged_in" }, { status: 401 });

  let body: AiPayload;
  try { body = (await request.json()) as AiPayload; }
  catch { return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }); }

  const planExerciseId = String(body.planExerciseId || "").trim();
  const score = parseScore(body.score);
  if (!planExerciseId) return NextResponse.json({ ok: false, error: "missing_plan_exercise_id" }, { status: 400 });
  if (score === null) return NextResponse.json({ ok: false, error: "invalid_ai_score" }, { status: 400 });

  try {
    await requireAssignedPlanExercise({ supabase, patientId: patient.id, planExerciseId, aiOnly: true });
  } catch {
    return NextResponse.json({ ok: false, error: "exercise_not_available" }, { status: 403 });
  }

  const feedback = normalizeFeedback(body.feedback);
  const alertType = deriveAlertType(score);
  const { data, error } = await supabase.from("ai_checks").insert({
    patient_id: patient.id,
    plan_exercise_id: planExerciseId,
    score,
    feedback,
    alert_type: alertType,
    created_at: new Date().toISOString(),
  }).select("id,score,alert_type,created_at").single();

  if (error) return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  if (score < 60) await notifyPhysioLowAiScore({ supabase, patientId: patient.id, score, feedback });
  return NextResponse.json({ ok: true, aiCheck: data });
}
