import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("patient access code rotation revokes the previous code and is audited safely", async () => {
  const action = await readFile(
    new URL("../../app/physiotherapist-portal/patients/access-actions.ts", import.meta.url),
    "utf8",
  );

  assert.match(action, /getPatientForActor/);
  assert.match(action, /\.eq\("patient_code", patient\.patient_code\)/);
  assert.match(action, /patient\.access_code_rotated/);
  assert.match(action, /previous_sessions_revoked: true/);
  assert.match(action, /patient_code_masked/);
  assert.doesNotMatch(action, /before:\s*\{\s*patient_code:/);
  assert.doesNotMatch(action, /after:\s*\{\s*patient_code:/);
});

test("patient record requires confirmation before rotating access", async () => {
  const control = await readFile(
    new URL("../../app/physiotherapist-portal/patients/[patientId]/RotatePatientAccessCodeForm.tsx", import.meta.url),
    "utf8",
  );
  const page = await readFile(
    new URL("../../app/physiotherapist-portal/patients/[patientId]/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(control, /window\.confirm/);
  assert.match(control, /rotatePatientAccessCodeAction/);
  assert.match(page, /RotatePatientAccessCodeForm/);
  assert.match(page, /Kodi dhe QR-ja e vjetër nuk funksionojnë më/);
});
