"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordPatientExerciseCompletion } from "@/lib/backend/patient-activity";
import {
  PATIENT_SESSION_REGISTRY_COOKIE,
  revokePatientSession,
} from "@/lib/backend/patient-sessions";
import { requireCurrentPatientSession } from "@/lib/patient-session";
import {
  PATIENT_CODE_COOKIE,
  PATIENT_SESSION_COOKIE,
  PATIENT_USERNAME_COOKIE,
} from "@/lib/backend-logic";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function patientLogoutAction() {
  const cookieStore = await cookies();
  const registryToken = cookieStore.get(PATIENT_SESSION_REGISTRY_COOKIE)?.value || "";
  const supabase = getSupabaseAdmin();

  if (registryToken && supabase) {
    await revokePatientSession({
      supabase,
      token: registryToken,
      reason: "patient_logout",
    }).catch(() => false);
  }

  cookieStore.delete(PATIENT_USERNAME_COOKIE);
  cookieStore.delete(PATIENT_CODE_COOKIE);
  cookieStore.delete(PATIENT_SESSION_COOKIE);
  cookieStore.delete(PATIENT_SESSION_REGISTRY_COOKIE);
  redirect("/patient-portal");
}

export async function completeExerciseAction(formData: FormData) {
  const patient = await requireCurrentPatientSession();
  const planExerciseId = String(formData.get("planExerciseId") || "");
  const nextExerciseId = String(formData.get("nextExerciseId") || "");
  const painScore = Number(formData.get("painScore"));

  const result = await recordPatientExerciseCompletion(patient, {
    planExerciseId,
    painScore: formData.get("painScore"),
    comment: formData.get("comment"),
  });

  if (result.ok === false) {
    redirect(`/patient-dashboard?error=${encodeURIComponent(result.error.code)}#exercise-${encodeURIComponent(planExerciseId)}`);
  }

  revalidatePath("/patient-dashboard");

  const target = painScore >= 7
    ? "physio-contact"
    : nextExerciseId
      ? `exercise-${encodeURIComponent(nextExerciseId)}`
      : "today-complete";

  redirect(`/patient-dashboard?done=${encodeURIComponent(planExerciseId)}#${target}`);
}
