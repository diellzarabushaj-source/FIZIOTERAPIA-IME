"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { notifyPhysioLowAiScore } from "@/lib/clinical-notifications";
import { recordPatientExerciseCompletion } from "@/lib/backend/patient-activity";
import { requireCurrentPatientSession } from "@/lib/patient-session";
import {
  getAiAlertType,
  LOW_AI_SCORE_THRESHOLD,
  MAX_AI_FEEDBACK_LENGTH,
  parseBoundedNumber,
  parseOptionalText,
  PATIENT_CODE_COOKIE,
  PATIENT_SESSION_COOKIE,
  PATIENT_USERNAME_COOKIE,
  requireAssignedPlanExercise,
} from "@/lib/backend-logic";

export async function patientLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(PATIENT_USERNAME_COOKIE);
  cookieStore.delete(PATIENT_CODE_COOKIE);
  cookieStore.delete(PATIENT_SESSION_COOKIE);
  redirect("/patient-portal");
}

export async function completeExerciseAction(formData: FormData) {
  const patient = await requireCurrentPatientSession();
  const result = await recordPatientExerciseCompletion(patient, {
    planExerciseId: formData.get("planExerciseId"),
    painScore: formData.get("painScore"),
    comment: formData.get("comment"),
  });

  if (result.ok === false) {
    redirect(`/patient-dashboard?error=${encodeURIComponent(result.error.code)}`);
  }

  revalidatePath("/patient-dashboard");
  revalidatePath("/patient-session");
}

export async function saveAiCheckAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key is missing.");

  const patient = await requireCurrentPatientSession();
  const planExerciseId = String(formData.get("planExerciseId") || "");
  const score = parseBoundedNumber(formData.get("score"), 82, 0, 100, "AI score");
  const feedback = parseOptionalText(
    formData.get("feedback") || "Lëvizje e kontrolluar. Mbaje ritmin më të ngadalshëm në fazën e kthimit.",
    MAX_AI_FEEDBACK_LENGTH,
  );
  const alertType = getAiAlertType(score);

  if (!planExerciseId) throw new Error("Ushtrimi është i detyrueshëm.");

  await requireAssignedPlanExercise({ supabase, patientId: patient.id, planExerciseId, aiOnly: true });

  await supabase.from("ai_checks").insert({
    patient_id: patient.id,
    plan_exercise_id: planExerciseId,
    score,
    feedback,
    alert_type: alertType,
    created_at: new Date().toISOString(),
  });

  if (score < LOW_AI_SCORE_THRESHOLD) {
    await notifyPhysioLowAiScore({
      supabase,
      patientId: patient.id,
      score,
      feedback,
    });
  }

  revalidatePath("/patient-dashboard");
}
