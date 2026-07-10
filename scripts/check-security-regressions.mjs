import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";

const requiredFiles = [
  "supabase/migrations/20260710_harden_patient_login.sql",
  "supabase/migrations/20260710_harden_clinical_plan_integrity.sql",
  "supabase/migrations/20260710_make_audit_logs_immutable.sql",
  "supabase/migrations/20260710_link_clerk_identity_safely.sql",
];

const checks = [
  {
    file: "app/patient-dashboard/page.tsx",
    forbidden: [".eq(\"patient_code\", patientCode)", ".eq('patient_code', patientCode)"],
    required: ["getActivePatientBySignedCode"],
  },
  {
    file: "app/api/patient/ai-check/route.ts",
    forbidden: ["cookies().get(\"fizioplan_patient_code\")"],
    required: ["getActivePatientBySignedCode", "ai_enabled"],
  },
  {
    file: "app/api/mobile/save-progress/route.ts",
    forbidden: ["patientId: body.patientId", "code: body.code"],
    required: ["verifyPatientSessionToken", "status\", \"active"],
  },
  {
    file: "lib/backend/plans.ts",
    forbidden: ["status === \"pending_review\" || status === \"approved\""],
    required: ["status === \"draft\"", "activate_plan_safely"],
  },
  {
    file: "lib/backend-logic.ts",
    forbidden: ["CLERK_SECRET_KEY ||", "SUPABASE_SERVICE_ROLE_KEY ||", "dev-only"],
    required: ["PATIENT_SESSION_SECRET"],
  },
];

const failures = [];
for (const path of requiredFiles) {
  try {
    await access(path, constants.R_OK);
  } catch {
    failures.push(`${path}: required security migration is missing`);
  }
}

for (const check of checks) {
  let source;
  try {
    source = await readFile(check.file, "utf8");
  } catch {
    failures.push(`${check.file}: file is missing`);
    continue;
  }

  for (const pattern of check.forbidden) {
    if (source.includes(pattern)) failures.push(`${check.file}: forbidden pattern found: ${pattern}`);
  }
  for (const pattern of check.required) {
    if (!source.includes(pattern)) failures.push(`${check.file}: required pattern missing: ${pattern}`);
  }
}

if (failures.length) {
  console.error("Security regression gate failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Security regression gate passed.");
