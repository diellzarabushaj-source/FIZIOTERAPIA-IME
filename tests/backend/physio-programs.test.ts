import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("programs mask patient codes everywhere outside access management", async () => {
  const page = await source("app/physiotherapist-portal/programs/page.tsx");

  assert.match(page, /function maskPatientCode/);
  assert.match(page, /maskPatientCode\(patient\.patient_code\)/);
  assert.doesNotMatch(page, /\{patient\.patient_code\}/);
});

test("program counts remain independent of the selected status filter", async () => {
  const page = await source("app/physiotherapist-portal/programs/page.tsx");

  assert.match(page, /draftCountQuery/);
  assert.match(page, /reviewCountQuery/);
  assert.match(page, /approvedCountQuery/);
  assert.match(page, /activeCountQuery/);
  assert.match(page, /if \(status\) planQuery = planQuery\.eq\("status", status\)/);
  assert.doesNotMatch(page, /allPlans\.filter/);
});

test("program filters include every lifecycle state and validate external input", async () => {
  const page = await source("app/physiotherapist-portal/programs/page.tsx");

  for (const status of ["draft", "pending_review", "approved", "active", "paused", "archived"]) {
    assert.match(page, new RegExp(status));
  }
  assert.match(page, /function validStatus/);
  assert.match(page, /function validPatientId/);
});

test("program listing is paginated and redirects pages beyond the result set", async () => {
  const page = await source("app/physiotherapist-portal/programs/page.tsx");

  assert.match(page, /const PAGE_SIZE = 30/);
  assert.match(page, /\.range\(from, to\)/);
  assert.match(page, /count: "exact"/);
  assert.match(page, /page > totalPages/);
  assert.match(page, /redirect\(programsHref/);
});

test("program-specific styles remain isolated and responsive", async () => {
  const [page, css] = await Promise.all([
    source("app/physiotherapist-portal/programs/page.tsx"),
    source("app/physiotherapist-portal/programs/programs.module.css"),
  ]);

  assert.match(page, /import programStyles from "\.\/programs\.module\.css"/);
  assert.match(css, /\.pagination/);
  assert.match(css, /\.filterSummary/);
  assert.match(css, /@media \(max-width: 520px\)/);
});
