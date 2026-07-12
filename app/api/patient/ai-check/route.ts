import { NextResponse } from "next/server";
import { getVersionedAiAlert } from "@/lib/backend/clinical-rules";
import { DatabaseError, ForbiddenError } from "@/lib/backend/errors";
import { logServerError } from "@/lib/backend/safe-logger";
import { notifyPhysioLowAiScore } from "@/lib/clinical-notifications";
import { getCurrentPatientSession } from "@/lib/patient-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { MAX_AI_FEEDBACK_LENGTH, requireAssignedPlanExercise } from "@/lib/backend-logic";

type AiPayload = { planExerciseId?: string; score?: number; feedback?: string; landmarksDetected?: number };

function parseScore(value: unknown) {
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 100 ? Math.round(score) : null;
}

function parseFeedback(value: unknown) {
  const text = String(value || "AI check u ruajt.").trim() || "AI check u ruajt.";
  if (text.length > MAX_AI_FEEDBACK_LENGTH) return null;
  return text;
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: "service_unavailable" }, { status: 503 });

  const patient = await getCurrentPatientSession();
  if (!patient) return NextResponse.json({ ok: false, error: "patient_not_logged_in" }, { status: 401 });

  let body: AiPayload;
  try {
    body = (await request.json()) as AiPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const planExerciseId = String(body.planExerciseId || "").trim();
  const score = parseScore(body.score);
  const feedback = parseFeedback(body.feedback);

  if (!planExerciseId) return NextResponse.json({ ok: false, error: "missing_plan_exercise_id" }, { status: 400 });
  if (score === null) return NextResponse.json({ ok: false, error: "invalid_ai_score" }, { status: 400 });
  if (feedback === null) return NextResponse.json({ ok: false, error: "feedback_too_long" }, { status: 400 });

  try {
    await requireAssignedPlanExercise({ supabase, patientId: patient.id, planExerciseId, aiOnly: true });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ ok: false, error: "exercise_not_available" }, { status: 403 });
    }
    logServerError("ai_check_exercise_validation_failed", error);
    const status = error instanceof DatabaseError ? 503 : 500;
    return NextResponse.json({ ok: false, error: "service_unavailable" }, { status });
  }

  const { alertType, rulesVersion } = getVersionedAiAlert(score);
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
    logServerError("ai_check_insert_failed", error, { alertType, rulesVersion });
    return NextResponse.json({ ok: false, error: "database_error" }, { status: 500 });
  }

  if (alertType === "contact_physio") {
    try {
      await notifyPhysioLowAiScore({ supabase, patientId: patient.id, score, feedback });
    } catch (notificationError) {
      logServerError("ai_check_notification_failed", notificationError, { rulesVersion });
    }
  }

  return NextResponse.json({ ok: true, aiCheck: { ...data, rulesVersion } });
}
