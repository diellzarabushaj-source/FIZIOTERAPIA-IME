import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const accessSource = await readFile(new URL("../../lib/backend/access.ts", import.meta.url), "utf8");
const patientsSource = await readFile(new URL("../../lib/backend/patients.ts", import.meta.url), "utf8");
const duplicateRouteSource = await readFile(
  new URL("../../app/api/physio/patients/check-duplicate/route.ts", import.meta.url),
  "utf8",
);
const newPatientPageSource = await readFile(
  new URL("../../app/physiotherapist-portal/patients/new/page.tsx", import.meta.url),
  "utf8",
);

test("patient creation always assigns the logged-in physiotherapist profile", () => {
  assert.match(patientsSource, /p_physio_id:\s*actor\.profileId/);
  assert.doesNotMatch(patientsSource, /p_physio_id:\s*input\./);
});

test("duplicate checks are isolated to the logged-in physiotherapist", () => {
  assert.match(duplicateRouteSource, /\.eq\("physio_id",\s*actor\.profileId\)/);
});

test("physiotherapists cannot access patients owned by another physiotherapist", () => {
  assert.match(
    accessSource,
    /resourcePhysioId\s*&&\s*resourcePhysioId\s*===\s*actor\.profileId/,
  );
});

test("the new patient screen is restricted to physio role and explains self-assignment", () => {
  assert.match(newPatientPageSource, /actor\.role\s*!==\s*"physio"/);
  assert.match(newPatientPageSource, /lidhet automatikisht vetëm me profilin tënd/);
  assert.match(newPatientPageSource, /Nuk mund të caktohet ose transferohet/);
});
