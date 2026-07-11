import assert from "node:assert/strict";
import test from "node:test";
import {
  checkDatabaseReadiness,
  EXPECTED_DATABASE_SCHEMA_VERSION,
} from "../../lib/backend/schema-readiness.ts";

test("database readiness accepts a matching complete schema", async () => {
  const supabase = {
    rpc: async (name: string, args: Record<string, unknown>) => {
      assert.equal(name, "deployment_readiness");
      assert.equal(args.p_expected_version, EXPECTED_DATABASE_SCHEMA_VERSION);
      return {
        data: {
          ready: true,
          schema_version: EXPECTED_DATABASE_SCHEMA_VERSION,
          expected_schema_version: EXPECTED_DATABASE_SCHEMA_VERSION,
          missing_tables: [],
          missing_functions: [],
          checked_at: "2026-07-11T00:00:00.000Z",
        },
        error: null,
      };
    },
  };

  const result = await checkDatabaseReadiness(supabase as never);
  assert.equal(result.ready, true);
  assert.equal(result.reason, "ready");
  assert.equal(result.schemaVersion, EXPECTED_DATABASE_SCHEMA_VERSION);
});

test("database readiness fails closed when the RPC is unavailable", async () => {
  const supabase = {
    rpc: async () => ({ data: null, error: { code: "PGRST202" } }),
  };

  const result = await checkDatabaseReadiness(supabase as never);
  assert.equal(result.ready, false);
  assert.equal(result.reason, "rpc_unavailable");
  assert.equal(result.schemaVersion, null);
});

test("database readiness preserves missing schema objects for operator diagnostics", async () => {
  const supabase = {
    rpc: async () => ({
      data: {
        ready: false,
        schema_version: "20260710.9",
        expected_schema_version: EXPECTED_DATABASE_SCHEMA_VERSION,
        missing_tables: ["clinical_alerts"],
        missing_functions: ["activate_plan_safely"],
        checked_at: "2026-07-11T00:00:00.000Z",
      },
      error: null,
    }),
  };

  const result = await checkDatabaseReadiness(supabase as never);
  assert.equal(result.ready, false);
  assert.equal(result.reason, "schema_mismatch");
  assert.deepEqual(result.missingTables, ["clinical_alerts"]);
  assert.deepEqual(result.missingFunctions, ["activate_plan_safely"]);
});
