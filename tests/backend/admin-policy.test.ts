import assert from "node:assert/strict";
import test from "node:test";
import {
  canManageOwnerBilling,
  ownerBillingDenialMessage,
} from "../../lib/backend/admin-policy.ts";

test("only the owner can perform billing and subscription mutations", () => {
  assert.equal(canManageOwnerBilling("owner"), true);
  assert.equal(canManageOwnerBilling("admin"), false);
  assert.equal(canManageOwnerBilling("physio"), false);
  assert.equal(canManageOwnerBilling(undefined), false);
});

test("denied roles receive a safe owner-only explanation", () => {
  assert.equal(ownerBillingDenialMessage("owner"), "");
  assert.match(ownerBillingDenialMessage("admin"), /vetëm për owner-in/);
  assert.match(ownerBillingDenialMessage("physio"), /vetëm për owner-in/);
});
