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

test("patient report publishes only the active assigned exercise plan", async () => {
  const page = await source("app/patient-report/[patientId]/page.tsx");
  const service = await source("lib/backend/reports.ts");

  assert.match(service, /\.from\("plans"\)[\s\S]*?\.eq\("patient_id", patient\.id\)[\s\S]*?\.eq\("status", "active"\)/);
  assert.doesNotMatch(service, /\.in\("status", \["active", "approved"\]\)/);
  assert.match(service, /\.from\("plan_exercises"\)/);
  assert.match(service, /exercise_library\(id,name,category,instructions_sq,video_url\)/);
  assert.match(page, /report\.planExercises\.map/);
  assert.match(page, /item\.instructions[\s\S]*?\|\| exercise\?\.instructions_sq/);
  assert.match(page, /item\.sets/);
  assert.match(page, /item\.reps/);
  assert.match(page, /item\.frequency/);
  assert.match(page, /item\.schedule_days/);
});

test("report branding is resolved from the patient's assigned physiotherapist", async () => {
  const page = await source("app/patient-report/[patientId]/page.tsx");
  const service = await source("lib/backend/reports.ts");

  assert.match(service, /\.from\("clinic_branding"\)/);
  assert.match(service, /\.eq\("physio_id", patient\.physio_id\)/);
  assert.match(page, /report\.branding\?\.clinic_name/);
  assert.match(page, /report\.branding\?\.logo_url/);
  assert.match(page, /report\.branding\?\.show_exercise_images/);
  assert.match(page, /report\.branding\?\.show_qr_code/);
  assert.match(page, /report\.branding\?\.report_footer/);
});

test("patient QR remains private to the exact patient session or authorized staff", async () => {
  const page = await source("app/patient-report/[patientId]/page.tsx");
  const route = await source("app/api/patient/access-qr/[code]/route.ts");

  assert.match(route, /getCurrentPatientSession\(\)/);
  assert.match(route, /getActorContext\(\)/);
  assert.match(route, /patientSession\.id === patient\.id/);
  assert.match(route, /normalizePatientCode\(patientSession\.patient_code\) === code/);
  assert.match(route, /actorCanAccessPhysioResource\(actor, patient\.physio_id\)/);
  assert.match(route, /if \(!patientAuthorized && !staffAuthorized\)/);
  assert.match(route, /Cache-Control": "no-store, private"/);
  assert.match(page, /\/api\/patient\/access-qr\/\$\{encodeURIComponent/);
});
