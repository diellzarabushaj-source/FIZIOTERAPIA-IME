import assert from "node:assert/strict";
import test from "node:test";
import {
  canAccessOwnedClinicalResource,
  canEnterProtectedWorkspace,
  canManageBilling,
  canManagePlatform,
  type Actor,
} from "../../src/server/permissions/policy.ts";

const owner: Actor = { profileId: "owner-1", role: "owner", state: "active" };
const admin: Actor = { profileId: "admin-1", role: "admin", state: "active" };
const physioA: Actor = { profileId: "physio-a", role: "physio", state: "active" };
const physioB: Actor = { profileId: "physio-b", role: "physio", state: "active" };

test("only active profiles enter protected workspaces", () => {
  assert.equal(canEnterProtectedWorkspace(physioA), true);
  for (const state of ["pending", "inactive", "suspended", "blocked", "deleted"] as const) {
    assert.equal(canEnterProtectedWorkspace({ ...physioA, state }), false, `${state} must fail closed`);
  }
  assert.equal(canEnterProtectedWorkspace(null), false);
});

test("owner and admin can manage platform and billing", () => {
  assert.equal(canManagePlatform(owner), true);
  assert.equal(canManagePlatform(admin), true);
  assert.equal(canManageBilling(owner), true);
  assert.equal(canManageBilling(admin), true);
  assert.equal(canManagePlatform(physioA), false);
});

test("physiotherapist can access only owned clinical resources", () => {
  assert.equal(canAccessOwnedClinicalResource(physioA, { physioId: "physio-a" }), true);
  assert.equal(canAccessOwnedClinicalResource(physioA, { physioId: "physio-b" }), false);
  assert.equal(canAccessOwnedClinicalResource(physioB, { physioId: "physio-a" }), false);
  assert.equal(canAccessOwnedClinicalResource(physioA, { physioId: null }), false);
});

test("suspended actors fail closed even for owned resources", () => {
  assert.equal(
    canAccessOwnedClinicalResource({ ...physioA, state: "suspended" }, { physioId: "physio-a" }),
    false,
  );
});
