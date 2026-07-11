import type { SupabaseClient } from "@supabase/supabase-js";

export const EXPECTED_DATABASE_SCHEMA_VERSION = "20260711.3";

export type DatabaseReadiness = {
  ready: boolean;
  schemaVersion: string | null;
  expectedSchemaVersion: string;
  missingTables: string[];
  missingColumns: string[];
  missingFunctions: string[];
  checkedAt: string | null;
  reason: "ready" | "schema_mismatch" | "rpc_unavailable" | "invalid_response";
};

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

export async function checkDatabaseReadiness(supabase: SupabaseClient): Promise<DatabaseReadiness> {
  const { data, error } = await supabase.rpc("deployment_readiness", {
    p_expected_version: EXPECTED_DATABASE_SCHEMA_VERSION,
  });

  if (error) {
    return {
      ready: false,
      schemaVersion: null,
      expectedSchemaVersion: EXPECTED_DATABASE_SCHEMA_VERSION,
      missingTables: [],
      missingColumns: [],
      missingFunctions: [],
      checkedAt: null,
      reason: "rpc_unavailable",
    };
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      ready: false,
      schemaVersion: null,
      expectedSchemaVersion: EXPECTED_DATABASE_SCHEMA_VERSION,
      missingTables: [],
      missingColumns: [],
      missingFunctions: [],
      checkedAt: null,
      reason: "invalid_response",
    };
  }

  const payload = data as Record<string, unknown>;
  const ready = payload.ready === true;
  const schemaVersion = typeof payload.schema_version === "string" ? payload.schema_version : null;

  return {
    ready,
    schemaVersion,
    expectedSchemaVersion:
      typeof payload.expected_schema_version === "string"
        ? payload.expected_schema_version
        : EXPECTED_DATABASE_SCHEMA_VERSION,
    missingTables: stringArray(payload.missing_tables),
    missingColumns: stringArray(payload.missing_columns),
    missingFunctions: stringArray(payload.missing_functions),
    checkedAt: typeof payload.checked_at === "string" ? payload.checked_at : null,
    reason: ready ? "ready" : "schema_mismatch",
  };
}
