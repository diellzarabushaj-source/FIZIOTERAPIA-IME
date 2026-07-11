import assert from "node:assert/strict";
import test from "node:test";
import { actorCanAccessPhysioResource, type ActorContext } from "../../lib/backend/access.ts";

function actor(role: ActorContext["role"], profileId: string): ActorContext {
  return {
    profileId,
    clerkUserId: `clerk-${profileId}`,
    email: `${profileId}@example.test`,
    role,
    status: "active",
  };
}

test("a physiotherapist can access only patients assigned to their own profile", () => {
  const physio = actor("physio", "physio-a");

  assert.equal(actorCanAccessPhysioResource(physio, "physio-a"), true);
  assert.equal(actorCanAccessPhysioResource(physio, "physio-b"), false);
  assert.equal(actorCanAccessPhysioResource(physio, null), false);
});

test("another physiotherapist cannot access or take over the patient", () => {
  const assignedPhysio = "physio-a";
  const otherPhysio = actor("physio", "physio-b");

  assert.equal(actorCanAccessPhysioResource(otherPhysio, assignedPhysio), false);
});

test("platform owner and admin retain oversight without changing physio ownership", () => {
  assert.equal(actorCanAccessPhysioResource(actor("owner", "owner-1"), "physio-a"), true);
  assert.equal(actorCanAccessPhysioResource(actor("admin", "admin-1"), "physio-a"), true);
});
