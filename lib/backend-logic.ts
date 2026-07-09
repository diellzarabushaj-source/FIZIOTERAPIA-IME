import { createHmac, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizePatientCode } from "./supabase-admin";

export const PATIENT_CODE_COOKIE = "fizioplan_patient_code";
export const PATIENT_USERNAME_COOKIE = "fizioplan_patient_username";
export const PATIENT_SESSION_COOKIE = "fizioplan_patient_session";

export const MAX_PATIENT_COMMENT_LENGTH = 500;
export const MAX_AI_FEEDBACK_LENGTH = 600;
export const MAX_CLINICAL_TEXT_LENGTH = 1_500;
export const HIGH_PAIN_THRESHOLD = 7;
export const LOW_AI_SCORE_THRESHOLD = 60;

export type ProfileRole = "owner" | "admin" | "physio";

export type ActivePatientSession = {
  id: string;
  patient_code: string;
  patient_username: string | null;
  status: string | null;
};

export function isAdminRole(role?: string | null) {
  return role === "owner" || role === "admin";
}

export function getPatientSessionSecret() {
  return process.env.PATIENT_SESSION_SECRET || process.env.CLERK_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-only-patient-session-secret";
}

export function signPatientCode(code: string) {
  const normalizedCode = normalizePatientCode(code);
  return createHmac("sha256", getPatientSessionSecret()).update(normalizedCode).digest("hex");
}

export function verifyPatientCodeSignature(code: string, signature?: string | null) {
  if (!code || !signature) return false;

  const expected = signPatientCode(code);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");

  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function parseRequiredText(value: FormDataEntryValue | null, label: string, maxLength = 200) {
  const text = String(value || "").trim();
  if (!text) throw new Error(`${label} është e detyrueshme.`);
  return text.slice(0, maxLength);
}

export function parseOptionalText(value: FormDataEntryValue | null, maxLength = 500) {
  const text = String(value || "").trim();
  return text ? text.slice(0, maxLength) : "";
}

export function parseBoundedNumber(value: FormDataEntryValue | null, fallback: number | null, min: number, max: number, label: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} duhet të jetë ${min}–${max}.`);
  }

  return parsed;
}

export function normalizeFrequency(value: FormDataEntryValue | null) {
  const frequency = parseOptionalText(value, 80);
  return frequency || "Çdo ditë";
}

export function getAiAlertType(score: number) {
  if (score < LOW_AI_SCORE_THRESHOLD) return "contact_physio";
  if (score < 80) return "needs_attention";
  return "good";
}

export async function getActivePatientBySignedCode({
  supabase,
  code,
  signature,
}: {
  supabase: SupabaseClient;
  code: string;
  signature?: string | null;
}) {
  const normalizedCode = normalizePatientCode(code);

  if (!verifyPatientCodeSignature(normalizedCode, signature)) {
    return null;
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("id,patient_username,patient_code,status")
    .eq("patient_code", normalizedCode)
    .eq("status", "active")
    .maybeSingle<ActivePatientSession>();

  return patient || null;
}

export async function requireAssignedPlanExercise({
  supabase,
  patientId,
  planExerciseId,
  aiOnly = false,
}: {
  supabase: SupabaseClient;
  patientId: string;
  planExerciseId: string;
  aiOnly?: boolean;
}) {
  let query = supabase
    .from("plan_exercises")
    .select("id,plans!inner(patient_id),exercise_library(ai_enabled)")
    .eq("id", planExerciseId)
    .eq("plans.patient_id", patientId);

  if (aiOnly) {
    query = query.eq("exercise_library.ai_enabled", true);
  }

  const { data: planExercise } = await query.maybeSingle();

  if (!planExercise) {
    throw new Error(aiOnly ? "Ky ushtrim nuk ka AI check aktiv për këtë pacient." : "Ky ushtrim nuk është caktuar për këtë pacient.");
  }

  return planExercise;
}
