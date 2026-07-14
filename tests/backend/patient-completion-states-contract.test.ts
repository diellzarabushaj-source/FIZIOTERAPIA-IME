import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dashboardPath = new URL("../../app/patient-dashboard/page.tsx", import.meta.url);
const completionStylesPath = new URL("../../app/patient-dashboard/patient-completion.css", import.meta.url);

async function source(path: URL) {
  return readFile(path, "utf8");
}

test("day completion shows explicit 100 percent confirmation", async () => {
  const dashboard = await source(dashboardPath);
  assert.match(dashboard, /100% E KRYER/);
  assert.match(dashboard, /ushtrime u ruajtën/);
  assert.match(dashboard, /id="today-complete"/);
});

test("exercise list disappears once all exercises are done", async () => {
  const dashboard = await source(dashboardPath);
  assert.match(dashboard, /!allDone && !mustStop/);
  assert.match(dashboard, /allDone && !mustStop/);
});

test("next visit is based on the next actually scheduled plan day", async () => {
  const dashboard = await source(dashboardPath);
  assert.match(dashboard, /nextScheduledDay/);
  assert.match(dashboard, /dateForPlanDay/);
  assert.match(dashboard, /Kthehu më/);
});

test("last scheduled day asks the patient to contact the physiotherapist", async () => {
  const dashboard = await source(dashboardPath);
  assert.match(dashboard, /completedLastScheduledDay/);
  assert.match(dashboard, /I përfundove ushtrimet e planifikuara/);
  assert.match(dashboard, /href="\/patient-contact"/);
});

test("expired program blocks exercises and requires a new review", async () => {
  const dashboard = await source(dashboardPath);
  assert.match(dashboard, /todayKey > activePlan\.endDate/);
  assert.match(dashboard, /PROGRAMI U MBYLL/);
  assert.match(dashboard, /Mos vazhdo me të njëjtin program pa kontroll të ri/);
  assert.match(dashboard, /const exercises = hasNotStarted \|\| ended/);
});

test("completion state is accessible and respects reduced motion", async () => {
  const dashboard = await source(dashboardPath);
  const styles = await source(completionStylesPath);
  assert.match(dashboard, /role="status"/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /patientCompletionPop/);
});
