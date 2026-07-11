import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("legacy session compatibility verifies patient ownership before querying", async () => {
  const service = await source("lib/backend/patient-session-summary.ts");
  assert.match(service, /getPatientForActor\(actor, patientId\)/);
  assert.match(service, /isDatabaseSchemaMismatch/);
  assert.match(service, /legacy_read_only/);
  assert.match(service, /\.eq\("patient_id", patientId\)/);
});

test("patient record disables new session writes in legacy mode", async () => {
  const page = await source("app/physiotherapist-portal/patients/[patientId]/page.tsx");
  assert.match(page, /sessionMode === "legacy_read_only"/);
  assert.match(page, /!legacySessionMode && \(/);
  assert.match(page, /Seancat janë në modalitet vetëm-lexim/);
  assert.match(page, /getPatientSessionSummaryForActor/);
});
