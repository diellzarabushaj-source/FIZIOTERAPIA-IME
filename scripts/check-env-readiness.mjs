const requiredWebEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
];

const recommendedWebEnv = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "RESEND_REPLY_TO_EMAIL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "NEXT_PUBLIC_SANITY_API_VERSION",
];

const requiredMobileEnv = [
  "EXPO_PUBLIC_API_BASE_URL",
];

function statusFor(name) {
  const value = process.env[name];
  if (!value) return "missing";
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

const missingRequired = rows.filter((row) => row.required && row.status === "missing");

if (missingRequired.length) {
  console.error("\nMissing required environment variables:");
  for (const row of missingRequired) {
    console.error(`- ${row.name} (${row.group})`);
  }
  console.error("\nSet these in Vercel for web/backend and in EAS/Expo local env for mobile as appropriate.");

  if (process.env.REQUIRE_ENV === "1") {
    process.exit(1);
  }

  console.error("\nNon-blocking mode: set REQUIRE_ENV=1 to fail CI when required env vars are missing.");
} else {
  console.log("\nRequired environment variables are present.");
}

console.log("\nSanity note: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and NEXT_PUBLIC_SANITY_API_VERSION are recommended. If they are missing, /blog uses static fallback.");
console.log("\nSecurity reminder: never print or commit secret values. This script only reports presence/missing status.");
