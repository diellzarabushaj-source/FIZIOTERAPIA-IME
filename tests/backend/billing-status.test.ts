import assert from "node:assert/strict";
import test from "node:test";
import {
  FREE_PATIENT_LIMIT,
  PHYSIO_MONTHLY_PRICE_LABEL,
  canCreateAnotherPatient,
  getBillingStatusLabel,
  hasActiveSubscription,
} from "../../lib/billing.ts";

const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const past = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

test("billing constants match the public offer", () => {
  assert.equal(FREE_PATIENT_LIMIT, 5);
  assert.equal(PHYSIO_MONTHLY_PRICE_LABEL, "9.90 EUR / muaj");
});

test("active status requires a non-expired paid period", () => {
  assert.equal(hasActiveSubscription("physio", { status: "active", current_period_end: future }), true);
  assert.equal(hasActiveSubscription("physio", { status: "active", current_period_end: past }), false);
  assert.equal(getBillingStatusLabel({ status: "active", current_period_end: past }), "E skaduar");
});

test("only the sixth patient requires an active subscription", () => {
  assert.equal(canCreateAnotherPatient({ role: "physio", patientCount: 4, subscription: null }), true);
  assert.equal(canCreateAnotherPatient({ role: "physio", patientCount: 5, subscription: null }), false);
  assert.equal(canCreateAnotherPatient({ role: "physio", patientCount: 5, subscription: { status: "active", current_period_end: future } }), true);
});
