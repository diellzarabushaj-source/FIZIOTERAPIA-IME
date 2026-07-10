import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path: string) => readFile(new URL("../../" + path, import.meta.url), "utf8");

test("exercise media uploads require a physio session and signed Supabase ticket", async () => {
  const actions = await source("app/physiotherapist-portal/exercises/actions.ts");
  const migration = await source("supabase/migrations/20260710_create_exercise_media_bucket.sql");

  assert.match(actions, /requirePhysioActor/);
  assert.match(actions, /createSignedUploadUrl/);
  assert.match(actions, /exercise-media/);
  assert.match(actions, /50 \* 1024 \* 1024/);
  assert.match(migration, /allowed_mime_types/);
  assert.match(migration, /video\/mp4/);
  assert.match(migration, /image\/jpeg/);
  assert.match(migration, /public,?/);
});

test("private exercises remain owned and reusable only by their physiotherapist", async () => {
  const service = await source("lib/backend/exercises.ts");
  const page = await source("app/physiotherapist-portal/exercises/page.tsx");

  assert.match(service, /owner_physio_id: actor\.profileId/);
  assert.match(service, /is_default\.eq\.true,owner_physio_id\.eq/);
  assert.match(service, /validateMediaUrl/);
  assert.match(page, /listExercisesForActor/);
  assert.match(page, /Default/);
  assert.match(page, /Të miat/);
  assert.match(page, /ExerciseMediaPreview/);
});

test("plans persist explicit multi-day schedules and patient dashboard consumes them", async () => {
  const planService = await source("lib/backend/plans.ts");
  const planActions = await source("app/physiotherapist-portal/plan-builder/actions.ts");
  const patientDashboard = await source("app/patient-dashboard/page.tsx");
  const migration = await source("supabase/migrations/20260710_add_plan_exercise_schedule_days.sql");

  assert.match(planService, /schedule_days/);
  assert.match(planService, /parseScheduleDays/);
  assert.match(planService, /validateScheduleForPlan/);
  assert.match(planActions, /scheduleDays: formData\.get\("scheduleDays"\)/);
  assert.match(patientDashboard, /schedule_days/);
  assert.match(patientDashboard, /scheduledDays\.includes\(day\)/);
  assert.match(migration, /integer\[\]/);
  assert.match(migration, /using gin/);
});

test("patient record exposes QR access and a protected patient-specific program workspace", async () => {
  const record = await source("app/physiotherapist-portal/patients/[patientId]/page.tsx");
  const navigation = await source("app/physiotherapist-portal/patients/[patientId]/PatientRecordNav.tsx");
  const program = await source("app/physiotherapist-portal/patients/[patientId]/program/page.tsx");

  assert.match(record, /patient-access/);
  assert.match(record, /Menaxho planin/);
  assert.match(navigation, /Plani i ushtrimeve/);
  assert.match(program, /requirePhysioActor/);
  assert.match(program, /getPatientForActor/);
  assert.match(program, /plan_exercises\(count\)/);
});

test("physiotherapist sign-in and navigation lead directly into the real work dashboard", async () => {
  const signIn = await source("app/sign-in/[[...sign-in]]/page.tsx");
  const portal = await source("app/physiotherapist-portal/page.tsx");
  const navigation = await source("components/PhysioDashboardNav.tsx");

  assert.match(signIn, /physiotherapist-portal\/overview/);
  assert.match(portal, /physiotherapist-portal\/overview/);
  assert.match(navigation, /lucide-react/);
  assert.match(navigation, /physiotherapist-portal\/programs/);
  assert.match(navigation, /physiotherapist-portal\/exercises/);
});
