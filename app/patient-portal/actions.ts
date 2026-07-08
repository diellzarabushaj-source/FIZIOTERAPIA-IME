"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const USERNAME_COOKIE = "fizioplan_patient_username";
const CODE_COOKIE = "fizioplan_patient_code";

export async function patientLoginAction(formData: FormData) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase server key is missing.");
  }

  const username = String(formData.get("username") || "").trim().toLowerCase();
  const code = String(formData.get("code") || "").trim().toUpperCase();

  if (!username || !code) {
    redirect("/patient-portal?error=missing");
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("id,patient_username,patient_code,status")
    .eq("patient_username", username)
    .eq("patient_code", code)
    .eq("status", "active")
    .maybeSingle();

  if (!patient) {
    redirect("/patient-portal?error=invalid");
  }

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(USERNAME_COOKIE, username, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  cookieStore.set(CODE_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  redirect("/patient-dashboard");
}
