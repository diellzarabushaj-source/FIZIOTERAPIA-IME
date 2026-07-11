import assert from "node:assert/strict";
import test from "node:test";
import { getEmailFromAddress } from "../../lib/email-notifications.ts";

test("email notifications require an explicit sender address", () => {
  const previous = process.env.RESEND_FROM_EMAIL;
  try {
    delete process.env.RESEND_FROM_EMAIL;
    assert.equal(getEmailFromAddress(), null);

    process.env.RESEND_FROM_EMAIL = "  Fizioterapia ime <alerts@example.com>  ";
    assert.equal(getEmailFromAddress(), "Fizioterapia ime <alerts@example.com>");
  } finally {
    if (previous === undefined) delete process.env.RESEND_FROM_EMAIL;
    else process.env.RESEND_FROM_EMAIL = previous;
  }
});
