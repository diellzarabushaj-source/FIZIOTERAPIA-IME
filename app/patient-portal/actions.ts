"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin, normalizePatientCode } from "@/lib/supabase-admin";
import { PATIENT_CODE_COOKIE, PATIENT_SESSION_COOKIE, PATIENT_USERNAME_COOKIE, signPatientCode } from "@/lib/backend-logic";

export async function patientLoginAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase server key is missing.");
  }

  const code = normalizePatientCode(String(formData.get("code") || ""));

  if (!code) {
    redirect("/patient-portal?error=missing");
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("id,patient_username,patient_code,status")
    .eq("patient_code", code)
    .eq("status", "active")
    .maybeSingle();

  if (!patient) {
    redirect("/patient-portal?error=invalid");
  }

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  };

  cookieStore.set(PATIENT_CODE_COOKIE, patient.patient_code, cookieOptions);
  cookieStore.set(PATIENT_SESSION_COOKIE, signPatientCode(patient.patient_code), cookieOptions);

  if (patient.patient_username) {
    cookieStore.set(PATIENT_USERNAME_COOKIE, patient.patient_username, cookieOptions);
  }

  redirect("/patient-dashboard");
}
