import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { actorCanAccessPhysioResource } from "../../lib/backend/domain.ts";

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
  assert.equal(actorCanAccessPhysioResource("physio", "physio-a", "physio-a"), true);
  assert.equal(actorCanAccessPhysioResource("physio", "physio-a", "physio-b"), false);
  assert.equal(actorCanAccessPhysioResource("physio", "physio-a", null), false);
  assert.equal(actorCanAccessPhysioResource("admin", "admin-a", "physio-b"), true);
  assert.equal(actorCanAccessPhysioResource("owner", "owner-a", "physio-b"), true);
});

test("the new patient screen explains permanent ownership", () => {
  assert.match(newPatientPageSource, /actor\.role\s*!==\s*"physio"/);
  assert.match(newPatientPageSource, /Pacienti lidhet vetëm me profilin tënd/);
  assert.match(newPatientPageSource, /nuk mund të transferohet/);
  assert.match(newPatientPageSource, /vetëm pacientët që ka krijuar vetë/);
});
