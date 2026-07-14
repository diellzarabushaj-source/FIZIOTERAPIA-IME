import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("admin billing service remains owner-only before calling service-role RPCs", async () => {
  const service = await source("lib/backend/admin.ts");
  const policy = await source("lib/backend/admin-policy.ts");

  assert.match(service, /requireOwnerRole\(actor\)/);
  assert.match(service, /canManageOwnerBilling/);
  assert.match(policy, /return role === "owner"/);
  assert.doesNotMatch(service, /actor\.role !== "owner" && actor\.role !== "admin"/);
});

test("manual payment approval locks the request and allows only one state transition", async () => {
  const migration = await source("supabase/migrations/20260710_harden_manual_payment_approval.sql");
  const integration = await source("tests/database/admin-billing-integration.sh");

  assert.match(migration, /where id = p_request_id[\s\S]*for update/);
  assert.match(migration, /v_request\.status <> 'proof_uploaded'/);
  assert.match(migration, /set status = 'approved'/);
  assert.match(integration, /exactly one concurrent payment approval must succeed/);
  assert.match(integration, /concurrent approval created duplicate subscriptions/);
});

test("activation suspension rejection and approval RPCs are service-role only", async () => {
  const adminMigration = await source("supabase/migrations/20260710134000_harden_admin_access_operations.sql");
  const approvalMigration = await source("supabase/migrations/20260710_harden_manual_payment_approval.sql");

  for (const functionName of [
    "admin_activate_physio_access",
    "admin_suspend_subscription",
    "admin_reject_payment_request",
  ]) {
    assert.match(adminMigration, new RegExp(`revoke all on function public\\.${functionName}`));
    assert.match(adminMigration, new RegExp(`grant execute on function public\\.${functionName}[\\s\\S]*to service_role`));
  }

  assert.match(approvalMigration, /revoke all on function public\.approve_manual_payment_request[\s\S]*from public, anon, authenticated/);
  assert.match(approvalMigration, /grant execute on function public\.approve_manual_payment_request[\s\S]*to service_role/);
});
