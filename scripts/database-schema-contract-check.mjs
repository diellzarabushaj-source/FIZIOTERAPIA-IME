import { readFile } from "node:fs/promises";

const files = {
  service: "lib/backend/schema-readiness.ts",
  route: "app/api/readiness/route.ts",
  migration: "supabase/migrations/20260711_database_schema_readiness.sql",
};

const content = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);

const serviceVersion = content.service.match(/EXPECTED_DATABASE_SCHEMA_VERSION\s*=\s*"([^"]+)"/)?.[1];
const migrationVersion = content.migration.match(/values\s*\(true,\s*'([^']+)'/i)?.[1];

const rules = [
  ["service declares an expected schema version", Boolean(serviceVersion)],
  ["migration declares a schema version", Boolean(migrationVersion)],
  ["service and migration schema versions match", Boolean(serviceVersion && serviceVersion === migrationVersion)],
  ["migration creates schema state table", content.migration.includes("create table if not exists public.app_schema_state")],
  ["migration creates readiness RPC", content.migration.includes("function public.deployment_readiness")],
  ["readiness RPC is service-role only", content.migration.includes("service_role required")],
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
