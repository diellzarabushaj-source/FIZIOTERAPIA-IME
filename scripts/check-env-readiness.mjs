const requestedEnvironment = process.argv.find((arg) => arg.startsWith("--environment="))?.split("=")[1]?.trim().toLowerCase();
const appEnvironment = requestedEnvironment || (process.env.APP_ENV || "").trim().toLowerCase() ||
  (process.env.VERCEL_ENV === "production" ? "production" : process.env.VERCEL_ENV === "preview" ? "staging" : process.env.NODE_ENV === "test" ? "test" : "development");

const validEnvironments = new Set(["development", "staging", "production", "test"]);
const requiredWebEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "PATIENT_SESSION_SECRET",
  "NEXT_PUBLIC_APP_URL",
];

const productionOnlyWebEnv = ["HEALTH_MONITOR_SECRET", "PATIENT_SESSION_REGISTRY_ENABLED"];

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
const issues = [];

function valueFor(name) {
  return String(process.env[name] || "").trim();
}

function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function validUrlForEnvironment(_name, value) {
  const parsed = parseUrl(value);
  if (!parsed) return false;
  if (appEnvironment === "development" || appEnvironment === "test") {
    if (parsed.protocol === "https:") return true;
    return parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname);
  }
  return parsed.protocol === "https:";
}

function statusFor(name) {
  const value = valueFor(name);
  if (!value) return "missing";
  if (name === "PATIENT_SESSION_SECRET" && value.length < 43) return "too_short";
  if (name === "HEALTH_MONITOR_SECRET" && value.length < 32) return "too_short";
  if (name === "PATIENT_SESSION_REGISTRY_ENABLED" && !["0", "1"].includes(value)) return "invalid_boolean";
  if (["NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_API_BASE_URL"].includes(name) && !validUrlForEnvironment(name, value)) {
    return "invalid_url";
  }
  return "present";
}

function rowsFor(group, names, required) {
  return names.map((name) => ({ group, name, required, status: statusFor(name) }));
}

const rows = [
  ...rowsFor("web", requiredWebEnv, true),
  ...rowsFor("web", productionOnlyWebEnv, appEnvironment === "production"),
  ...rowsFor("web", recommendedWebEnv, false),
  ...rowsFor("mobile", requiredMobileEnv, appEnvironment === "production"),
];

if (!validEnvironments.has(appEnvironment)) issues.push(`APP_ENV është i pavlefshëm: ${appEnvironment}`);

const clerkPublishable = valueFor("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
const clerkSecret = valueFor("CLERK_SECRET_KEY");
const appUrl = valueFor("NEXT_PUBLIC_APP_URL");
const supabaseUrl = valueFor("NEXT_PUBLIC_SUPABASE_URL");
const patientSessionRegistry = valueFor("PATIENT_SESSION_REGISTRY_ENABLED");

if (appEnvironment === "production") {
  if (!clerkPublishable.startsWith("pk_live_")) issues.push("Production kërkon Clerk publishable key të ambientit production.");
  if (!clerkSecret.startsWith("sk_live_")) issues.push("Production kërkon Clerk secret key të ambientit production.");
  if (/localhost|127\.0\.0\.1/i.test(appUrl)) issues.push("Production NEXT_PUBLIC_APP_URL nuk mund të jetë localhost.");
  if (patientSessionRegistry !== "1") issues.push("Production kërkon PATIENT_SESSION_REGISTRY_ENABLED=1 pas aplikimit të migration-it 20260711.3.");
}

if (appEnvironment === "staging" && appUrl && !/vercel\.app|staging|preview/i.test(appUrl)) {
  issues.push("Staging NEXT_PUBLIC_APP_URL duhet të jetë preview/staging URL, jo production domain.");
}

if (appEnvironment !== "development" && supabaseUrl && appUrl && supabaseUrl === appUrl) {
  issues.push("Supabase URL dhe App URL nuk duhet të jenë të njëjta.");
}

console.log(`Application environment: ${appEnvironment}`);
console.table(rows);

const invalidRequired = rows.filter((row) => row.required && row.status !== "present");
for (const row of invalidRequired) issues.push(`${row.name} (${row.group}): ${row.status}`);

if (issues.length) {
  console.error("\nEnvironment readiness failed:");
  for (const issue of [...new Set(issues)]) console.error(`- ${issue}`);
  console.error("\nSecrets are never printed by this script.");
  process.exitCode = 1;
} else {
  console.log("\nEnvironment readiness passed.");
}
