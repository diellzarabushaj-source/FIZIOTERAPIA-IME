import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("patient record reads only current patient_sessions columns", async () => {
  const page = await read("app/physiotherapist-portal/patients/[patientId]/page.tsx");

  assert.match(page, /treatment_summary/);
  assert.match(page, /clinical_notes/);
  assert.match(page, /next_steps/);
  assert.match(page, /order\("session_date"/);
  assert.doesNotMatch(page, /session_number/);
  assert.doesNotMatch(page, /\.order\("session_number"/);
});

test("patient history uses the same production session schema", async () => {
  const history = await read("lib/backend/patient-history.ts");

  assert.match(history, /treatment_summary/);
  assert.match(history, /clinical_notes/);
  assert.match(history, /next_steps/);
  assert.match(history, /\.eq\("physio_id", actor\.profileId\)/);
  assert.doesNotMatch(history, /session_number/);
});

test("session save action writes current columns and no legacy RPC", async () => {
  const actions = await read("app/physiotherapist-portal/patients/actions.ts");
  const migration = await read("supabase/migrations/20260710_remove_legacy_patient_session_rpc.sql");

  assert.match(actions, /\.from\("patient_sessions"\)/);
  assert.match(actions, /treatment_summary: treatment/);
  assert.match(actions, /clinical_notes: clinicalNotes/);
  assert.match(actions, /next_steps: nextPlan/);
  assert.doesNotMatch(actions, /create_patient_session_safely/);
  assert.match(migration, /drop function if exists public\.create_patient_session_safely/);
});
