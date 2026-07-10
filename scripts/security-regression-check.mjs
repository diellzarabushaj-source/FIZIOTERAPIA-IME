import { readFileSync } from "node:fs";

const checks = [
  {
    file: "app/patient-dashboard/page.tsx",
    mustContain: ["getCurrentPatientSession"],
    mustNotContain: ["fizioplan_patient_code"],
    label: "Patient dashboard requires the shared signed-session guard",
  },
  {
    file: "app/api/patient/ai-check/route.ts",
    mustContain: ["getCurrentPatientSession", "requireAssignedPlanExercise", "deriveAlertType"],
    mustNotContain: ["allowedAlertTypes", "body.alertType"],
    label: "AI endpoint verifies session, ownership, AI eligibility, and server-derived severity",
  },
  {
    file: "app/api/mobile/save-progress/route.ts",
    mustContain: ["verifyPatientCodeSignature", "requireAssignedPlanExercise", ".eq(\"patient_code\", code)"],
    mustNotContain: ["alertType: body.alertType"],
    label: "Mobile progress blocks IDOR and client-selected alert severity",
  },
  {
    file: "app/api/mobile/patient-session/route.ts",
    mustContain: ["check_patient_login_attempt", "record_patient_login_result", "signPatientCode"],
    label: "Mobile login has rate limiting and signed sessions",
  },
  {
    file: "lib/backend-logic.ts",
    mustContain: ["PATIENT_SESSION_MAX_AGE_SECONDS", "timingSafeEqual", "PATIENT_SESSION_SECRET is required in production", ".eq(\"plans.status\", \"active\")"],
    mustNotContain: ["CLERK_SECRET_KEY ||", "SUPABASE_SERVICE_ROLE_KEY ||"],
    label: "Patient sessions expire, fail closed, and active-plan ownership is enforced",
  },
  {
    file: "app/api/patient/access-qr/[code]/route.ts",
    mustContain: ["actorCanAccessPhysioResource", ".eq(\"status\", \"active\")"],
    label: "QR access checks patient ownership and status",
  },
  {
    file: "next.config.ts",
    mustContain: ["Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options", "Permissions-Policy"],
    label: "Production security headers are configured",
  },
  {
    file: "proxy.ts",
    mustContain: ["/physiotherapist-portal", "/patient-access"],
    label: "Clinical and operator routes are protected at the proxy layer",
  },
  {
    file: "scripts/check-env-readiness.mjs",
    mustContain: ["PATIENT_SESSION_SECRET"],
    label: "Environment readiness requires the dedicated session secret",
  },
];

const failures = [];

for (const check of checks) {
  let source;
  try {
    source = readFileSync(check.file, "utf8");
  } catch {
    failures.push(`${check.label}: missing ${check.file}`);
    continue;
  }

  for (const token of check.mustContain || []) {
    if (!source.includes(token)) failures.push(`${check.label}: ${check.file} is missing ${JSON.stringify(token)}`);
  }
  for (const token of check.mustNotContain || []) {
    if (source.includes(token)) failures.push(`${check.label}: ${check.file} contains forbidden ${JSON.stringify(token)}`);
  }
}

if (failures.length) {
  console.error("Security regression check failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Security regression check passed (${checks.length} controls).`);
