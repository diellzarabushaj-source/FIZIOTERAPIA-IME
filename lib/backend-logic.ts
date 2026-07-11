import { createHmac, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { validatePatientSession } from "./backend/patient-sessions.ts";
import { normalizePatientCode } from "./supabase-admin.ts";

export const PATIENT_CODE_COOKIE = "fizioplan_patient_code";
export const PATIENT_USERNAME_COOKIE = "fizioplan_patient_username";
export const PATIENT_SESSION_COOKIE = "fizioplan_patient_session";
export const PATIENT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const PATIENT_SESSION_SECRET_MIN_LENGTH = 43;

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

export function patientSessionSigningConfigured(env: NodeJS.ProcessEnv = process.env) {
  const secret = env.PATIENT_SESSION_SECRET?.trim() || "";
  if (env.NODE_ENV !== "production") return true;
  return secret.length >= PATIENT_SESSION_SECRET_MIN_LENGTH;
}

export function getPatientSessionSecret(env: NodeJS.ProcessEnv = process.env) {
  const secret = env.PATIENT_SESSION_SECRET?.trim() || "";
  if (secret.length >= PATIENT_SESSION_SECRET_MIN_LENGTH) return secret;
  if (env.NODE_ENV === "production") {
    throw new Error(`PATIENT_SESSION_SECRET must contain at least ${PATIENT_SESSION_SECRET_MIN_LENGTH} characters in production.`);
  }
  return secret || "dev-only-patient-session-secret-change-me";
}

function sessionMac(code: string, expiresAt: number) {
  const normalizedCode = normalizePatientCode(code);
  return createHmac("sha256", getPatientSessionSecret())
    .update(`${normalizedCode}.${expiresAt}`)
    .digest("hex");
}

export function signPatientCode(
  code: string,
  expiresAt = Math.floor(Date.now() / 1000) + PATIENT_SESSION_MAX_AGE_SECONDS,
) {
  return `${expiresAt}.${sessionMac(code, expiresAt)}`;
}

export function verifyPatientCodeSignature(code: string, signature?: string | null) {
  if (!code || !signature || !patientSessionSigningConfigured()) return false;
  const [expiresRaw, mac] = signature.split(".");
  const expiresAt = Number(expiresRaw);
  if (!Number.isInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000) || !mac) return false;

  const expected = sessionMac(code, expiresAt);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(mac, "hex");
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
  sessionToken,
  requireRegisteredSession = false,
}: {
  supabase: SupabaseClient;
  code: string;
  signature?: string | null;
  sessionToken?: string | null;
  requireRegisteredSession?: boolean;
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

  if (!patient) return null;

  if (requireRegisteredSession) {
    const registered = await validatePatientSession({
      supabase,
      patientId: patient.id,
      token: sessionToken,
    });
    if (!registered) return null;
  }

  return patient;
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
    .select("id,plans!inner(patient_id,status),exercise_library(ai_enabled)")
    .eq("id", planExerciseId)
    .eq("plans.patient_id", patientId)
    .eq("plans.status", "active");

  if (aiOnly) {
    query = query.eq("exercise_library.ai_enabled", true);
  }

  const { data: planExercise } = await query.maybeSingle();
  if (!planExercise) {
    throw new Error(aiOnly ? "Ky ushtrim nuk ka AI check aktiv për këtë pacient." : "Ky ushtrim nuk është caktuar në planin aktiv të pacientit.");
  }
  return planExercise;
}
