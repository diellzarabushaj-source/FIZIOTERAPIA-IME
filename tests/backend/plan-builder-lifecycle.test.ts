import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("one server request advances a plan by only one clinical state", async () => {
  const actions = await source("app/physiotherapist-portal/plan-builder/actions.ts");
  const approveAction = actions.slice(actions.indexOf("export async function approveAndSendPlanAction"));

  assert.match(approveAction, /current\.status === "draft"/);
  assert.match(approveAction, /Dërgoje draftin për kontroll/);
  assert.match(approveAction, /current\.status === "pending_review"/);
  assert.match(approveAction, /transitionPlanForActor\(actor, planId, "approved"\)/);
  assert.match(approveAction, /current\.status === "approved"/);
  assert.match(approveAction, /transitionPlanForActor\(actor, planId, "active"\)/);
  assert.doesNotMatch(approveAction, /let plan =/);
});

test("plan builder derives patient context from the authorized plan", async () => {
  const page = await source("app/physiotherapist-portal/plan-builder/page.tsx");

  assert.match(page, /patient = patients\.find\(\(item\) => item\.id === plan\?\.patient_id\)/);
  assert.match(page, /\.eq\("patient_id", plan\.patient_id\)/);
  assert.match(page, /maskedPatientCode\(item\.patient_code\)/);
});

test("active plan opens protected access material instead of logging the clinician in as patient", async () => {
  const page = await source("app/physiotherapist-portal/plan-builder/page.tsx");

  assert.match(page, /href={`\/patient-access\/\$\{encodeURIComponent\(patient\.patient_code\)\}`}/);
  assert.match(page, /rel="noopener noreferrer"/);
  assert.doesNotMatch(page, /href={`\/p\/\$\{encodeURIComponent\(patient\.patient_code\)\}`}/);
  assert.doesNotMatch(page, /Shiko si pacient/);
});

test("rule-based matching is not presented as probabilistic AI", async () => {
  const page = await source("app/physiotherapist-portal/plan-builder/page.tsx");

  assert.match(page, /Sugjerime klinike sipas rregullave/);
  assert.match(page, /përputhje deterministe/);
  assert.doesNotMatch(page, /Sugjerime AI të kontrolluara/);
});
