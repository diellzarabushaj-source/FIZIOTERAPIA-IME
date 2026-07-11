import { readFile } from "node:fs/promises";

const files = {
  checker: "scripts/check-env-readiness.mjs",
  example: ".env.example",
  docs: "docs/environment-separation.md",
};

const content = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);

const rules = [
  ["checker derives APP_ENV", content.checker.includes("APP_ENV")],
  ["checker recognizes staging", content.checker.includes('"staging"')],
  ["checker recognizes production", content.checker.includes('"production"')],
  ["production requires Clerk publishable live key", content.checker.includes("pk_live_")],
  ["production requires Clerk secret live key", content.checker.includes("sk_live_")],
  ["production blocks localhost", content.checker.includes("localhost")],
  ["checker validates HTTPS", content.checker.includes("https:")],
  ["checker validates patient session registry boolean", content.checker.includes('!["0", "1"].includes(value)')],
  ["production requires patient session registry enabled", content.checker.includes('patientSessionRegistry !== "1"')],
  ["example documents APP_ENV", content.example.includes("APP_ENV")],
  ["example documents patient session registry", content.example.includes("PATIENT_SESSION_REGISTRY_ENABLED=0")],
  ["documentation defines Development", content.docs.includes("## Development")],
  ["documentation defines Staging", content.docs.includes("## Staging")],
  ["documentation defines Production", content.docs.includes("## Production")],
  ["documentation forbids production patient data in staging", content.docs.includes("No production patient data")],
  ["documentation separates clinical and auth sessions", content.docs.includes("public.patient_auth_sessions") && content.docs.includes("public.patient_sessions")],
  ["documentation requires migration before enabling registry", content.docs.includes("schema version `20260711.3`")],
];

const failed = rules.filter(([, passed]) => !passed);
console.table(rules.map(([rule, passed]) => ({ rule, status: passed ? "pass" : "fail" })));

if (failed.length) {
  console.error("Environment contract regression detected:");
  for (const [rule] of failed) console.error(`- ${rule}`);
  process.exitCode = 1;
} else {
  console.log("Environment separation contract passed.");
}
