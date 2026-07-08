"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const USERNAME_COOKIE = "fizioplan_patient_username";
const CODE_COOKIE = "fizioplan_patient_code";

async function getCurrentPatient() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key is missing.");

  const cookieStore = await cookies();
  const username = cookieStore.get(USERNAME_COOKIE)?.value?.toLowerCase();
  const code = cookieStore.get(CODE_COOKIE)?.value?.toUpperCase();

  if (!username || !code) return null;

  const { data: patient } = await supabase
    .from("patients")
    .select("id,patient_username,patient_code,status")
    .eq("patient_username", username)
    .eq("patient_code", code)
    .eq("status", "active")
    .maybeSingle();

  return patient;
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
  const painScoreRaw = String(formData.get("painScore") || "");
  const comment = String(formData.get("comment") || "").trim();
  const painScore = painScoreRaw === "" ? null : Number(painScoreRaw);

  if (!planExerciseId) throw new Error("Plan exercise is required.");
  if (painScore !== null && (painScore < 0 || painScore > 10)) throw new Error("Pain score must be 0–10.");

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

  revalidatePath("/patient-dashboard");
}

export async function saveAiCheckAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key is missing.");

  const patient = await getCurrentPatient();
  if (!patient) redirect("/patient-portal");

  const planExerciseId = String(formData.get("planExerciseId") || "");
  const score = Number(formData.get("score") || 82);
  const feedback = String(formData.get("feedback") || "Lëvizje e kontrolluar. Mbaje ritmin më të ngadalshëm në fazën e kthimit.");
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

  revalidatePath("/patient-dashboard");
}
