import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("mobile navigation uses a drawer instead of horizontal route scrolling", async () => {
  const component = await source("components/PhysioDashboardNav.tsx");

  assert.match(component, /pd-mobile-drawer/);
  assert.match(component, /pd-mobile-bottom-nav/);
  assert.match(component, /aria-modal="true"/);
  assert.match(component, /event\.key === "Escape"/);
  assert.match(component, /document\.body\.style\.overflow = "hidden"/);
});

test("mobile navigation exposes only durable clinical sections", async () => {
  const component = await source("components/PhysioDashboardNav.tsx");

  for (const destination of ["Përmbledhje", "Alarmet", "Pacientët", "Programet", "Ushtrimet", "Pagesat"]) {
    assert.match(component, new RegExp(destination));
  }
  assert.doesNotMatch(component, /label: "Pacient i ri"/);
  assert.match(component, /Krijo plan të ri/);
});

test("mobile navigation styles are loaded after dashboard polish", async () => {
  const [layout, css] = await Promise.all([
    source("app/physiotherapist-portal/layout.tsx"),
    source("app/physiotherapist-portal/dashboard-mobile.css"),
  ]);

  assert.match(layout, /dashboard-polish\.css";\nimport "\.\/dashboard-mobile\.css/);
  assert.match(css, /@media \(max-width: 980px\)/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /min-height: 48px/);
  assert.match(css, /prefers-reduced-motion/);
});
