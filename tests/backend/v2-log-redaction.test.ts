import assert from "node:assert/strict";
import test from "node:test";
import { redactLogMetadata, safeLogPayload } from "../../src/server/monitoring/redaction.ts";

test("redacts clinical identity, session and credential fields recursively", () => {
  const redacted = redactLogMetadata({
    requestId: "req_123",
    status: 500,
    patientId: "patient-readable-id",
    nested: {
      diagnosis: "Sensitive diagnosis",
      authorization: "Bearer secret",
      cookie: "patient_session=secret",
      code: "PGRST116",
    },
  });

  assert.deepEqual(redacted, {
    requestId: "req_123",
    status: 500,
    patientId: "[REDACTED]",
    nested: {
      diagnosis: "[REDACTED]",
      authorization: "[REDACTED]",
      cookie: "[REDACTED]",
      code: "PGRST116",
    },
  });
});

test("does not leak error messages", () => {
  assert.deepEqual(redactLogMetadata({ error: new Error("Patient Ana failed") }), {
    error: { name: "Error", message: "[REDACTED_ERROR_MESSAGE]" },
  });
});

test("handles circular values without throwing", () => {
  const metadata: Record<string, unknown> = { eventCode: "save_failed" };
  metadata.self = metadata;

  assert.deepEqual(redactLogMetadata(metadata), {
    eventCode: "save_failed",
    self: "[CIRCULAR]",
  });
});

test("preserves safe operational fields", () => {
  assert.deepEqual(safeLogPayload("patient_session_save_failed", { requestId: "req_42", status: 503 }), {
    event: "patient_session_save_failed",
    requestId: "req_42",
    status: 503,
  });
});
