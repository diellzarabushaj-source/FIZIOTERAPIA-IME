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
  const billing = await source("lib/billing.ts");

  assert.match(patients, /canCreateAnotherPatient/);
  assert.match(patients, /FREE_PATIENT_LIMIT/);
  assert.match(billing, /FREE_PATIENT_LIMIT\s*=\s*5/);
});
