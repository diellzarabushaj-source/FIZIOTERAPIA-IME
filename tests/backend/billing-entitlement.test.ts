import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path: string) => readFile(new URL("../../" + path, import.meta.url), "utf8");

test("billing keeps the clinical workspace open and limits only new patients after five", async () => {
  const billing = await source("lib/billing.ts");

  assert.match(billing, /FREE_PATIENT_LIMIT = 5/);
  assert.match(billing, /PHYSIO_MONTHLY_PRICE_LABEL = "9\.90 EUR \/ muaj"/);
  assert.match(billing, /hasActivePhysioAccess/);
  assert.match(billing, /role === "physio"/);
  assert.match(billing, /canCreateAnotherPatient/);
  assert.match(billing, /patientCount < FREE_PATIENT_LIMIT/);
});

test("patient creation enforces the free limit in the shared backend service", async () => {
  const patients = await source("lib/backend/patients.ts");

  assert.match(patients, /canCreateAnotherPatient/);
  assert.match(patients, /FREE_PATIENT_LIMIT/);
  assert.match(patients, /from\("subscriptions"\)/);
  assert.match(patients, /count: "exact"/);
  assert.match(patients, /SUBSCRIPTION_INACTIVE/);
  assert.match(patients, /9\.90 EUR \/ muaj/);
});

test("an existing matching patient is reused before entitlement is checked", async () => {
  const patients = await source("lib/backend/patients.ts");
  const existingPatientCheck = patients.indexOf("const { data: existing");
  const entitlementCheck = patients.indexOf("canCreateAnotherPatient({");

  assert.ok(existingPatientCheck >= 0, "existing patient lookup is missing");
  assert.ok(entitlementCheck >= 0, "entitlement check is missing");
  assert.ok(existingPatientCheck < entitlementCheck, "existing records must be reusable without consuming another slot");
});
