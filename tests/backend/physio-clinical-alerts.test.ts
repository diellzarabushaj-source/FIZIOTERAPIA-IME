import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("clinical alert resolution checks ownership and writes audit evidence", async () => {
  const service = await source("lib/backend/clinical-alerts.ts");
  const resolution = service.slice(service.indexOf("export async function resolveClinicalAlertForActor"));

  assert.match(resolution, /validateUuid\(alertIdInput, "alertId"\)/);
  assert.match(resolution, /actorCanAccessPhysioResource\(actor, existing\.physio_id\)/);
  assert.match(resolution, /status: "resolved"/);
  assert.match(resolution, /resolved_by: actor\.profileId/);
  assert.match(resolution, /action: "clinical_alert\.resolved"/);
});

test("high pain notifications point to the durable alerts workspace", async () => {
  const service = await source("lib/backend/clinical-alerts.ts");

  assert.match(service, /link: "\/physiotherapist-portal\/alerts"/);
  assert.doesNotMatch(service, /physiotherapist-portal#alerts/);
});

test("alert server actions revalidate overview and patient record", async () => {
  const actions = await source("app/physiotherapist-portal/alerts/actions.ts");

  assert.match(actions, /acknowledgeClinicalAlertForActor/);
  assert.match(actions, /resolveClinicalAlertForActor/);
  assert.match(actions, /revalidatePath\("\/physiotherapist-portal\/overview"\)/);
  assert.match(actions, /patients\/\$\{patientId\}/);
});

test("alerts page exposes open acknowledged and resolved states", async () => {
  const page = await source("app/physiotherapist-portal/alerts/page.tsx");

  assert.match(page, /Të hapura/);
  assert.match(page, /Të parë/);
  assert.match(page, /Të zgjidhura/);
  assert.match(page, /acknowledgeClinicalAlertAction/);
  assert.match(page, /resolveClinicalAlertAction/);
  assert.match(page, /href={`\/physiotherapist-portal\/patients\/\$\{alert\.patient_id\}`}/);
});
