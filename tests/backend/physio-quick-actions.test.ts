import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("quick action menu exposes the four frequent clinical actions", async () => {
  const component = await source("components/PhysioQuickActions.tsx");

  for (const action of ["Shto pacient", "Krijo plan", "Regjistro seancë", "Shto ushtrim"]) {
    assert.match(component, new RegExp(action));
  }
  assert.match(component, /Zgjidh pacientin dhe hap kartelën/);
});

test("quick action menu is accessible and closes safely", async () => {
  const component = await source("components/PhysioQuickActions.tsx");

  assert.match(component, /aria-expanded=\{open\}/);
  assert.match(component, /role="menu"/);
  assert.match(component, /role="menuitem"/);
  assert.match(component, /event\.key === "Escape"/);
  assert.match(component, /rootRef\.current\?\.contains/);
});

test("dashboard shell loads the unified action menu and its styles", async () => {
  const [shell, layout, css] = await Promise.all([
    source("app/physiotherapist-portal/DashboardShell.tsx"),
    source("app/physiotherapist-portal/layout.tsx"),
    source("app/physiotherapist-portal/dashboard-actions.css"),
  ]);

  assert.match(shell, /<PhysioQuickActions \/>/);
  assert.match(layout, /dashboard-actions\.css/);
  assert.match(css, /\.pd-quick-actions-menu/);
  assert.match(css, /@media \(max-width: 700px\)/);
});
