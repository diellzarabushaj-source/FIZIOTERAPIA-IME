import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("plan builder actions do not require an active subscription", async () => {
  const actions = await source("app/physiotherapist-portal/plan-builder/actions.ts");

  assert.doesNotMatch(actions, /hasActivePhysioAccess/);
  assert.doesNotMatch(actions, /subscription-required/);
  assert.doesNotMatch(actions, /\.from\("subscriptions"\)/);
  assert.match(actions, /requirePhysioActor/);
});

test("the free limit remains enforced when creating the sixth patient", async () => {
  const patients = await source("lib/backend/patients.ts");
  const capacity = await source("src/features/billing/domain/patient-capacity.ts");
  const migration = await source("supabase/migrations/20260713_atomic_patient_capacity.sql");

  assert.match(capacity, /FREE_PATIENT_LIMIT\s*=\s*5/);
  assert.match(patients, /create_or_get_patient_atomic/);
  assert.match(patients, /p_enforce_capacity:\s*actor\.role === "physio"/);
  assert.match(migration, /v_patient_count >= 5/);
  assert.match(migration, /subscription_required/);
  assert.match(migration, /pg_advisory_xact_lock/);
});
