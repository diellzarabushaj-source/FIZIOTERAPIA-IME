import assert from "node:assert/strict";
import test from "node:test";
import { getWorkspaceHome } from "../../lib/backend/workspace-routing.ts";

test("owner is sent directly to the owner dashboard", () => {
  assert.equal(getWorkspaceHome("owner"), "/admin-dashboard");
});

test("physiotherapist is sent directly to the clinical dashboard", () => {
  assert.equal(getWorkspaceHome("physio"), "/physiotherapist-portal/overview");
});

test("admin enters the shared operational workspace instead of an owner-only page", () => {
  assert.equal(getWorkspaceHome("admin"), "/physiotherapist-portal/overview");
});
