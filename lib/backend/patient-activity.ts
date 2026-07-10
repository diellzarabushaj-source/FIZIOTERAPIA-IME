import type { ActivePatientSession } from "@/lib/backend-logic";
import { writeAuditEvent } from "@/lib/backend/audit";
import { fail, ok, type BackendResult } from "@/lib/backend/result";
import { cleanText, validatePainScore, validateUuid } from "@/lib/backend/validation";
import { notifyPhysioHighPain } from "@/lib/clinical-notifications";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const HIGH_PAIN_THRESHOLD = 7;
const MAX_PATIENT_COMMENT_LENGTH = 500;

export type PatientExerciseCompletion = {
  log_id: string;
  patient_id: string;
  plan_exercise_id: string;
  completed: boolean;
  pain_score: number;
  comment: string | null;
  completed_at: string;
  completed_on: string;
  was_created: boolean;
  previous_pain_score: number | null;
  high_pain_alert_triggered: boolean;
};

export type CompletePatientExerciseInput = {
  planExerciseId: unknown;
  painScore: unknown;
  comment?: unknown;
};

type CompletionRpcRow = Omit<PatientExerciseCompletion, "high_pain_alert_triggered">;

function mapCompletionError(error: { code?: string; message?: string } | null | undefined) {
  if (error?.code === "42501") {
    return fail<PatientExerciseCompletion>(
      "FORBIDDEN",
      "Ky ushtrim nuk është pjesë e planit aktiv të pacientit.",
    );
  }
  if (error?.code === "22023" || error?.code === "22001") {
    return fail<PatientExerciseCompletion>(
      "VALIDATION_ERROR",
      "Të dhënat e ushtrimit nuk janë valide.",
    );
  }
  return fail<PatientExerciseCompletion>(
    "DATABASE_ERROR",
    "Ushtrimi nuk mund të regjistrohet. Provo përsëri.",
  );
}

export async function recordPatientExerciseCompletion(
  patient: ActivePatientSession,
  input: CompletePatientExerciseInput,
): Promise<BackendResult<PatientExerciseCompletion>> {
  const exerciseIdResult = validateUuid(input.planExerciseId, "planExerciseId");
  if (!exerciseIdResult.ok) {
    return fail("VALIDATION_ERROR", exerciseIdResult.error.message, {
      fieldErrors: exerciseIdResult.error.fieldErrors,
    });
  }

  const painResult = validatePainScore(input.painScore);
  if (!painResult.ok) {
    return fail("VALIDATION_ERROR", painResult.error.message, {
      fieldErrors: painResult.error.fieldErrors,
    });
  }

  const rawComment = String(input.comment ?? "").trim();
  if (rawComment.length > MAX_PATIENT_COMMENT_LENGTH) {
    return fail("VALIDATION_ERROR", "Komenti është shumë i gjatë.", {
      fieldErrors: { comment: `Lejohen deri në ${MAX_PATIENT_COMMENT_LENGTH} karaktere.` },
    });
  }
  const comment = cleanText(rawComment, MAX_PATIENT_COMMENT_LENGTH) || null;

  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("DATABASE_ERROR", "Databaza nuk është konfiguruar.");

  const { data, error } = await supabase.rpc("record_patient_exercise_completion", {
    p_patient_id: patient.id,
    p_plan_exercise_id: exerciseIdResult.data,
    p_pain_score: painResult.data,
    p_comment: comment,
  });

  if (error) return mapCompletionError(error);

  const row = (data as CompletionRpcRow[] | null)?.[0];
  if (!row) return fail("DATABASE_ERROR", "Regjistrimi i ushtrimit nuk u konfirmua.");

  const crossedHighPainThreshold =
    row.pain_score >= HIGH_PAIN_THRESHOLD &&
    (row.was_created || row.previous_pain_score === null || row.previous_pain_score < HIGH_PAIN_THRESHOLD);

  if (crossedHighPainThreshold) {
    await notifyPhysioHighPain({
      supabase,
      patientId: patient.id,
      painScore: row.pain_score,
      comment: row.comment,
    });
  }

  await writeAuditEvent({
    actorRole: "patient",
    action: row.was_created ? "exercise.completed" : "exercise.completion_updated",
    entityType: "exercise_log",
    entityId: row.log_id,
    after: {
      patient_id: row.patient_id,
      plan_exercise_id: row.plan_exercise_id,
      pain_score: row.pain_score,
      completed_on: row.completed_on,
      has_comment: Boolean(row.comment),
      high_pain_alert_triggered: crossedHighPainThreshold,
    },
  });

  return ok({
    ...row,
    high_pain_alert_triggered: crossedHighPainThreshold,
  });
}
