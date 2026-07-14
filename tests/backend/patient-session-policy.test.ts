import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluatePatientSessionPolicy,
  PATIENT_SESSION_IDLE_TIMEOUT_SECONDS,
  PATIENT_SESSION_TOUCH_INTERVAL_SECONDS,
} from "../../lib/backend/patient-session-policy.ts";

const now = new Date("2026-07-14T08:00:00.000Z");

function isoBefore(seconds: number) {
  return new Date(now.getTime() - seconds * 1000).toISOString();
}

function isoAfter(seconds: number) {
  return new Date(now.getTime() + seconds * 1000).toISOString();
}

test("fresh active patient sessions remain valid without a database touch", () => {
  assert.deepEqual(
    evaluatePatientSessionPolicy(
      {
        expiresAt: isoAfter(3600),
        lastUsedAt: isoBefore(60),
        revokedAt: null,
      },
      now,
    ),
    { valid: true, shouldTouch: false, revokeReason: null },
  );
});

test("active sessions are touched only after the rolling touch interval", () => {
  const decision = evaluatePatientSessionPolicy(
    {
      expiresAt: isoAfter(3600),
      lastUsedAt: isoBefore(PATIENT_SESSION_TOUCH_INTERVAL_SECONDS),
      revokedAt: null,
    },
    now,
  );

  assert.deepEqual(decision, {
    valid: true,
    shouldTouch: true,
    revokeReason: null,
  });
});

test("idle sessions fail closed and are marked for revocation", () => {
  const decision = evaluatePatientSessionPolicy(
    {
      expiresAt: isoAfter(3600),
      lastUsedAt: isoBefore(PATIENT_SESSION_IDLE_TIMEOUT_SECONDS),
      revokedAt: null,
    },
    now,
  );

  assert.deepEqual(decision, {
    valid: false,
    shouldTouch: false,
    revokeReason: "idle_timeout",
  });
});

test("expired sessions fail closed and are marked for cleanup", () => {
  assert.deepEqual(
    evaluatePatientSessionPolicy(
      {
        expiresAt: now.toISOString(),
        lastUsedAt: isoBefore(60),
        revokedAt: null,
      },
      now,
    ),
    { valid: false, shouldTouch: false, revokeReason: "expired" },
  );
});

test("already revoked sessions remain invalid without a second revoke", () => {
  assert.deepEqual(
    evaluatePatientSessionPolicy(
      {
        expiresAt: isoAfter(3600),
        lastUsedAt: isoBefore(60),
        revokedAt: isoBefore(30),
      },
      now,
    ),
    { valid: false, shouldTouch: false, revokeReason: null },
  );
});

test("corrupt timestamps fail closed", () => {
  assert.deepEqual(
    evaluatePatientSessionPolicy(
      {
        expiresAt: "not-a-date",
        lastUsedAt: isoBefore(60),
        revokedAt: null,
      },
      now,
    ),
    { valid: false, shouldTouch: false, revokeReason: "invalid_timestamp" },
  );
});
