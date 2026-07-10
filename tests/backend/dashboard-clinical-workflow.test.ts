import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path: string): Promise<string> {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("physiotherapist flow redirects into the dashboard", async () => {
  const portalPage = await source("app/physiotherapist-portal/page.tsx");
  assert.match(portalPage, /\/physiotherapist-portal\/overview/);
});

test("patient creation keeps smart duplicate protection", async () => {
  const patientService = await source("lib/backend/patients.ts");
  const newPatientForm = await source("app/physiotherapist-portal/patients/new/NewPatientForm.tsx");
  const duplicateRoute = await source("app/api/physio/patients/check-duplicate/route.ts");

  assert.match(patientService, /create_or_get_patient/);
  assert.match(newPatientForm, /check-duplicate/);
  assert.match(newPatientForm, /Ky pacient ekziston tashmë/);
  assert.match(duplicateRoute, /requirePhysioActor/);
  assert.match(duplicateRoute, /physio_id/);
});

test("patient session form always exposes loading, success and error states", async () => {
  const action = await source("app/physiotherapist-portal/patients/actions.ts");
  const form = await source("app/physiotherapist-portal/patients/[patientId]/SessionForm.tsx");

  assert.match(action, /status: "success"/);
  assert.match(action, /Seanca .*u ruajt me sukses|Seanca u ruajt me sukses/);
  assert.match(action, /create_patient_session_safely/);
  assert.match(form, /Duke ruajtur seancën/);
  assert.match(form, /aria-live/);
  assert.match(form, /fieldErrors/);
});

test("patient profile updates stay on the existing record and are audited", async () => {
  const updateService = await source("lib/backend/patient-profile.ts");
  const editForm = await source("app/physiotherapist-portal/patients/[patientId]/EditPatientForm.tsx");

  assert.match(updateService, /getPatientForActor/);
  assert.match(updateService, /patient\.profile_updated/);
  assert.match(updateService, /23505/);
  assert.match(editForm, /Nuk krijohet pacient i ri/);
  assert.match(editForm, /Duke ruajtur ndryshimet/);
});

test("clinical history remains a separate protected patient page", async () => {
  const historyPage = await source("app/physiotherapist-portal/patients/[patientId]/history/page.tsx");
  const recordNavigation = await source("app/physiotherapist-portal/patients/[patientId]/PatientRecordNav.tsx");

  assert.match(historyPage, /requirePhysioActor/);
  assert.match(historyPage, /getPatientForActor/);
  assert.match(historyPage, /timeline|Historiku klinik|Historia klinike/i);
  assert.match(recordNavigation, /\/history/);
});

test("patient ownership checks remain centralized", async () => {
  const patientService = await source("lib/backend/patients.ts");
  const updateService = await source("lib/backend/patient-profile.ts");

  assert.match(patientService, /actorCanAccessPhysioResource/);
  assert.match(updateService, /getPatientForActor/);
});
