import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("authentication sessions never reuse the clinical patient_sessions table", async () => {
  const [migration, service, overview] = await Promise.all([
    source("supabase/migrations/20260711_patient_session_registry.sql"),
    source("lib/backend/patient-sessions.ts"),
    source("app/physiotherapist-portal/overview/page.tsx"),
  ]);

  assert.match(migration, /create table if not exists public\.patient_auth_sessions/);
  assert.doesNotMatch(migration, /create table if not exists public\.patient_sessions\s*\(/);
  assert.match(service, /PATIENT_AUTH_SESSIONS_TABLE = "patient_auth_sessions"/);
  assert.doesNotMatch(service, /\.from\("patient_sessions"\)/);
  assert.match(overview, /\.from\("patient_sessions"\)/);
  assert.match(overview, /session_date/);
});

test("patient code rotation updates the code and revokes auth sessions atomically", async () => {
  const [migration, action] = await Promise.all([
    source("supabase/migrations/20260711_patient_session_registry.sql"),
    source("app/physiotherapist-portal/patients/access-actions.ts"),
  ]);

  assert.match(migration, /function public\.rotate_patient_access_code/);
  assert.match(migration, /update public\.patient_auth_sessions/);
  assert.match(action, /\.rpc\("rotate_patient_access_code"/);
  assert.doesNotMatch(action, /\.from\("patients"\)\s*\.update/);
  assert.match(action, /registered_sessions_revoked/);
});

test("patient logout revokes the current registered session and clears every auth cookie", async () => {
  const action = await source("app/patient-dashboard/actions.ts");

  assert.match(action, /revokePatientSession/);
  assert.match(action, /cookieStore\.delete\(PATIENT_SESSION_REGISTRY_COOKIE\)/);
  assert.match(action, /cookieStore\.delete\(PATIENT_SESSION_COOKIE\)/);
  assert.match(action, /cookieStore\.delete\(PATIENT_CODE_COOKIE\)/);
});
