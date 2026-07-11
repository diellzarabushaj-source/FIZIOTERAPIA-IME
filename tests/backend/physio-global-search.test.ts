import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("global search is authenticated and ownership scoped", async () => {
  const route = await source("app/api/physio/search/route.ts");

  assert.match(route, /requirePhysioActor\(\)/);
  assert.match(route, /patientQuery = patientQuery\.eq\("physio_id", actor\.profileId\)/);
  assert.match(route, /planQuery = planQuery\.eq\("physio_id", actor\.profileId\)/);
  assert.match(route, /listExercisesForActor\(actor/);
});

test("global search masks patient codes and disables caching", async () => {
  const route = await source("app/api/physio/search/route.ts");

  assert.match(route, /function maskPatientCode/);
  assert.match(route, /maskPatientCode\(patient\.patient_code\)/);
  assert.match(route, /Cache-Control": "private, no-store, max-age=0"/);
  assert.ok(route.includes('replace(/[,%()]/g, " ")'));
});

test("global search is keyboard accessible", async () => {
  const component = await source("components/PhysioGlobalSearch.tsx");

  assert.match(component, /role="combobox"/);
  assert.match(component, /aria-autocomplete="list"/);
  assert.match(component, /event\.key === "ArrowDown"/);
  assert.match(component, /event\.key === "ArrowUp"/);
  assert.match(component, /event\.key === "Enter"/);
  assert.match(component, /event\.key === "Escape"/);
});

test("dashboard loads search UI and responsive styles", async () => {
  const [shell, layout, css] = await Promise.all([
    source("app/physiotherapist-portal/DashboardShell.tsx"),
    source("app/physiotherapist-portal/layout.tsx"),
    source("app/physiotherapist-portal/dashboard-search.css"),
  ]);

  assert.match(shell, /<PhysioGlobalSearch \/>/);
  assert.match(layout, /dashboard-search\.css/);
  assert.match(css, /\.pd-global-search-panel/);
  assert.match(css, /@media \(max-width: 700px\)/);
});
