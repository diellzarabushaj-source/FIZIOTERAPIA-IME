"use server";

import { headers } from "next/headers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";
import {
  PATIENT_CODE_COOKIE,
  PATIENT_SESSION_COOKIE,
  PATIENT_SESSION_MAX_AGE_SECONDS,
  PATIENT_USERNAME_COOKIE,
  signPatientCode,
} from "@/lib/backend-logic";

export async function patientLoginAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase server key is missing.");

  const code = normalizePatientCode(String(formData.get("code") || ""));
  if (!code) redirect("/patient-portal?error=missing");

  const requestHeaders = await headers();
  const ipAddress = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

  const { data: allowed, error: rateError } = await supabase.rpc("check_patient_login_attempt", {
    p_code: code,
    p_ip_address: ipAddress,
  });
  if (rateError) throw new Error("Patient login protection is not configured.");
  if (!allowed) redirect("/patient-portal?error=rate-limited");

  const { data: patient } = await supabase
    .from("patients")
    .select("id,patient_username,patient_code,status")
    .eq("patient_code", code)
    .eq("status", "active")
    .maybeSingle();

  await supabase.rpc("record_patient_login_result", {
    p_code: code,
    p_ip_address: ipAddress,
    p_success: Boolean(patient),
  });

  if (!patient) redirect("/patient-portal?error=invalid");

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

  redirect("/patient-dashboard");
}
