import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("email delivery is server-only, typed and safe outside production", async () => {
  const service = await source("src/server/email/service.ts");

  assert.match(service, /import "server-only"/);
  assert.match(service, /export type EmailTemplate<Props>/);
  assert.match(service, /RESEND_TEST_RECIPIENT/);
  assert.match(service, /config\.environment === "production"/);
  assert.match(service, /test_recipient_missing/);
  assert.match(service, /MAX_ATTEMPTS = 2/);
  assert.doesNotMatch(service, /console\.(?:log|error|warn)/);
});

test("notification ledger stores a recipient fingerprint and safe error codes", async () => {
  const notifications = await source("lib/email-notifications.ts");
  const migration = await source("supabase/migrations/20260710_harden_notification_delivery.sql");

  assert.match(notifications, /createHash\("sha256"\)/);
  assert.match(notifications, /\.slice\(0, 24\)/);
  assert.match(notifications, /recipient_email: recipientHash\(input\.to\)/);
  assert.match(notifications, /error_message: errorCode \|\| null/);
  assert.doesNotMatch(notifications, /error\.message/);
  assert.match(migration, /SHA-256 prefix/);
});

test("legacy Resend wrapper cannot bypass the centralized service", async () => {
  const legacy = await source("lib/resend-email.ts");

  assert.match(legacy, /sendTransactionalEmail/);
  assert.doesNotMatch(legacy, /api\.resend\.com/);
  assert.doesNotMatch(legacy, /process\.env\.RESEND_API_KEY/);
  assert.doesNotMatch(legacy, /patientName}\s*<\/strong>/);
});

test("email CTA is constrained to the configured application origin", async () => {
  const notifications = await source("lib/email-notifications.ts");

  assert.match(notifications, /target\.origin === appUrl\.origin/);
  assert.match(notifications, /new URL\("\/physiotherapist-portal", appUrl\)/);
});
