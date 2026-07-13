import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path: string) => readFile(new URL("../../" + path, import.meta.url), "utf8");

test("billing keeps the clinical workspace open and limits only new patients after five", async () => {
  const billing = await source("lib/billing.ts");
  const capacity = await source("src/features/billing/domain/patient-capacity.ts");

  assert.match(capacity, /FREE_PATIENT_LIMIT\s*=\s*5/);
  assert.match(capacity, /PILOT_MONTHLY_PRICE_CENTS\s*=\s*990/);
  assert.match(billing, /hasActivePhysioAccess/);
  assert.match(billing, /role === "physio"/);
  assert.match(billing, /evaluatePatientCreationCapacity/);
});

test("patient creation enforces the free limit inside the atomic database service", async () => {
  const patients = await source("lib/backend/patients.ts");
  const migration = await source("supabase/migrations/20260713_atomic_patient_capacity.sql");

  assert.match(patients, /rpc\("create_or_get_patient_atomic"/);
  assert.match(patients, /p_enforce_capacity:\s*actor\.role === "physio"/);
  assert.match(patients, /SUBSCRIPTION_INACTIVE/);
  assert.match(patients, /9\.90 EUR \/ muaj/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /v_patient_count >= 5/);
  assert.match(migration, /s\.status = 'active'/);
  assert.match(migration, /s\.current_period_end > now\(\)/);
});

test("an existing matching patient is reused before capacity is consumed", async () => {
  const migration = await source("supabase/migrations/20260713_atomic_patient_capacity.sql");
  const existingPatientCheck = migration.indexOf("select p.*");
  const entitlementCheck = migration.indexOf("if p_enforce_capacity then");

  assert.ok(existingPatientCheck >= 0, "existing patient lookup is missing");
  assert.ok(entitlementCheck >= 0, "capacity check is missing");
  assert.ok(existingPatientCheck < entitlementCheck, "existing records must be reusable without consuming another slot");
  assert.match(migration, /'created', false/);
});
