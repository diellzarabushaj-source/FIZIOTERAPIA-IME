const requiredWebEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "PATIENT_SESSION_SECRET",
  "NEXT_PUBLIC_APP_URL",
];

const recommendedWebEnv = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "ADMIN_EMAIL",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "RESEND_REPLY_TO_EMAIL",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "NEXT_PUBLIC_SANITY_API_VERSION",
];

const requiredMobileEnv = ["EXPO_PUBLIC_API_BASE_URL"];

function statusFor(name) {
  const value = process.env[name];
  if (!value) return "missing";
  if (name === "PATIENT_SESSION_SECRET" && value.length < 32) return "too_short";
  return "present";
}

function rowsFor(group, names, required) {
  return names.map((name) => ({ group, name, required, status: statusFor(name) }));
}

const rows = [
  ...rowsFor("web", requiredWebEnv, true),
  ...rowsFor("web", recommendedWebEnv, false),
  ...rowsFor("mobile", requiredMobileEnv, true),
];

console.table(rows);
const invalidRequired = rows.filter((row) => row.required && row.status !== "present");

if (invalidRequired.length) {
  console.error("\nMissing or invalid required environment variables:");
  for (const row of invalidRequired) console.error(`- ${row.name} (${row.group}): ${row.status}`);
  console.error("\nSet these in Vercel for web/backend and in EAS/Expo for mobile.");
  process.exitCode = 1;
} else {
  console.log("\nRequired environment variables are present.");
}

console.log("\nSecurity reminder: never print or commit secret values. This script only reports readiness state.");
