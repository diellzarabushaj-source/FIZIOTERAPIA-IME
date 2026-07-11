import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);
const exerciseMigrationPath = "supabase/migrations/20260711_zz_exercise_library_readiness.sql";
const finalMigrationPath = "supabase/migrations/20260711_zzz_patient_handoffs.sql";

async function source(path: string) {
  return readFile(new URL(path, root), "utf8");
}

test("exercise library migration supplies every column used by the backend", async () => {
  const [migration, service] = await Promise.all([
    source(exerciseMigrationPath),
    source("lib/backend/exercises.ts"),
  ]);

  for (const column of ["is_default", "owner_physio_id", "status", "updated_at"]) {
    assert.match(migration, new RegExp(`add column if not exists ${column}`));
    assert.match(service, new RegExp(column));
  }

  assert.match(migration, /exercise_library_visibility_idx/);
  assert.match(migration, /exercise_library\.owner_physio_id/);
});

test("application and final migration agree on schema version", async () => {
  const [readiness, finalMigration] = await Promise.all([
    source("lib/backend/schema-readiness.ts"),
    source(finalMigrationPath),
  ]);

  assert.match(readiness, /EXPECTED_DATABASE_SCHEMA_VERSION = "20260711\.5"/);
  assert.match(finalMigration, /values \(true, '20260711\.5', now\(\)\)/);
  assert.ok(exerciseMigrationPath > "supabase/migrations/20260711_patient_session_registry.sql");
  assert.ok(finalMigrationPath > exerciseMigrationPath);
});

test("baseline schema documents migrations and includes exercise ownership fields", async () => {
  const baseline = await source("supabase/schema.sql");

  assert.match(baseline, /apply every file in supabase\/migrations in order/);
  assert.match(baseline, /is_default boolean not null default true/);
  assert.match(baseline, /owner_physio_id uuid references profiles/);
  assert.match(baseline, /status text not null default 'published'/);
});
