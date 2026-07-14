import { readFileSync } from "node:fs";

const checks = [
  {
    file: "app/patient-dashboard/page.tsx",
    mustContain: ["getPatientDashboardData"],
    mustNotContain: ["fizioplan_patient_code", "getSupabaseAdmin"],
    label: "Patient dashboard delegates clinical data access to the typed server boundary",
  },
  {
    file: "src/features/patients/server/patient-dashboard.ts",
    mustContain: [
      'import "server-only"',
      "getCurrentPatientSession",
      '.eq("status", "active")',
      '.is("archived_at", null)',
    ],
    mustNotContain: ["fizioplan_patient_code"],
    label: "Patient dashboard server boundary requires the shared signed session and active patient ownership",
  },
  {
    file: "app/api/patient/ai-check/route.ts",
    mustContain: ["getCurrentPatientSession", "requireAssignedPlanExercise", "deriveAlertType"],
    mustNotContain: ["allowedAlertTypes", "body.alertType"],
    label: "AI endpoint verifies session, ownership, AI eligibility, and server-derived severity",
  },
  {
    file: "app/api/mobile/save-progress/route.ts",
    mustContain: [
      "validatePatientSession",
      "patientSessionRegistryEnabled",
      "requireAssignedPlanExercise",
      "getBearerToken",
      "evaluatePainSafety",
    ],
    mustNotContain: ["alertType: body.alertType"],
    label: "Mobile progress uses revocable sessions, ownership, active-plan assignment and server-derived safety",
  },
  {
    file: "app/api/mobile/patient-session/route.ts",
    mustContain: [
      "check_patient_login_attempt",
      "record_patient_login_result",
      "createPatientSession",
      "revokePatientSession",
      "patientSessionRegistryEnabled",
      "signPatientCode",
    ],
    label: "Mobile login has rate limiting, revocable registry sessions, logout and a migration-compatible signed fallback",
  },
  {
    file: "apps/mobile-app/lib/api.ts",
    mustContain: [
      "EXPO_PUBLIC_API_BASE_URL",
      "authorization: `Bearer ${token}`",
      "activePatientSessionToken = \"\"",
      "REQUEST_TIMEOUT_MS",
    ],
    mustNotContain: ["https://fizioterapia-ime.vercel.app\").replace"],
    label: "Mobile client requires explicit environment configuration and keeps session tokens out of request bodies",
  },
  {
    file: "apps/mobile-app/App.tsx",
    mustContain: ["mustStopExerciseForPain", "Ky pilot mobile nuk aktivizon kamerën"],
    mustNotContain: ["DEMO_PATIENT", "DEMO_EXERCISES", "const aiScore", "Demo mode aktiv"],
    label: "Mobile runtime has no fake patient, exercise or AI result fallback",
  },
  {
    file: "lib/backend-logic.ts",
    mustContain: [
      "PATIENT_SESSION_MAX_AGE_SECONDS",
      "PATIENT_SESSION_SECRET_MIN_LENGTH",
      "timingSafeEqual",
      "must contain at least",
      '.eq("plans.status", "active")',
    ],
    mustNotContain: ["CLERK_SECRET_KEY ||", "SUPABASE_SERVICE_ROLE_KEY ||"],
    label: "Patient sessions expire, require a dedicated strong secret, fail closed, and enforce active-plan ownership",
  },
  {
    file: "lib/backend/patient-sessions.ts",
    mustContain: [
      "evaluatePatientSessionPolicy",
      "decision.revokeReason",
      "decision.shouldTouch",
    ],
    label: "Patient session persistence applies the tested expiry, revocation, idle-timeout and rolling-touch policy",
  },
  {
    file: "lib/backend/admin.ts",
    mustContain: ["canManageOwnerBilling", "requireOwnerRole"],
    mustNotContain: ['actor.role !== "owner" && actor.role !== "admin"'],
    label: "Billing and subscription mutations remain owner-only at the backend service boundary",
  },
  {
    file: "app/api/patient/access-qr/[code]/route.ts",
    mustContain: ["actorCanAccessPhysioResource", '.eq("status", "active")'],
    label: "QR generation checks operator authentication, patient ownership, and status",
  },
  {
    file: "app/auth/continue/page.tsx",
    mustContain: ["getActorContext", "getWorkspaceHome", "profile-not-active"],
    label: "Post-authentication routing resolves the authorized actor and sends the user to the role workspace",
  },
  {
    file: "app/admin-feedback/page.tsx",
    mustContain: ["requireOwnerActor"],
    mustNotContain: ["currentUser", "diellzarabushaj@gmail.com"],
    label: "Admin feedback page uses centralized owner authorization instead of a hard-coded email",
  },
  {
    file: "app/admin-feedback/actions.ts",
    mustContain: ["requireOwnerActor"],
    mustNotContain: ["currentUser", "diellzarabushaj@gmail.com", "requireAdminEmail"],
    label: "Admin feedback mutations re-authorize the owner on the server",
  },
  {
    file: "next.config.mjs",
    mustContain: [
      "Content-Security-Policy",
      "Strict-Transport-Security",
      "X-Content-Type-Options",
      "Permissions-Policy",
    ],
    label: "Production security headers are configured",
  },
  {
    file: "proxy.ts",
    mustContain: [
      "/physiotherapist-portal",
      "Patient code routes are intentionally public at the Clerk layer",
    ],
    label: "Operator routes use Clerk while patient clinical data uses signed server sessions",
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
    if (!source.includes(token)) {
      failures.push(`${check.label}: ${check.file} is missing ${JSON.stringify(token)}`);
    }
  }
  for (const token of check.mustNotContain || []) {
    if (source.includes(token)) {
      failures.push(`${check.label}: ${check.file} contains forbidden ${JSON.stringify(token)}`);
    }
  }
}

if (failures.length) {
  console.error("Security regression check failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Security regression check passed (${checks.length} controls).`);
