import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("patient portal exposes a safe dashboard demo without bypassing real login", async () => {
  const [portal, demo, login] = await Promise.all([
    source("app/patient-portal/page.tsx"),
    source("app/patient-dashboard/demo/page.tsx"),
    source("app/patient-portal/actions.ts"),
  ]);

  assert.match(portal, /href="\/patient-dashboard\/demo"/);
  assert.match(portal, /nuk përdor të dhëna reale/i);
  assert.match(demo, /Pamje demonstrimi/);
  assert.match(demo, /disabled/);
  assert.doesNotMatch(demo, /getCurrentPatientSession/);
  assert.doesNotMatch(demo, /getSupabaseAdmin/);
  assert.match(login, /authenticatePatientCode/);
  assert.match(login, /signPatientCode/);
});

test("patient demo uses the current responsive dashboard design", async () => {
  const demo = await source("app/patient-dashboard/demo/page.tsx");

  assert.match(demo, /patient-dashboard-shell/);
  assert.match(demo, /patient-dashboard-layout/);
  assert.match(demo, /patient-mobile-nav/);
  assert.match(demo, /patient-exercise-card/);
  assert.match(demo, /role="progressbar"/);
  assert.doesNotMatch(demo, /patient-simple-page/);
  assert.doesNotMatch(demo, /patient-simple-header/);
});

test("system login failures explain that database security configuration is incomplete", async () => {
  const portal = await source("app/patient-portal/page.tsx");
  assert.match(portal, /Hyrja me kod nuk është konfiguruar plotësisht në databazë/);
});
