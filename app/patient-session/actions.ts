"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notifyPhysioHighPain } from "@/lib/clinical-notifications";
import {
  getActivePatientBySignedCode,
  HIGH_PAIN_THRESHOLD,
  MAX_PATIENT_COMMENT_LENGTH,
  parseBoundedNumber,
  parseOptionalText,
  PATIENT_CODE_COOKIE,
  PATIENT_SESSION_COOKIE,
  requireAssignedPlanExercise,
} from "@/lib/backend-logic";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";

async function requireCurrentPatient() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key is missing.");

  const cookieStore = await cookies();
  const code = normalizePatientCode(cookieStore.get(PATIENT_CODE_COOKIE)?.value || "");
  const signature = cookieStore.get(PATIENT_SESSION_COOKIE)?.value || "";
  if (!code) redirect("/patient-portal");

  const patient = await getActivePatientBySignedCode({ supabase, code, signature });
  if (!patient) redirect("/patient-portal");
  return { supabase, patient };
}

export async function completeSessionExerciseAction(formData: FormData) {
  const { supabase, patient } = await requireCurrentPatient();
  const planExerciseId = String(formData.get("planExerciseId") || "");
  const painScore = parseBoundedNumber(formData.get("painScore"), null, 0, 10, "Dhimbja");
  const difficulty = parseBoundedNumber(formData.get("difficulty"), 3, 1, 5, "Vështirësia");
  const mood = parseOptionalText(formData.get("mood"), 80);
  const comment = parseOptionalText(formData.get("comment"), MAX_PATIENT_COMMENT_LENGTH);

  if (!planExerciseId) throw new Error("Ushtrimi është i detyrueshëm.");
  await requireAssignedPlanExercise({ supabase, patientId: patient.id, planExerciseId });

  const metadata = [
    mood ? `Gjendja para seancës: ${mood}` : "",
    difficulty ? `Vështirësia: ${difficulty}/5` : "",
    comment || "",
  ].filter(Boolean).join(" · ");

  const { error } = await supabase.from("exercise_logs").insert({
    patient_id: patient.id,
    plan_exercise_id: planExerciseId,
    completed: true,
    pain_score: painScore,
    comment: metadata || null,
    completed_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  if (painScore !== null && painScore >= HIGH_PAIN_THRESHOLD) {
    await notifyPhysioHighPain({
      supabase,
      patientId: patient.id,
      painScore,
      comment: metadata || null,
    });
  }

  revalidatePath("/patient-session");
  revalidatePath("/patient-dashboard");
}

export async function skipSessionExerciseAction(formData: FormData) {
  const { supabase, patient } = await requireCurrentPatient();
  const planExerciseId = String(formData.get("planExerciseId") || "");
  const reason = parseOptionalText(formData.get("reason") || "Pacienti e kaloi ushtrimin.", MAX_PATIENT_COMMENT_LENGTH);
  const mood = parseOptionalText(formData.get("mood"), 80);

  if (!planExerciseId) throw new Error("Ushtrimi është i detyrueshëm.");
  await requireAssignedPlanExercise({ supabase, patientId: patient.id, planExerciseId });

  const { error } = await supabase.from("exercise_logs").insert({
    patient_id: patient.id,
    plan_exercise_id: planExerciseId,
    completed: false,
    pain_score: null,
    comment: [mood ? `Gjendja para seancës: ${mood}` : "", `Skipped: ${reason}`].filter(Boolean).join(" · "),
    completed_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/patient-session");
  revalidatePath("/patient-dashboard");
}
