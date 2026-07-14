import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("admin dashboard requires the database-backed owner actor", async () => {
  const page = await source("app/admin-dashboard/page.tsx");
  const layout = await source("app/admin-dashboard/layout.tsx");

  assert.match(page, /requireOwnerActor/);
  assert.match(layout, /requireOwnerActor/);
  assert.doesNotMatch(page, /ADMIN_EMAIL/);
  assert.doesNotMatch(page, /defaultAdminEmail/);
  assert.doesNotMatch(page, /currentUser/);
});

test("admin overview service minimizes clinical and identity data", async () => {
  const service = await source("src/features/admin/server/dashboard.ts");

  assert.match(service, /import "server-only"/);
  assert.doesNotMatch(service, /first_name/);
  assert.doesNotMatch(service, /last_name/);
  assert.doesNotMatch(service, /diagnosis/);
  assert.doesNotMatch(service, /recipient_email/);
  assert.doesNotMatch(service, /before_data/);
  assert.doesNotMatch(service, /after_data/);
  assert.doesNotMatch(service, /entity_id/);
});

test("admin overview reads audit metadata without snapshots or entity identifiers", async () => {
  const service = await source("src/features/admin/server/dashboard.ts");

  assert.match(service, /id,action,actor_role,entity_type,created_at/);
  assert.match(service, /\.from\("audit_logs"\)/);
});
