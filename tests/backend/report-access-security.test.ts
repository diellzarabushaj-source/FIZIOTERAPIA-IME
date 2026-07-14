import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("patient report access requires an exact patient-session identity match", async () => {
  const page = await source("app/patient-report/[patientId]/page.tsx");
  const service = await source("lib/backend/reports.ts");

  assert.match(page, /patientSession\?\.id === patientId/);
  assert.match(page, /getPatientReportForCurrentPatient\(patientId\)/);
  assert.match(service, /session\.id !== patientId/);
  assert.match(service, /OWNERSHIP_MISMATCH/);
  assert.match(service, /\.eq\("id", session\.id\)/);
  assert.match(service, /\.eq\("status", "active"\)/);
  assert.match(service, /\.is\("archived_at", null\)/);
});

test("a mismatched patient session cannot fall through to staff access without Clerk", async () => {
  const page = await source("app/patient-report/[patientId]/page.tsx");

  const sessionCheck = page.indexOf("patientSession?.id === patientId");
  const clerkCheck = page.indexOf("const clerkUser = await currentUser()");
  const ownerScopedStaffAccess = page.indexOf("getPatientReportForActor(actor, patientId)");

  assert.ok(sessionCheck >= 0);
  assert.ok(clerkCheck > sessionCheck);
  assert.ok(ownerScopedStaffAccess > clerkCheck);
  assert.match(page, /if \(!clerkUser\) notFound\(\)/);
});

test("staff report access continues through canonical actor and patient ownership checks", async () => {
  const page = await source("app/patient-report/[patientId]/page.tsx");
  const service = await source("lib/backend/reports.ts");

  assert.match(page, /requirePhysioActor/);
  assert.match(page, /getPatientReportForActor/);
  assert.match(service, /getPatientForActor\(actor, patientId\)/);
  assert.doesNotMatch(page, /getSupabaseAdmin/);
});

test("report is private, printable and identifies author, generation time and source", async () => {
  const page = await source("app/patient-report/[patientId]/page.tsx");
  const styles = await source("app/patient-report/[patientId]/report.css");
  const printButton = await source("app/patient-report/[patientId]/PrintButton.tsx");

  assert.match(page, /robots: \{ index: false, follow: false \}/);
  assert.match(page, /report\.generatedAt/);
  assert.match(page, /report\.source/);
  assert.match(page, /Autori/);
  assert.match(page, /nuk vendos diagnozë/);
  assert.match(page, /7\/10 ose më shumë/);
  assert.match(styles, /@media print/);
  assert.match(styles, /@page/);
  assert.match(printButton, /window\.print\(\)/);
});
