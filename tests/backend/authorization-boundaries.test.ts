import assert from "node:assert/strict";
import test from "node:test";
import {
  actorCanAccessPhysioResource,
  assertPhysioResourceAccess,
  canEnterWorkspace,
  isOwnerOrAdmin,
} from "../../lib/backend/domain.ts";

test("only active recognized roles can enter the workspace", () => {
  assert.equal(canEnterWorkspace("owner", "active"), true);
  assert.equal(canEnterWorkspace("admin", "active"), true);
  assert.equal(canEnterWorkspace("physio", "active"), true);
  assert.equal(canEnterWorkspace("physio", "suspended"), false);
  assert.equal(canEnterWorkspace("physio", "pending"), false);
  assert.equal(canEnterWorkspace("unknown", "active"), false);
});

test("owner and admin are privileged but physio is not", () => {
  assert.equal(isOwnerOrAdmin("owner"), true);
  assert.equal(isOwnerOrAdmin("admin"), true);
  assert.equal(isOwnerOrAdmin("physio"), false);
});

test("physiotherapists can access only resources assigned to their own profile", () => {
  assert.equal(actorCanAccessPhysioResource("physio", "physio-a", "physio-a"), true);
  assert.equal(actorCanAccessPhysioResource("physio", "physio-a", "physio-b"), false);
  assert.equal(actorCanAccessPhysioResource("physio", "physio-a", null), false);
});

test("owner and admin can access physiotherapist resources", () => {
  assert.equal(actorCanAccessPhysioResource("owner", "owner-a", "physio-b"), true);
  assert.equal(actorCanAccessPhysioResource("admin", "admin-a", "physio-b"), true);
});

test("resource access assertion fails closed for cross-physio access", () => {
  assert.doesNotThrow(() => assertPhysioResourceAccess("physio", "physio-a", "physio-a", "patient"));
  assert.throws(
    () => assertPhysioResourceAccess("physio", "physio-a", "physio-b", "patient"),
    /Forbidden patient access/,
  );
});
