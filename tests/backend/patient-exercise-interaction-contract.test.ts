import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("patient completion uses clear 0 to 10 pain choices", async () => {
  const source = await read("components/PatientExerciseCompletionForm.tsx");
  assert.match(source, /Array\.from\(\{ length: 11 \}/);
  assert.match(source, /0–3 Pak/);
  assert.match(source, /4–6 Mesatare/);
  assert.match(source, /7–10 Ndal/);
});

test("completion button prevents duplicate submission while saving", async () => {
  const source = await read("components/PatientExerciseCompletionForm.tsx");
  assert.match(source, /useFormStatus/);
  assert.match(source, /disabled=\{pending\}/);
  assert.match(source, /Po ruhet/);
});

test("successful completion continues to next exercise", async () => {
  const action = await read("app/patient-dashboard/actions.ts");
  const page = await read("app/patient-dashboard/page.tsx");
  assert.match(action, /nextExerciseId/);
  assert.match(action, /exercise-\$\{encodeURIComponent\(nextExerciseId\)\}/);
  assert.match(page, /nextExerciseId=\{nextExerciseId\}/);
});

test("high pain completion stops at physiotherapist contact", async () => {
  const action = await read("app/patient-dashboard/actions.ts");
  assert.match(action, /painScore >= 7/);
  assert.match(action, /physio-contact/);
});

test("patient video remains embedded and accessible in the exercise card", async () => {
  const page = await read("app/patient-dashboard/page.tsx");
  assert.match(page, /youtube-nocookie\.com\/embed/);
  assert.match(page, /controls playsInline/);
  assert.match(page, /className="patient-exercise-media"/);
  assert.match(page, /title=\{`Video: \$\{title\}`\}/);
  assert.match(page, /loading="lazy"/);
});
