import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path: string) => readFile(
  new URL(`../../${path}`, import.meta.url),
  "utf8",
);

test("admin billing page uses canonical owner authorization instead of email matching", async () => {
  const page = await source("app/admin-billing/page.tsx");

  assert.match(page, /requireOwnerActor/);
  assert.match(page, /getAdminBillingData\(actor\)/);
  assert.doesNotMatch(page, /getAdminEmail|getSignedInEmail|ADMIN_EMAIL/);
  assert.doesNotMatch(page, /email\s*!==\s*adminEmail/);
});

test("billing data access is server-only, owner-only and batches signed proof URLs", async () => {
  const service = await source("src/features/admin/server/billing.ts");

  assert.match(service, /import "server-only"/);
  assert.match(service, /actor\.role !== "owner"/);
  assert.match(service, /createSignedUrls\(proofPaths/);
  assert.doesNotMatch(service, /createSignedUrl\(/);
  assert.match(service, /physiosResult\.error \|\| paymentsResult\.error/);
  assert.match(service, /return fail\("STORAGE_ERROR"/);
});

test("sensitive billing actions require explicit confirmation and reasons", async () => {
  const page = await source("app/admin-billing/page.tsx");
  const form = await source("components/ConfirmActionForm.tsx");

  assert.match(form, /window\.confirm\(confirmMessage\)/);
  assert.match(form, /event\.preventDefault\(\)/);
  assert.match(form, /useFormStatus/);
  assert.match(page, /action=\{approvePaymentRequestAction\}/);
  assert.match(page, /action=\{rejectPaymentRequestAction\}/);
  assert.match(page, /action=\{activateSubscriptionAction\}/);
  assert.match(page, /action=\{suspendSubscriptionAction\}/);
  assert.match(page, /name="reason"[\s\S]*minLength=\{3\}[\s\S]*required/);
});

test("admin billing server actions verify owner and write audit events", async () => {
  const actions = await source("app/admin-billing/actions.ts");
  const adminService = await source("lib/backend/admin.ts");

  assert.match(actions, /requireOwnerActor/);
  assert.match(actions, /payment_request\.approved/);
  assert.match(adminService, /subscription\.activated/);
  assert.match(adminService, /subscription\.suspended/);
  assert.match(adminService, /payment_request\.rejected/);
  assert.match(adminService, /writeAuditEvent/);
});
