import test from "node:test";
import assert from "node:assert/strict";
import {
  canEnterWorkspace,
  canTransitionPlan,
  patientCanSeePlan,
  subscriptionIsActive,
} from "../../lib/backend/domain.ts";

test("only active known workspace roles can enter", () => {
  assert.equal(canEnterWorkspace("owner", "active"), true);
  assert.equal(canEnterWorkspace("admin", "active"), true);
  assert.equal(canEnterWorkspace("physio", "active"), true);
  assert.equal(canEnterWorkspace("physio", "pending"), false);
  assert.equal(canEnterWorkspace("physio", "suspended"), false);
  assert.equal(canEnterWorkspace("patient", "active"), false);
});

test("plan state machine allows only defined clinical transitions", () => {
  assert.equal(canTransitionPlan("draft", "pending_review"), true);
  assert.equal(canTransitionPlan("pending_review", "approved"), true);
  assert.equal(canTransitionPlan("approved", "active"), true);
  assert.equal(canTransitionPlan("active", "completed"), true);
  assert.equal(canTransitionPlan("active", "draft"), false);
  assert.equal(canTransitionPlan("archived", "active"), false);
  assert.equal(canTransitionPlan("draft", "completed"), false);
});

test("patients can see active plans only", () => {
  for (const status of ["draft", "pending_review", "approved", "paused", "completed", "archived"]) {
    assert.equal(patientCanSeePlan(status), false, `${status} must stay hidden`);
  }
  assert.equal(patientCanSeePlan("active"), true);
});

test("subscription requires active status and a future valid end date", () => {
  const now = new Date("2026-07-10T12:00:00.000Z");
  assert.equal(subscriptionIsActive("active", "2026-08-10T12:00:00.000Z", now), true);
  assert.equal(subscriptionIsActive("active", "2026-07-10T11:59:59.000Z", now), false);
  assert.equal(subscriptionIsActive("suspended", "2026-08-10T12:00:00.000Z", now), false);
  assert.equal(subscriptionIsActive("active", "invalid-date", now), false);
  assert.equal(subscriptionIsActive("active", null, now), false);
});
