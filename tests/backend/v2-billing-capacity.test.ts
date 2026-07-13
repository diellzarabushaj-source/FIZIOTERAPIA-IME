import assert from "node:assert/strict";
import test from "node:test";
import {
  FREE_PATIENT_LIMIT,
  evaluatePatientCreationCapacity,
} from "../../src/features/billing/domain/patient-capacity.ts";

const now = new Date("2026-07-13T12:00:00.000Z");

test("allows patient creation from zero through the fifth free slot", () => {
  for (let count = 0; count < FREE_PATIENT_LIMIT; count += 1) {
    const decision = evaluatePatientCreationCapacity({
      currentPatientCount: count,
      subscription: { status: "inactive" },
      now,
    });

    assert.equal(decision.allowed, true);
    assert.equal(decision.reason, "within_free_limit");
  }
});

test("blocks patient six without an active subscription", () => {
  assert.deepEqual(
    evaluatePatientCreationCapacity({
      currentPatientCount: FREE_PATIENT_LIMIT,
      subscription: { status: "inactive" },
      now,
    }),
    {
      allowed: false,
      reason: "subscription_required",
      remainingFreeSlots: 0,
    },
  );
});

test("allows patient six with a future active subscription", () => {
  const decision = evaluatePatientCreationCapacity({
    currentPatientCount: FREE_PATIENT_LIMIT,
    subscription: { status: "active", expiresAt: new Date("2026-08-13T12:00:00.000Z") },
    now,
  });

  assert.equal(decision.allowed, true);
  assert.equal(decision.reason, "active_subscription");
});

test("treats an expired active record as subscription required", () => {
  const decision = evaluatePatientCreationCapacity({
    currentPatientCount: FREE_PATIENT_LIMIT,
    subscription: { status: "active", expiresAt: now },
    now,
  });

  assert.equal(decision.allowed, false);
});

test("rejects invalid patient counts", () => {
  assert.throws(
    () =>
      evaluatePatientCreationCapacity({
        currentPatientCount: -1,
        subscription: { status: "inactive" },
        now,
      }),
    RangeError,
  );
});
