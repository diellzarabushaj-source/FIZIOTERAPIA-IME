import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pagePath = new URL("../../app/patient-dashboard/page.tsx", import.meta.url);

async function pageSource() {
  return readFile(pagePath, "utf8");
}

test("patient dashboard renders the four explicit plan states", async () => {
  const source = await pageSource();
  assert.match(source, /Ende nuk ka plan aktiv/);
  assert.match(source, /Programi fillon së shpejti/);
  assert.match(source, /Sot është ditë pushimi/);
  assert.match(source, /Programi ka përfunduar/);
});

test("patient dashboard only shows exercises assigned to the current day", async () => {
  const source = await pageSource();
  assert.match(source, /const scheduledDays = exercise\.scheduleDays\.length/);
  assert.match(source, /exercise\.scheduleDays/);
  assert.match(source, /exercise\.dayNumber \|\| 1/);
  assert.match(source, /scheduledDays\.includes\(day\)/);
  assert.doesNotMatch(source, /dayNumber \|\| 1\) <= day/);
});

test("patient dashboard keeps one primary today flow", async () => {
  const source = await pageSource();
  assert.match(source, /Fillo ushtrimin e radhës/);
  assert.match(source, /Bëji me radhë/);
  assert.match(source, /Portali i pacientit/);
  assert.match(source, /PROGRAMI AKTIV/);
  assert.doesNotMatch(source, /AI Camera|Movement Check/);
});
