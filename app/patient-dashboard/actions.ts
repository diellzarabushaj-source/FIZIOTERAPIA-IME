"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";
import { notifyPhysioHighPain, notifyPhysioLowAiScore } from "@/lib/clinical-notifications";
import {
  getActivePatientBySignedCode,
  getAiAlertType,
  HIGH_PAIN_THRESHOLD,
  LOW_AI_SCORE_THRESHOLD,
  MAX_AI_FEEDBACK_LENGTH,
  MAX_PATIENT_COMMENT_LENGTH,
  parseBoundedNumber,
  parseOptionalText,
  PATIENT_CODE_COOKIE,
  PATIENT_SESSION_COOKIE,
  PATIENT_USERNAME_COOKIE,
  requireAssignedPlanExercise,
} from "@/lib/backend-logic";

async function getCurrentPatient() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key is missing.");

  const cookieStore = await cookies();
  const code = normalizePatientCode(cookieStore.get(PATIENT_CODE_COOKIE)?.value || "");
  const signature = cookieStore.get(PATIENT_SESSION_COOKIE)?.value || "";

  if (!code) return null;

  return getActivePatientBySignedCode({ supabase, code, signature });
}

export async function patientLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(PATIENT_USERNAME_COOKIE);
  cookieStore.delete(PATIENT_CODE_COOKIE);
  cookieStore.delete(PATIENT_SESSION_COOKIE);
  redirect("/patient-portal");
}

export async function completeExerciseAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key is missing.");

  const patient = await getCurrentPatient();
  if (!patient) redirect("/patient-portal");

  const planExerciseId = String(formData.get("planExerciseId") || "");
  const painScore = parseBoundedNumber(formData.get("painScore"), null, 0, 10, "Dhimbja");
  const comment = parseOptionalText(formData.get("comment"), MAX_PATIENT_COMMENT_LENGTH);

  if (!planExerciseId) throw new Error("Ushtrimi është i detyrueshëm.");

  await requireAssignedPlanExercise({ supabase, patientId: patient.id, planExerciseId });

  await supabase.from("exercise_logs").insert({
    patient_id: patient.id,
    plan_exercise_id: planExerciseId,
    completed: true,
    pain_score: painScore,
    comment: comment || null,
    completed_at: new Date().toISOString(),
  });

  if (painScore !== null && painScore >= HIGH_PAIN_THRESHOLD) {
    await notifyPhysioHighPain({
      supabase,
      patientId: patient.id,
      painScore,
      comment: comment || null,
    });
  }

  revalidatePath("/patient-dashboard");
}

export async function saveAiCheckAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key is missing.");

  const patient = await getCurrentPatient();
  if (!patient) redirect("/patient-portal");

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
