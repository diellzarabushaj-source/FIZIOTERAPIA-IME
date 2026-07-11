import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  PATIENT_SESSION_SECRET_MIN_LENGTH,
  getPatientSessionSecret,
  patientSessionSigningConfigured,
} from "../../lib/backend-logic.ts";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("production signing requires a strong patient session secret", () => {
  assert.equal(PATIENT_SESSION_SECRET_MIN_LENGTH, 43);
  assert.equal(patientSessionSigningConfigured({ NODE_ENV: "production" }), false);
  assert.equal(patientSessionSigningConfigured({ NODE_ENV: "production", PATIENT_SESSION_SECRET: "short" }), false);
  assert.equal(
    patientSessionSigningConfigured({ NODE_ENV: "production", PATIENT_SESSION_SECRET: "x".repeat(43) }),
    true,
  );
  assert.throws(
    () => getPatientSessionSecret({ NODE_ENV: "production", PATIENT_SESSION_SECRET: "short" }),
    /at least 43 characters/,
  );
});

test("development retains an explicit non-production fallback", () => {
  assert.equal(patientSessionSigningConfigured({ NODE_ENV: "development" }), true);
  assert.match(getPatientSessionSecret({ NODE_ENV: "development" }), /dev-only/);
});

test("form and QR login guard signing configuration before signing cookies", async () => {
  const [formAction, qrRoute] = await Promise.all([
    source("app/patient-portal/actions.ts"),
    source("app/p/[code]/route.ts"),
  ]);

  assert.match(formAction, /if \(!patientSessionSigningConfigured\(\)\) redirect\("\/patient-portal\?error=system"\)/);
  assert.match(qrRoute, /if \(!patientSessionSigningConfigured\(\)\)/);
  assert.match(qrRoute, /\/patient-portal\?error=system/);
});
