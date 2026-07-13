import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("admin compatibility auth delegates to database-backed owner resolution", async () => {
  const adminAuth = await source("lib/admin-auth.ts");
  const adminLayout = await source("app/admin-dashboard/layout.tsx");

  assert.match(adminAuth, /requireOwnerActor/);
  assert.doesNotMatch(adminAuth, /defaultAdminEmail/);
  assert.doesNotMatch(adminAuth, /userEmail\s*!==\s*adminEmail/);
  assert.match(adminLayout, /requireOwnerActor/);
});

test("physiotherapist compatibility auth never escalates an email to owner", async () => {
  const physioAuth = await source("lib/physio-auth.ts");

  assert.match(physioAuth, /requirePhysioActor/);
  assert.doesNotMatch(physioAuth, /defaultAdminEmail/);
  assert.doesNotMatch(physioAuth, /userEmail\s*===\s*adminEmail/);
  assert.doesNotMatch(physioAuth, /role:\s*["']owner["']/);
});

test("canonical actor resolution requires verified Clerk email and active database profile", async () => {
  const access = await source("lib/backend/access.ts");

  assert.match(access, /verification\?\.status !== "verified"/);
  assert.match(access, /\.from\("profiles"\)/);
  assert.match(access, /canEnterWorkspace/);
  assert.match(access, /link_profile_clerk_identity/);
  assert.match(access, /profile\.clerk_user_id !== user\.id/);
});
