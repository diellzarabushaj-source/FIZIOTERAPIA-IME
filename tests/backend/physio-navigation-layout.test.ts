import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("clinical dashboard keeps brand, search and actions in stable layout regions", async () => {
  const shell = await source("app/physiotherapist-portal/DashboardShell.tsx");
  const layout = await source("app/physiotherapist-portal/layout.tsx");
  const styles = await source("app/physiotherapist-portal/dashboard-navigation.css");

  assert.match(shell, /className="pd-brand-lockup"/);
  assert.match(shell, /className="pd-topbar-search"/);
  assert.match(shell, /className="pd-topbar-actions"/);
  assert.match(layout, /dashboard-navigation\.css/);
  assert.match(styles, /\.pd-topbar-search\s*\{[\s\S]*?min-width:\s*0;[\s\S]*?flex:\s*1 1 460px;/);
  assert.match(styles, /\.pd-topbar-actions\s*\{[\s\S]*?flex:\s*0 0 auto;/);
});

test("desktop and mobile clinical navigation remain grouped and scroll-safe", async () => {
  const navigation = await source("components/PhysioDashboardNav.tsx");
  const styles = await source("app/physiotherapist-portal/dashboard-navigation.css");

  assert.match(navigation, /Puna klinike/);
  assert.match(navigation, /Llogaria dhe raportet/);
  assert.match(navigation, /pd-mobile-drawer-label/);
  assert.match(styles, /\.pd-nav\s*\{[\s\S]*?overflow-y:\s*auto;/);
  assert.match(styles, /\.pd-nav-account\s*\{[\s\S]*?border-top:/);
  assert.match(styles, /\.pd-mobile-drawer-label-account\s*\{[\s\S]*?border-top:/);
});
