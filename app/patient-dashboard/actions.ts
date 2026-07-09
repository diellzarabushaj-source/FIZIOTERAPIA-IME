"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";
import { notifyPhysioHighPain, notifyPhysioLowAiScore } from "@/lib/clinical-notifications";

const USERNAME_COOKIE = "fizioplan_patient_username";
const CODE_COOKIE = "fizioplan_patient_code";
const MAX_PATIENT_COMMENT_LENGTH = 500;
const MAX_AI_FEEDBACK_LENGTH = 600;

async function getCurrentPatient() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key is missing.");

  const cookieStore = await cookies();
  const code = normalizePatientCode(cookieStore.get(CODE_COOKIE)?.value || "");

  if (!code) return null;

  const { data: patient } = await supabase
    .from("patients")
    .select("id,patient_username,patient_code,status")
    .eq("patient_code", code)
    .eq("status", "active")
    .maybeSingle();

  return patient;
}

function parseBoundedNumber(value: FormDataEntryValue | null, fallback: number | null, min: number, max: number, label: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} must be ${min}–${max}.`);
  }

  return parsed;
}

function limitText(value: FormDataEntryValue | null, maxLength: number) {
  return String(value || "").trim().slice(0, maxLength);
}

export async function patientLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(USERNAME_COOKIE);
  cookieStore.delete(CODE_COOKIE);
  redirect("/patient-portal");
}

export async function completeExerciseAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key is missing.");

  const patient = await getCurrentPatient();
  if (!patient) redirect("/patient-portal");

  const planExerciseId = String(formData.get("planExerciseId") || "");
  const painScore = parseBoundedNumber(formData.get("painScore"), null, 0, 10, "Pain score");
  const comment = limitText(formData.get("comment"), MAX_PATIENT_COMMENT_LENGTH);

  if (!planExerciseId) throw new Error("Plan exercise is required.");

  const { data: planExercise } = await supabase
    .from("plan_exercises")
    .select("id,plans!inner(patient_id)")
    .eq("id", planExerciseId)
    .eq("plans.patient_id", patient.id)
    .maybeSingle();

  if (!planExercise) throw new Error("This exercise is not assigned to this patient.");

  await supabase.from("exercise_logs").insert({
    patient_id: patient.id,
    plan_exercise_id: planExerciseId,
    completed: true,
    pain_score: painScore,
    comment: comment || null,
    completed_at: new Date().toISOString(),
  });

  if (painScore !== null && painScore >= 7) {
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
  const feedback = limitText(
    formData.get("feedback") || "Lëvizje e kontrolluar. Mbaje ritmin më të ngadalshëm në fazën e kthimit.",
    MAX_AI_FEEDBACK_LENGTH,
  );
  const alertType = score < 60 ? "contact_physio" : score < 80 ? "needs_attention" : "good";

  if (!planExerciseId) throw new Error("Plan exercise is required.");

  const { data: planExercise } = await supabase
    .from("plan_exercises")
    .select("id,plans!inner(patient_id)")
    .eq("id", planExerciseId)
    .eq("plans.patient_id", patient.id)
    .maybeSingle();

  if (!planExercise) throw new Error("This exercise is not assigned to this patient.");

  await supabase.from("ai_checks").insert({
    patient_id: patient.id,
    plan_exercise_id: planExerciseId,
    score,
    feedback,
    alert_type: alertType,
    created_at: new Date().toISOString(),
  });

  if (score < 60) {
    await notifyPhysioLowAiScore({
      supabase,
      patientId: patient.id,
      score,
      feedback,
    });
  }

  revalidatePath("/patient-dashboard");
}
