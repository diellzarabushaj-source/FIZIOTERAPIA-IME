import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("physiotherapist portal has app-like mobile navigation", async () => {
  const [shell, nav, mobileCss] = await Promise.all([
    source("app/physiotherapist-portal/DashboardShell.tsx"),
    source("components/PhysioDashboardNav.tsx"),
    source("app/physiotherapist-portal/dashboard-mobile.css"),
  ]);

  assert.match(shell, /pd-shell/);
  assert.match(nav, /pd-mobile-bottom-nav/);
  assert.match(nav, /pd-mobile-drawer/);
  assert.match(nav, /aria-modal="true"/);
  assert.match(mobileCss, /100dvh/);
  assert.match(mobileCss, /env\(safe-area-inset-bottom\)/);
  assert.match(mobileCss, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(mobileCss, /min-height: 54px/);
});

test("mobile physiotherapist workspace prevents page overflow and keeps controls touch friendly", async () => {
  const [mobileCss, searchCss, actionsCss] = await Promise.all([
    source("app/physiotherapist-portal/dashboard-mobile.css"),
    source("app/physiotherapist-portal/dashboard-search.css"),
    source("app/physiotherapist-portal/dashboard-actions.css"),
  ]);

  assert.match(mobileCss, /overflow-x: clip/);
  assert.match(mobileCss, /touch-action: manipulation/);
  assert.match(mobileCss, /font-size: 16px/);
  assert.match(searchCss, /max-height: calc\(100dvh/);
  assert.match(searchCss, /env\(safe-area-inset-top\)/);
  assert.match(actionsCss, /min-height: 66px/);
  assert.match(actionsCss, /overscroll-behavior: contain/);
});
