"use server";

import { redirect } from "next/navigation";

const TEXT_LIMITS: Record<string, number> = {
  respondent_name: 120,
  respondent_email: 160,
  clinic_name: 160,
  biggest_problem: 1200,
  missing_feature: 1200,
  safety_concern: 1200,
  notes: 1600,
};

const allowedRoles = new Set(["physiotherapist", "clinic_owner", "doctor", "admin"]);
const allowedUseAnswers = new Set(["yes", "maybe_after_changes", "no"]);

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  const text = typeof value === "string" ? value.trim() : "";
  const limit = TEXT_LIMITS[key];
  return limit ? text.slice(0, limit) : text;
}

function requiredString(formData: FormData, key: string, label: string) {
  const value = stringValue(formData, key);
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

function ratingValue(formData: FormData, key: string) {
  const raw = String(formData.get(key) || "").trim();
  const value = Number(raw);

  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error("Rating values must be integers from 1 to 5.");
  }

  return value;
}

function roleValue(formData: FormData) {
  const role = stringValue(formData, "role") || "physiotherapist";
  return allowedRoles.has(role) ? role : "physiotherapist";
}

function wouldUseValue(formData: FormData) {
  const value = stringValue(formData, "would_use_with_real_patient");
  if (!allowedUseAnswers.has(value)) throw new Error("Select whether you would use it with a real patient.");
  return value;
}

function emailValue(formData: FormData) {
  const email = stringValue(formData, "respondent_email");
  if (!email) return "";
  if (!email.includes("@") || email.length > TEXT_LIMITS.respondent_email) throw new Error("Email is not valid.");
  return email;
}

export async function submitPilotFeedback(formData: FormData) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Pilot feedback cannot be saved because Supabase server env vars are missing.");
    redirect("/pilot-feedback/success?status=not-saved");
  }

  const payload = {
    respondent_name: requiredString(formData, "respondent_name", "Name"),
    respondent_email: emailValue(formData),
    clinic_name: stringValue(formData, "clinic_name"),
    role: roleValue(formData),
    patient_creation_score: ratingValue(formData, "patient_creation_score"),
    exercise_assignment_score: ratingValue(formData, "exercise_assignment_score"),
    patient_login_score: ratingValue(formData, "patient_login_score"),
    ai_clarity_score: ratingValue(formData, "ai_clarity_score"),
    report_usefulness_score: ratingValue(formData, "report_usefulness_score"),
    payment_readiness_score: ratingValue(formData, "payment_readiness_score"),
    biggest_problem: requiredString(formData, "biggest_problem", "Biggest problem"),
    missing_feature: stringValue(formData, "missing_feature"),
    safety_concern: stringValue(formData, "safety_concern"),
    would_use_with_real_patient: wouldUseValue(formData),
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
