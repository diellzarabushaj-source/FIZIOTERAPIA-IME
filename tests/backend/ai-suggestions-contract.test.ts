import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const service = readFileSync("lib/backend/ai-suggestions.ts", "utf8");
const route = readFileSync("app/api/ai/exercise-suggestions/route.ts", "utf8");
const migration = readFileSync("supabase/migrations/20260710150000_add_safe_ai_clinical_suggestions.sql", "utf8");

test("AI suggestions are tied to verified patient and draft plan ownership", () => {
  assert.match(service, /getPatientForActor/);
  assert.match(service, /getPlanForActor/);
  assert.match(service, /status !== "draft"/);
  assert.match(service, /patient_id !== patientResult\.data\.id/);
});

test("AI only suggests exercise IDs from the permitted exercise library", () => {
  assert.match(service, /listExercisesForActor/);
  assert.match(service, /candidate_exercise_ids/);
  assert.match(service, /candidate_exercise_ids\.includes/);
  assert.doesNotMatch(route, /fallbackSuggestions/);
});

test("AI cannot auto-approve or auto-activate plans", () => {
  assert.doesNotMatch(service, /transitionPlanForActor/);
  assert.doesNotMatch(service, /activate_plan_safely/);
  assert.match(route, /autoApproval: false/);
  assert.match(route, /autoActivation: false/);
});

test("physiotherapist review is recorded and audited", () => {
  assert.match(service, /reviewed_by/);
  assert.match(service, /reviewed_at/);
  assert.match(service, /ai_suggestion\.exercise_accepted/);
  assert.match(service, /ai_suggestion\.rejected/);
});

test("AI suggestion table is server-only", () => {
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /revoke all privileges on public\.ai_suggestions from anon, authenticated/i);
  assert.match(migration, /grant select, insert, update on public\.ai_suggestions to service_role/i);
});
