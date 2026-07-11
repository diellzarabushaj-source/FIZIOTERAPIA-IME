import { readFile } from "node:fs/promises";

const files = {
  service: "lib/backend/schema-readiness.ts",
  route: "app/api/readiness/route.ts",
  baseMigration: "supabase/migrations/20260711_database_schema_readiness.sql",
  currentMigration: "supabase/migrations/20260711_patient_session_registry.sql",
};

const content = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);

const serviceVersion = content.service.match(/EXPECTED_DATABASE_SCHEMA_VERSION\s*=\s*"([^"]+)"/)?.[1];
const migrationVersion = content.currentMigration.match(/values\s*\(true,\s*'([^']+)'/i)?.[1];

const rules = [
  ["service declares an expected schema version", Boolean(serviceVersion)],
  ["current migration declares a schema version", Boolean(migrationVersion)],
  ["service and current migration schema versions match", Boolean(serviceVersion && serviceVersion === migrationVersion)],
  ["base migration creates schema state table", content.baseMigration.includes("create table if not exists public.app_schema_state")],
  ["current migration creates patient session registry", content.currentMigration.includes("create table if not exists public.patient_sessions")],
  ["current readiness RPC checks patient sessions", content.currentMigration.includes("'patient_sessions'")],
  ["current migration creates readiness RPC", content.currentMigration.includes("function public.deployment_readiness")],
  ["readiness RPC is service-role only", content.currentMigration.includes("service_role required")],
  ["route fails closed with HTTP 503", content.route.includes("status: readiness.ready ? 200 : 503")],
  ["route disables caching", content.route.includes('"Cache-Control": "no-store, max-age=0"')],
  ["route protects diagnostics with monitor secret", content.route.includes("HEALTH_MONITOR_SECRET")],
];

console.table(rules.map(([rule, passed]) => ({ rule, status: passed ? "pass" : "fail" })));

const failed = rules.filter(([, passed]) => !passed);
if (failed.length) {
  console.error("Database schema readiness contract failed:");
  for (const [rule] of failed) console.error(`- ${rule}`);
  process.exitCode = 1;
} else {
  console.log(`Database schema readiness contract passed (${serviceVersion}).`);
}
