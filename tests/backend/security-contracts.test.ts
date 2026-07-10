import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path: string) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("patient completion always validates signed session and active plan ownership", async () => {
  const actions = await source("app/patient-dashboard/actions.ts");
  const service = await source("lib/backend/patient-activity.ts");

  assert.match(actions, /requireCurrentPatientSession/);
  assert.match(actions, /recordPatientExerciseCompletion/);
  assert.match(service, /record_patient_exercise_completion/);
  assert.match(service, /HIGH_PAIN_THRESHOLD\s*=\s*7/);
});

test("patient dashboard queries active plans only", async () => {
  const dashboard = await source("app/patient-dashboard/page.tsx");
  assert.match(dashboard, /\.eq\("status",\s*"active"\)/);
  assert.match(dashboard, /\.in\("plan_exercise_id",\s*planExerciseIds\)/);
});

test("admin routes use centralized owner guard", async () => {
  const dashboardLayout = await source("app/admin-dashboard/layout.tsx");
  const billingLayout = await source("app/admin-billing/layout.tsx");
  assert.match(dashboardLayout, /requireOwnerActor/);
  assert.match(billingLayout, /requireOwnerActor/);
});

test("clinical high-pain alerts create durable in-app notifications", async () => {
  const alerts = await source("lib/backend/clinical-alerts.ts");
  assert.match(alerts, /createAppNotification/);
  assert.match(alerts, /high-pain:/);
  assert.match(alerts, /severity:\s*"critical"/);
});

test("service role key is never exposed as a NEXT_PUBLIC variable", async () => {
  const files = [
    "lib/supabase-admin.ts",
    "lib/backend/admin.ts",
    "lib/backend/notifications.ts",
  ];
  for (const file of files) {
    const content = await source(file);
    assert.doesNotMatch(content, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/);
  }
});
