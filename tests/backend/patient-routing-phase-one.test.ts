import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("patient portal redirects an active patient session to the dashboard", async () => {
  const source = await read("app/patient-portal/page.tsx");
  assert.match(source, /getCurrentPatientSession/);
  assert.match(source, /if \(session\) redirect\("\/patient-dashboard"\)/);
});

test("manual patient code login finishes in the dashboard", async () => {
  const source = await read("app/patient-portal/actions.ts");
  assert.match(source, /authenticatePatientCode/);
  assert.match(source, /PATIENT_SESSION_COOKIE/);
  assert.match(source, /redirect\("\/patient-dashboard"\)/);
});

test("patient QR links create the same signed session and go directly to the dashboard", async () => {
  const source = await read("app/p/[code]/route.ts");
  assert.match(source, /authenticatePatientCode/);
  assert.match(source, /PATIENT_SESSION_COOKIE/);
  assert.match(source, /signPatientCode/);
  assert.match(source, /NextResponse\.redirect\(new URL\("\/patient-dashboard"/);
});

test("legacy patient-session route cannot open a second patient flow", async () => {
  const source = await read("app/patient-session/page.tsx");
  assert.match(source, /redirect\("\/patient-dashboard"\)/);
  assert.doesNotMatch(source, /PatientSessionClient/);
});

test("Clerk middleware does not protect patient code routes", async () => {
  const source = await read("proxy.ts");
  const protectedRoutes = source.slice(source.indexOf("const protectedRoutePrefixes"), source.indexOf("const adminRoutePrefixes"));
  assert.doesNotMatch(protectedRoutes, /patient-access/);
  assert.doesNotMatch(protectedRoutes, /patient-dashboard/);
  assert.doesNotMatch(protectedRoutes, /patient-portal/);
  assert.doesNotMatch(protectedRoutes, /\"\/p\"/);
});
