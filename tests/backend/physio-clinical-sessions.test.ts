import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("scheduled sessions use clinic-local time, patient ownership and audit", async () => {
  const service = await source("lib/backend/clinical-sessions.ts");

  assert.match(service, /clinicDateTimeInputToUtc\(scheduledAtText\)/);
  assert.match(service, /getPatientForActor\(actor, patientIdResult\.data\)/);
  assert.match(service, /status: "planned"/);
  assert.match(service, /action: "patient\.session_scheduled"/);
  assert.match(service, /Ky pacient ka tashmë seancë në këtë datë dhe orë/);
});

test("session transitions are ownership-scoped, status-safe and audited", async () => {
  const service = await source("lib/backend/clinical-sessions.ts");
  const transition = service.slice(service.indexOf("export async function transitionClinicalSessionForActor"));

  assert.match(transition, /getClinicalSessionForActor\(actor, sessionIdInput\)/);
  assert.match(transition, /current\.status === "planned"/);
  assert.match(transition, /current\.status === "in_progress"/);
  assert.match(transition, /patient\.session_cancelled/);
  assert.match(transition, /patient\.session_started/);
});

test("completing a scheduled session updates its record instead of inserting another", async () => {
  const actions = await source("app/physiotherapist-portal/patients/actions.ts");
  const completion = actions.slice(actions.indexOf("export async function createPatientSessionAction"));

  assert.match(completion, /getClinicalSessionForActor\(actor, scheduledSessionId\)/);
  assert.match(completion, /\.update\(payload\)/);
  assert.match(completion, /\.eq\("id", scheduledSession\.id\)/);
  assert.match(completion, /\.in\("status", \["planned", "in_progress"\]\)/);
  assert.match(completion, /action: scheduledSession \? "patient\.session_completed" : "patient\.session_created"/);
});

test("patient record separates scheduling from clinical documentation and disables writes in legacy mode", async () => {
  const page = await source("app/physiotherapist-portal/patients/[patientId]/page.tsx");
  const form = await source("app/physiotherapist-portal/patients/[patientId]/ScheduleSessionForm.tsx");
  const summary = await source("lib/backend/patient-session-summary.ts");

  assert.match(page, /<ScheduleSessionForm patientId=\{patientId\} \/>/);
  assert.match(form, /useState\(\(\) => \{/);
  assert.match(form, /getClinicDateTimeInput\(\)/);
  assert.match(form, /minimumScheduledAt/);
  assert.match(form, /initialScheduledAt/);
  assert.match(page, /id="schedule-session"/);
  assert.match(page, /id="session-form"/);
  assert.match(page, /scheduledSessionId=\{selectedScheduledSessionId\}/);
  assert.match(page, /!legacySessionMode && \(/);
  assert.match(summary, /\.eq\("status", "completed"\)/);
  assert.match(summary, /mode: "legacy_read_only"/);
});

test("sessions workspace offers start, document and confirmed cancel actions", async () => {
  const [page, actions, button] = await Promise.all([
    source("app/physiotherapist-portal/sessions/page.tsx"),
    source("app/physiotherapist-portal/sessions/actions.ts"),
    source("components/SessionActionButton.tsx"),
  ]);

  assert.match(page, /startClinicalSessionAction/);
  assert.match(page, /cancelClinicalSessionAction/);
  assert.ok(page.includes('sessionId=${session.id}#session-form'));
  assert.match(actions, /transitionClinicalSessionForActor/);
  assert.match(button, /window\.confirm/);
});
