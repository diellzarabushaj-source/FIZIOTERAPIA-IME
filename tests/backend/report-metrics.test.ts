import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { calculatePlanAdherence } from "../../lib/report-metrics.ts";

test("adherence counts only scheduled occurrences due by the report date", () => {
  const result = calculatePlanAdherence({
    plan: { start_date: "2026-07-01", end_date: "2026-07-14" },
    exercises: [
      { id: "exercise-a", day_number: 1, schedule_days: [1, 3, 5, 7] },
      { id: "exercise-b", day_number: 2, schedule_days: [2, 4, 6] },
    ],
    logs: [
      { plan_exercise_id: "exercise-a", completed: true, completed_at: "2026-07-01T10:00:00Z" },
      { plan_exercise_id: "exercise-a", completed: true, completed_at: "2026-07-03T10:00:00Z" },
      { plan_exercise_id: "exercise-b", completed: true, completed_at: "2026-07-02T10:00:00Z" },
      { plan_exercise_id: "exercise-b", completed: true, completed_at: "2026-07-02T18:00:00Z" },
      { plan_exercise_id: "old-plan-exercise", completed: true, completed_at: "2026-07-04T10:00:00Z" },
    ],
    asOf: new Date("2026-07-04T22:00:00Z"),
  });

  assert.deepEqual(result, {
    percentage: 75,
    plannedOccurrences: 4,
    completedOccurrences: 3,
    currentPlanDay: 4,
  });
});

test("adherence never exceeds one completion per scheduled exercise day", () => {
  const result = calculatePlanAdherence({
    plan: { start_date: "2026-07-01", end_date: "2026-07-01" },
    exercises: [{ id: "exercise-a", day_number: 1, schedule_days: [1] }],
    logs: [
      { plan_exercise_id: "exercise-a", completed: true, completed_at: "2026-07-01T08:00:00Z" },
      { plan_exercise_id: "exercise-a", completed: true, completed_at: "2026-07-01T18:00:00Z" },
    ],
    asOf: new Date("2026-07-03T00:00:00Z"),
  });

  assert.equal(result.percentage, 100);
  assert.equal(result.completedOccurrences, 1);
  assert.equal(result.plannedOccurrences, 1);
});

test("canonical report uses shared access control and omits patient access code", async () => {
  const report = await readFile(new URL("../../app/reports/[patientId]/page.tsx", import.meta.url), "utf8");
  const legacy = await readFile(new URL("../../app/reports/patient/[patientId]/page.tsx", import.meta.url), "utf8");

  assert.match(report, /requirePhysioActor/);
  assert.match(report, /getPatientForActor/);
  assert.match(report, /calculatePlanAdherence/);
  assert.match(report, /schedule_days/);
  assert.doesNotMatch(report, /patient\.patient_code/);
  assert.match(legacy, /redirect\(`\/reports\/\$\{patientId\}`\)/);
});
