import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("authenticated Clerk workflow is manual-only and keeps secrets out of pull requests", async () => {
  const workflow = await source(".github/workflows/clerk-auth-e2e.yml");

  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /^\s*pull_request(?:_target)?:/m);
  assert.match(workflow, /secrets\.E2E_CLERK_PUBLISHABLE_KEY/);
  assert.match(workflow, /secrets\.E2E_CLERK_SECRET_KEY/);
  assert.match(workflow, /secrets\.E2E_CLERK_OWNER_EMAIL/);
  assert.match(workflow, /secrets\.E2E_CLERK_PHYSIO_EMAIL/);
  assert.match(workflow, /@playwright\/test@1\.55\.0/);
  assert.match(workflow, /@clerk\/testing@1\.9\.2/);
});

test("authenticated Playwright configuration runs Clerk setup before role journeys", async () => {
  const config = await source("playwright.clerk.config.mjs");
  const setup = await source("tests/e2e-auth/clerk.setup.mjs");

  assert.match(config, /testDir: "\.\/tests\/e2e-auth"/);
  assert.match(config, /dependencies: \["clerk-setup"\]/);
  assert.match(setup, /clerkSetup/);
  assert.match(setup, /await clerkSetup\(\)/);
});

test("authenticated journeys cover owner redirect, physio redirect and sign-out", async () => {
  const spec = await source("tests/e2e-auth/authenticated-dashboard.spec.mjs");
  const packageJson = JSON.parse(await source("package.json")) as {
    scripts?: Record<string, string>;
  };

  assert.match(spec, /clerk\.signIn/);
  assert.ok(spec.includes("/auth/continue"));
  assert.ok(spec.includes("/admin-dashboard"));
  assert.ok(spec.includes("/physiotherapist-portal/overview"));
  assert.match(spec, /clerk\.signOut/);
  assert.match(spec, /E2E_CLERK_OWNER_EMAIL/);
  assert.match(spec, /E2E_CLERK_PHYSIO_EMAIL/);
  assert.equal(
    packageJson.scripts?.["test:e2e:clerk"],
    "playwright test --config=playwright.clerk.config.mjs",
  );
});
