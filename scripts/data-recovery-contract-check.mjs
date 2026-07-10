import { readFile } from "node:fs/promises";

const checks = [
  ["docs/backup-restore-retention.md", ["Recovery Point Objective", "Recovery Time Objective", "restore drill", "clinical records", "staging"]],
  ["lib/backend/patients.ts", ["archived_at", "archive_reason", "restorePatientForActor", "patient.archived", "patient.restored"]],
  ["supabase/migrations/20260710_clinical_soft_delete_and_retention.sql", ["prevent_clinical_hard_delete", "data_retention_policies", "retention_candidate_counts", "activate_plan_safely"]],
];

const failures = [];
for (const [path, requiredFragments] of checks) {
  let content = "";
  try {
    content = await readFile(path, "utf8");
  } catch {
    failures.push(`${path}: file missing`);
    continue;
  }
  for (const fragment of requiredFragments) {
    if (!content.includes(fragment)) failures.push(`${path}: missing ${fragment}`);
  }
}

const patientsService = await readFile("lib/backend/patients.ts", "utf8");
if (/from\(["']patients["']\)\.delete\(/.test(patientsService)) {
  failures.push("Patient service must never hard-delete patients.");
}

const plansService = await readFile("lib/backend/plans.ts", "utf8");
if (/from\(["']plans["']\)\.delete\(/.test(plansService)) {
  failures.push("Plan service must never hard-delete plans.");
}

if (failures.length) {
  console.error("Data recovery contract failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Data recovery, retention and soft-delete contract passed.");
