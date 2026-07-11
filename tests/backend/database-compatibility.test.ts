import assert from "node:assert/strict";
import test from "node:test";
import {
  databaseRolloutMessage,
  isDatabaseSchemaMismatch,
  sanitizePostgrestSearchTerm,
} from "../../lib/backend/database-compatibility.ts";

test("recognizes Postgres and PostgREST schema rollout errors", () => {
  for (const code of ["42P01", "42703", "42883", "PGRST200", "PGRST202", "PGRST204"]) {
    assert.equal(isDatabaseSchemaMismatch({ code, message: "schema rollout" }), true, code);
  }

  assert.equal(
    isDatabaseSchemaMismatch({ message: "Could not find the 'status' column in the schema cache" }),
    true,
  );
  assert.equal(isDatabaseSchemaMismatch({ code: "23505", message: "duplicate key" }), false);
  assert.equal(isDatabaseSchemaMismatch(null), false);
});

test("sanitizes PostgREST search grammar while preserving Albanian text", () => {
  assert.equal(
    sanitizePostgrestSearchTerm("  gjuri,or(status.eq.archived) — çlirimi_100%  "),
    "gjuri or status eq archived çlirimi 100",
  );
  assert.equal(sanitizePostgrestSearchTerm("Lëvizje e qafës"), "Lëvizje e qafës");
  assert.equal(sanitizePostgrestSearchTerm("abc", 2), "ab");
  assert.equal(sanitizePostgrestSearchTerm({}), "");
});

test("rollout errors remain actionable and do not expose implementation details", () => {
  assert.equal(
    databaseRolloutMessage("Biblioteka private"),
    "Biblioteka private nuk është ende aktive në këtë ambient. Apliko migrimet e databazës dhe provo përsëri.",
  );
});
