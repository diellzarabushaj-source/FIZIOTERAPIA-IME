export const PATIENT_SESSION_REGISTRY_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const PATIENT_SESSION_IDLE_TIMEOUT_SECONDS = 60 * 60 * 24;
export const PATIENT_SESSION_TOUCH_INTERVAL_SECONDS = 15 * 60;

export type PatientSessionPolicyInput = {
  expiresAt: string;
  lastUsedAt: string;
  revokedAt: string | null;
};

export type PatientSessionPolicyDecision = {
  valid: boolean;
  shouldTouch: boolean;
  revokeReason: "expired" | "idle_timeout" | "invalid_timestamp" | null;
};

function invalidDecision(
  revokeReason: PatientSessionPolicyDecision["revokeReason"],
): PatientSessionPolicyDecision {
  return { valid: false, shouldTouch: false, revokeReason };
}

/**
 * Evaluates the complete patient-session lifecycle without touching the database.
 * Database code can then apply the returned revoke/touch decision atomically.
 */
export function evaluatePatientSessionPolicy(
  input: PatientSessionPolicyInput,
  now = new Date(),
): PatientSessionPolicyDecision {
  if (input.revokedAt) return invalidDecision(null);

  const nowMs = now.getTime();
  const expiresAtMs = Date.parse(input.expiresAt);
  const lastUsedAtMs = Date.parse(input.lastUsedAt);

  if (
    !Number.isFinite(nowMs) ||
    !Number.isFinite(expiresAtMs) ||
    !Number.isFinite(lastUsedAtMs)
  ) {
    return invalidDecision("invalid_timestamp");
  }

  if (expiresAtMs <= nowMs) return invalidDecision("expired");

  const idleMilliseconds = Math.max(0, nowMs - lastUsedAtMs);
  if (idleMilliseconds >= PATIENT_SESSION_IDLE_TIMEOUT_SECONDS * 1000) {
    return invalidDecision("idle_timeout");
  }

  return {
    valid: true,
    shouldTouch: idleMilliseconds >= PATIENT_SESSION_TOUCH_INTERVAL_SECONDS * 1000,
    revokeReason: null,
  };
}
