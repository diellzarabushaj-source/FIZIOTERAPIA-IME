import { readFile } from "node:fs/promises";

const files = {
  service: "lib/backend/schema-readiness.ts",
  route: "app/api/readiness/route.ts",
  baseMigration: "supabase/migrations/20260711_database_schema_readiness.sql",
  currentMigration: "supabase/migrations/20260711_patient_session_registry.sql",
  sessionService: "lib/backend/patient-sessions.ts",
  overview: "app/physiotherapist-portal/overview/page.tsx",
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
  ["auth migration creates a dedicated auth session table", content.currentMigration.includes("create table if not exists public.patient_auth_sessions")],
  ["auth migration never creates the clinical patient_sessions table", !content.currentMigration.includes("create table if not exists public.patient_sessions")],
  ["readiness checks the clinical session table", content.currentMigration.includes("'patient_sessions'")],
  ["readiness checks the auth session table", content.currentMigration.includes("'patient_auth_sessions'")],
  ["readiness verifies clinical session columns", content.currentMigration.includes("patient_sessions.session_date")],
  ["readiness verifies auth session columns", content.currentMigration.includes("patient_auth_sessions.token_hash")],
  ["session service uses only the auth session table", content.sessionService.includes('PATIENT_AUTH_SESSIONS_TABLE = "patient_auth_sessions"') && !content.sessionService.includes('.from("patient_sessions")')],
  ["clinical overview continues to count treatment sessions", content.overview.includes('.from("patient_sessions")') && content.overview.includes("session_date")],
  ["current migration creates readiness RPC", content.currentMigration.includes("function public.deployment_readiness")],
  ["readiness RPC is service-role only", content.currentMigration.includes("service_role required")],
  ["route reports missing columns to protected monitors", content.route.includes("missingColumns: readiness.missingColumns")],
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
