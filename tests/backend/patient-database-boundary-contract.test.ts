import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path: string) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("patient creation derives physio ownership only from the authenticated actor", async () => {
  const service = await source("lib/backend/patients.ts");

  assert.match(service, /p_physio_id: actor\.profileId/);
  assert.match(service, /p_enforce_capacity: actor\.role === "physio"/);
  assert.doesNotMatch(service, /CreatePatientInput[\s\S]*physioId/);
});

test("patient reads and mutations preserve cross-physio ownership checks", async () => {
  const service = await source("lib/backend/patients.ts");

  assert.match(service, /actorCanAccessPhysioResource\(actor, data\.physio_id\)/);
  assert.match(service, /query = query\.eq\("physio_id", actor\.profileId\)/);
  assert.match(service, /\.eq\("physio_id", patientResult\.data\.physio_id\)/);
});

test("atomic patient RPC is executable only by the server service role", async () => {
  const migration = await source("supabase/migrations/20260713_atomic_patient_capacity.sql");
  const workflow = await source(".github/workflows/postgres-integration.yml");
  const integration = await source("tests/database/patient-capacity-integration.sh");

  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /revoke all on function[\s\S]*from anon/);
  assert.match(migration, /revoke all on function[\s\S]*from authenticated/);
  assert.match(migration, /grant execute on function[\s\S]*to service_role/);
  assert.match(workflow, /postgres:16-alpine/);
  assert.match(integration, /exactly one concurrent request must receive the fifth free slot/);
  assert.match(integration, /authenticated role unexpectedly executed the service-only patient RPC/);
});
