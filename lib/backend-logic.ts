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
    throw new Error(
      `PATIENT_SESSION_SECRET must contain at least ${PATIENT_SESSION_SECRET_MIN_LENGTH} characters in production.`,
    );
  }
  return "fizioplan-dev-only-session-secret-change-me";
}

export function normalizeOptionalText(value: unknown, maxLength = 500) {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, maxLength) : null;
}

export function normalizeRequiredText(value: unknown, maxLength = 500) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export function normalizePainScore(value: unknown) {
  const score = Number(value);
  return Number.isInteger(score) && score >= 0 && score <= 10 ? score : null;
}

export function normalizeAiScore(value: unknown) {
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 100 ? Math.round(score) : null;
}

export function normalizeClinicalText(value: unknown, maxLength = MAX_CLINICAL_TEXT_LENGTH) {
  return normalizeOptionalText(value, maxLength);
}

export function deriveAlertType({ painScore, aiScore, comment }: { painScore?: number | null; aiScore?: number | null; comment?: string | null }) {
  if (typeof painScore === "number" && painScore >= HIGH_PAIN_THRESHOLD) return "high_pain" as const;
  if (typeof aiScore === "number" && aiScore < LOW_AI_SCORE_THRESHOLD) return "low_ai_score" as const;
  if (comment?.trim()) return "patient_message" as const;
  return null;
}

export function signPatientCode(code: string, env: NodeJS.ProcessEnv = process.env) {
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const normalized = normalizePatientCode(code);
  const payload = `${normalized}.${issuedAt}`;
  const signature = createHmac("sha256", getPatientSessionSecret(env)).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifyPatientCodeSignature(value: string, env: NodeJS.ProcessEnv = process.env) {
  const [code, issuedAt, signature] = String(value || "").split(".");
  if (!code || !issuedAt || !signature) return null;
  const normalized = normalizePatientCode(code);
  const issuedAtNumber = Number(issuedAt);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(issuedAtNumber) || issuedAtNumber > now + 60) return null;
  if (now - issuedAtNumber > PATIENT_SESSION_MAX_AGE_SECONDS) return null;
  const payload = `${normalized}.${issuedAt}`;
  const expected = createHmac("sha256", getPatientSessionSecret(env)).update(payload).digest("hex");
  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  return normalized;
}

export async function getActivePatientByCode(supabase: SupabaseClient, code: string) {
  const normalizedCode = normalizePatientCode(code);
  const { data: patient, error } = await supabase
    .from("patients")
    .select("id, patient_code, patient_username, status")
    .eq("patient_code", normalizedCode)
    .eq("status", "active")
    .maybeSingle<ActivePatientSession>();
  if (error || !patient) return null;
  return patient;
}

export async function requireAssignedPlanExercise(
  supabase: SupabaseClient,
  patientId: string,
  planExerciseId: string,
  options: { requireAiEnabled?: boolean } = {},
) {
  const { data, error } = await supabase
    .from("plan_exercises")
    .select("id, plan_id, exercise_id, plans!inner(patient_id,status), exercise_library(ai_enabled)")
    .eq("id", planExerciseId)
    .eq("plans.patient_id", patientId)
    .eq("plans.status", "active")
    .maybeSingle<{
      id: string;
      plan_id: string;
      exercise_id: string;
      plans?: { patient_id?: string; status?: string } | null;
      exercise_library?: { ai_enabled?: boolean } | null;
    }>();
  if (error || !data) return null;
  if (options.requireAiEnabled && data.exercise_library?.ai_enabled !== true) return null;
  return data;
}

export async function validateSignedPatientSession(
  supabase: SupabaseClient,
  signedCode: string,
  registryToken?: string | null,
): Promise<ActivePatientSession | null> {
  const code = verifyPatientCodeSignature(signedCode);
  if (!code) return null;
  const patient = await getActivePatientByCode(supabase, code);
  if (!patient) return null;
  if (registryToken) {
    const validRegistrySession = await validatePatientSession({
      supabase,
      token: registryToken,
      patientId: patient.id,
    });
    if (!validRegistrySession) return null;
  }
  return patient;
}
