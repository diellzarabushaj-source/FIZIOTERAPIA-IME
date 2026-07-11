import { createHash, createHmac, randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export const PATIENT_SESSION_REGISTRY_COOKIE = "fizioplan_patient_registry";
export const PATIENT_SESSION_REGISTRY_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function patientSessionRegistryEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.PATIENT_SESSION_REGISTRY_ENABLED === "1";
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function hashMetadata(value?: string | null) {
  const normalized = String(value || "").trim();
  const secret = process.env.PATIENT_SESSION_SECRET;
  if (!normalized || !secret) return null;
  return createHmac("sha256", secret).update(normalized).digest("hex");
}

type PatientSessionRow = {
  id: string;
  expires_at: string;
  last_used_at: string;
  revoked_at: string | null;
};

export async function createPatientSession({
  supabase,
  patientId,
  ipAddress,
  userAgent,
}: {
  supabase: SupabaseClient;
  patientId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + PATIENT_SESSION_REGISTRY_MAX_AGE_SECONDS * 1000);

  const { error } = await supabase.from("patient_sessions").insert({
    patient_id: patientId,
    token_hash: hashSessionToken(token),
    created_at: now.toISOString(),
    last_used_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    ip_hash: hashMetadata(ipAddress),
    user_agent_hash: hashMetadata(userAgent),
  });

  if (error) {
    throw new Error("Regjistri i sesionit të pacientit nuk është gati.");
  }

  return token;
}

export async function validatePatientSession({
  supabase,
  patientId,
  token,
}: {
  supabase: SupabaseClient;
  patientId: string;
  token?: string | null;
}) {
  if (!token) return false;

  const now = new Date();
  const { data, error } = await supabase
    .from("patient_sessions")
    .select("id,expires_at,last_used_at,revoked_at")
    .eq("patient_id", patientId)
    .eq("token_hash", hashSessionToken(token))
    .is("revoked_at", null)
    .gt("expires_at", now.toISOString())
    .maybeSingle<PatientSessionRow>();

  if (error || !data) return false;

  const lastUsedAt = Date.parse(data.last_used_at);
  if (!Number.isFinite(lastUsedAt) || now.getTime() - lastUsedAt >= 15 * 60 * 1000) {
    await supabase
      .from("patient_sessions")
      .update({ last_used_at: now.toISOString() })
      .eq("id", data.id)
      .is("revoked_at", null);
  }

  return true;
}

export async function revokePatientSession({
  supabase,
  token,
  reason = "patient_logout",
}: {
  supabase: SupabaseClient;
  token?: string | null;
  reason?: string;
}) {
  if (!token) return false;

  const { data, error } = await supabase
    .from("patient_sessions")
    .update({
      revoked_at: new Date().toISOString(),
      revoked_reason: reason.slice(0, 100),
    })
    .eq("token_hash", hashSessionToken(token))
    .is("revoked_at", null)
    .select("id")
    .maybeSingle<{ id: string }>();

  return !error && Boolean(data);
}

export async function revokeAllPatientSessions({
  supabase,
  patientId,
  reason,
}: {
  supabase: SupabaseClient;
  patientId: string;
  reason: string;
}) {
  const { data, error } = await supabase
    .from("patient_sessions")
    .update({
      revoked_at: new Date().toISOString(),
      revoked_reason: reason.slice(0, 100),
    })
    .eq("patient_id", patientId)
    .is("revoked_at", null)
    .select("id");

  if (error) throw new Error("Sesionet e pacientit nuk mund të revokohen.");
  return Array.isArray(data) ? data.length : 0;
}
