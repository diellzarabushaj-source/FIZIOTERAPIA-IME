"use server";

import { redirect } from "next/navigation";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : null;
}

export async function submitPilotFeedback(formData: FormData) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Pilot feedback cannot be saved because Supabase server env vars are missing.");
    redirect("/pilot-feedback/success?status=not-saved");
  }

  const payload = {
    respondent_name: stringValue(formData, "respondent_name"),
    respondent_email: stringValue(formData, "respondent_email"),
    clinic_name: stringValue(formData, "clinic_name"),
    role: stringValue(formData, "role") || "physiotherapist",
    patient_creation_score: numberValue(formData, "patient_creation_score"),
    exercise_assignment_score: numberValue(formData, "exercise_assignment_score"),
    patient_login_score: numberValue(formData, "patient_login_score"),
    ai_clarity_score: numberValue(formData, "ai_clarity_score"),
    report_usefulness_score: numberValue(formData, "report_usefulness_score"),
    payment_readiness_score: numberValue(formData, "payment_readiness_score"),
    biggest_problem: stringValue(formData, "biggest_problem"),
    missing_feature: stringValue(formData, "missing_feature"),
    safety_concern: stringValue(formData, "safety_concern"),
    would_use_with_real_patient: stringValue(formData, "would_use_with_real_patient"),
    notes: stringValue(formData, "notes"),
    source: "pilot-feedback-page",
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/pilot_feedback`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Pilot feedback save failed", details);
    redirect("/pilot-feedback/success?status=not-saved");
  }

  redirect("/pilot-feedback/success?status=saved");
}
