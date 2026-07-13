import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import {
  MOBILE_PAIN_STOP_THRESHOLD,
  mustStopExerciseForPain,
} from "../../apps/mobile-app/lib/clinical-safety.ts";
import {
  PAIN_STOP_THRESHOLD,
  evaluatePainSafety,
} from "../../src/features/clinical-safety/domain/pain-safety.ts";

const source = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("mobile and web use the same clinical pain stop threshold", () => {
  assert.equal(MOBILE_PAIN_STOP_THRESHOLD, PAIN_STOP_THRESHOLD);
  for (let score = 0; score <= 10; score += 1) {
    assert.equal(
      mustStopExerciseForPain(score),
      evaluatePainSafety(score).action === "stop_and_contact_physio",
    );
  }
});

test("mobile runtime contains no fake patient, exercise or AI outcome", async () => {
  const app = await source("apps/mobile-app/App.tsx");

  for (const forbidden of ["DEMO_PATIENT", "DEMO_EXERCISES", "const aiScore", "Demo mode aktiv"]) {
    assert.doesNotMatch(app, new RegExp(forbidden));
  }
  assert.match(app, /Ky pilot mobile nuk aktivizon kamerën/);
  assert.match(app, /mustStopExerciseForPain/);
});

test("mobile client has no direct database module or Supabase dependency", async () => {
  await assert.rejects(
    access(new URL("../../apps/mobile-app/lib/supabase.ts", import.meta.url)),
  );
  const packageJson = JSON.parse(await source("apps/mobile-app/package.json")) as {
    dependencies?: Record<string, string>;
  };
  assert.equal(packageJson.dependencies?.["@supabase/supabase-js"], undefined);
});

test("mobile client requires explicit environment config and uses authorization headers", async () => {
  const api = await source("apps/mobile-app/lib/api.ts");

  assert.match(api, /EXPO_PUBLIC_API_BASE_URL/);
  assert.match(api, /authorization: `Bearer \$\{token\}`/);
  assert.match(api, /REQUEST_TIMEOUT_MS/);
  assert.doesNotMatch(api, /configuredBaseUrl\s*=.*fizioterapia-ime\.vercel\.app/);
  assert.doesNotMatch(api, /sessionToken:\s*activePatientSessionToken/);
});

test("mobile routes issue, validate and revoke registry sessions", async () => {
  const loginRoute = await source("app/api/mobile/patient-session/route.ts");
  const progressRoute = await source("app/api/mobile/save-progress/route.ts");

  assert.match(loginRoute, /createPatientSession/);
  assert.match(loginRoute, /revokePatientSession/);
  assert.match(loginRoute, /patientSessionRegistryEnabled/);
  assert.match(progressRoute, /validatePatientSession/);
  assert.match(progressRoute, /getBearerToken/);
  assert.match(progressRoute, /requireAssignedPlanExercise/);
  assert.match(progressRoute, /evaluatePainSafety/);
  assert.doesNotMatch(progressRoute, /alertType:\s*body\.alertType/);
});

test("mobile health exposes only a minimal public contract", async () => {
  const healthRoute = await source("app/api/mobile/health/route.ts");

  assert.match(healthRoute, /hasValidMonitorSecret/);
  assert.match(healthRoute, /canSeeDetails/);
  assert.match(healthRoute, /"Cache-Control": "no-store, max-age=0"/);
  assert.doesNotMatch(healthRoute, /app:\s*"Fizioterapia ime"/);
  assert.doesNotMatch(healthRoute, /note:\s*"Safe/);
});
