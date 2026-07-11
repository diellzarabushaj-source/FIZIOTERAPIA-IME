"use server";

import { headers } from "next/headers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticatePatientCode } from "@/lib/backend/patient-login";
import {
  createPatientSession,
  patientSessionRegistryEnabled,
  PATIENT_SESSION_REGISTRY_COOKIE,
} from "@/lib/backend/patient-sessions";
import {
  PATIENT_CODE_COOKIE,
  PATIENT_SESSION_COOKIE,
  PATIENT_SESSION_MAX_AGE_SECONDS,
  PATIENT_USERNAME_COOKIE,
  signPatientCode,
} from "@/lib/backend-logic";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function patientLoginAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key is missing.");

  const requestHeaders = await headers();
  const ipAddress = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = requestHeaders.get("user-agent");
  const result = await authenticatePatientCode({
    supabase,
    rawCode: formData.get("code"),
    ipAddress,
  });

  if (result.ok === false) {
    if (result.reason === "misconfigured") throw new Error("Patient login protection is not configured.");
    redirect(`/patient-portal?error=${encodeURIComponent(result.reason)}`);
  }

  const patient = result.patient;
  const registryEnabled = patientSessionRegistryEnabled();
  const registryToken = registryEnabled
    ? await createPatientSession({
        supabase,
        patientId: patient.id,
        ipAddress,
        userAgent,
      })
    : null;

  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: PATIENT_SESSION_MAX_AGE_SECONDS,
    path: "/",
  };

  cookieStore.set(PATIENT_CODE_COOKIE, patient.patient_code, cookieOptions);
  cookieStore.set(PATIENT_SESSION_COOKIE, signPatientCode(patient.patient_code), cookieOptions);
  if (patient.patient_username) cookieStore.set(PATIENT_USERNAME_COOKIE, patient.patient_username, cookieOptions);
  if (registryToken) cookieStore.set(PATIENT_SESSION_REGISTRY_COOKIE, registryToken, cookieOptions);
  else cookieStore.delete(PATIENT_SESSION_REGISTRY_COOKIE);

  redirect("/patient-dashboard");
}
