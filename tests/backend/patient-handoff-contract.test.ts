import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationPath = "supabase/migrations/20260711_zzz_patient_handoffs.sql";
const servicePath = "lib/backend/patient-handoffs.ts";
const pagePath = "app/physiotherapist-portal/collaboration/page.tsx";

async function source(path: string) {
  return readFile(path, "utf8");
}

test("patient handoffs require explicit consent and two different physiotherapists", async () => {
  const [migration, service, page] = await Promise.all([
    source(migrationPath),
    source(servicePath),
    source(pagePath),
  ]);

  assert.match(migration, /consent_confirmed_at timestamptz not null/);
  assert.match(migration, /check \(from_physio_id <> to_physio_id\)/);
  assert.match(service, /Pëlqimi i pacientit është i detyrueshëm/);
  assert.match(page, /name="consentConfirmed"/);
  assert.match(page, /type="checkbox"/);
});

test("the sender identity comes from the authenticated actor and cannot be forged by the form", async () => {
  const [service, page] = await Promise.all([source(servicePath), source(pagePath)]);

  assert.match(service, /p_from_physio_id: actor\.profileId/);
  assert.doesNotMatch(page, /name="fromPhysioId"/);
  assert.match(service, /actor\.role !== "physio"/);
});

test("handoff acceptance transfers the complete clinical ownership atomically", async () => {
  const migration = await source(migrationPath);

  assert.match(migration, /select \* into v_handoff[\s\S]*for update/);
  assert.match(migration, /select \* into v_patient[\s\S]*for update/);
  assert.match(migration, /update public\.patients[\s\S]*set physio_id = v_handoff\.to_physio_id/);
  assert.match(migration, /update public\.plans[\s\S]*set physio_id = v_handoff\.to_physio_id/);
  assert.match(migration, /update public\.patient_sessions[\s\S]*set physio_id = v_handoff\.to_physio_id/);
  assert.match(migration, /update public\.clinical_alerts[\s\S]*set physio_id = v_handoff\.to_physio_id/);
});

test("recipient acceptance is mandatory and duplicate patients are blocked", async () => {
  const migration = await source(migrationPath);

  assert.match(migration, /if v_handoff\.to_physio_id <> p_recipient_physio_id/);
  assert.match(migration, /if v_handoff\.status <> 'pending'/);
  assert.match(migration, /recipient already has matching patient/);
  assert.match(migration, /patient_handoffs_one_pending_per_patient_idx/);
});

test("handoff database functions are restricted to the service role", async () => {
  const migration = await source(migrationPath);

  for (const functionName of [
    "create_patient_handoff",
    "respond_patient_handoff",
    "cancel_patient_handoff",
  ]) {
    assert.match(migration, new RegExp(`function public\\.${functionName}`));
  }
  assert.match(migration, /service_role required/);
  assert.match(migration, /revoke all on table public\.patient_handoffs from public, anon, authenticated/);
});
