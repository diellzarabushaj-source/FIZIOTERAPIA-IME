import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("patient list searches in Supabase, paginates, and masks access codes", async () => {
  const page = await source("app/physiotherapist-portal/patients/page.tsx");

  assert.match(page, /const PAGE_SIZE = 25/);
  assert.match(page, /\.range\(from, to\)/);
  assert.match(page, /query = query\.or/);
  assert.match(page, /maskPatientCode\(patient\.patient_code\)/);
  assert.match(page, /rel="noopener noreferrer"/);
  assert.doesNotMatch(page, /\(data \|\| \[\]\)\.filter/);
});

test("patient record summary does not fetch the full clinical session history", async () => {
  const page = await source("app/physiotherapist-portal/patients/[patientId]/page.tsx");

  assert.match(page, /count: "exact", head: true/);
  assert.match(page, /\.limit\(1\)/);
  assert.match(page, /Promise\.all/);
});

test("patient history scopes physios but allows authorized owner and admin views", async () => {
  const history = await source("lib/backend/patient-history.ts");

  assert.match(history, /if \(actor\.role === "physio"\)/);
  assert.match(history, /sessionsQuery = sessionsQuery\.eq\("physio_id", actor\.profileId\)/);
  assert.match(history, /plansQuery = plansQuery\.eq\("physio_id", actor\.profileId\)/);
  assert.match(history, /\.eq\("entity_type", "patient"\)/);
  assert.match(history, /patient\.access_code_rotated/);
});
