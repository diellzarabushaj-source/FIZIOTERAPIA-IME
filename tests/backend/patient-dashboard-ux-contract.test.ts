import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("patient login lands directly in dashboard", () => {
  const actions = read("app/patient-portal/actions.ts");
  assert.match(actions, /redirect\("\/patient-dashboard"\)/);
});

test("active patient session skips the login page", () => {
  const page = read("app/patient-portal/page.tsx");
  assert.match(page, /getCurrentPatientSession/);
  assert.match(page, /if \(session\) redirect\("\/patient-dashboard"\)/);
});

test("legacy patient session route cannot create a second workflow", () => {
  const sessionPage = read("app/patient-session/page.tsx");
  assert.match(sessionPage, /redirect\("\/patient-dashboard"\)/);
});

test("patient dashboard contains one clear completion action and no camera feature", () => {
  const page = read("app/patient-dashboard/page.tsx");
  const form = read("components/PatientExerciseCompletionForm.tsx");
  assert.match(form, /✓ E kreva/);
  assert.match(form, /Po ruhet/);
  assert.match(form, /useFormStatus/);
  assert.match(page, /PatientExerciseCompletionForm/);
  assert.doesNotMatch(page, /camera|AI Movement Check|saveAiCheckAction/i);
});

test("finished plans tell the patient to contact the physiotherapist", () => {
  const page = read("app/patient-dashboard/page.tsx");
  assert.match(page, /Programi ka përfunduar/);
  assert.match(page, /Kontakto fizioterapeutin/);
});
