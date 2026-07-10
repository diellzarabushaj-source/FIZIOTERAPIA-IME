import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const BASE_URL = (process.env.QA_BASE_URL || "https://fizioterapia-ime.vercel.app").replace(/\/$/, "");
const REPORT_PATH = process.env.QA_REPORT_PATH || "reports/production-security-qa.json";

const results = [];

function record(name, ok, details = {}) {
  results.push({ name, ok, ...details });
}

async function request(path, init = {}) {
  const startedAt = Date.now();
  const response = await fetch(`${BASE_URL}${path}`, {
    redirect: "manual",
    headers: {
      "user-agent": "fizioterapia-ime-production-qa/1.0",
      ...(init.headers || {}),
    },
    ...init,
  });
  const body = await response.text();
  return { response, body, ms: Date.now() - startedAt };
}

async function run(name, test) {
  try {
    const details = await test();
    record(name, true, details);
  } catch (error) {
    record(name, false, { reason: error instanceof Error ? error.message : String(error) });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

await run("Public homepage responds securely", async () => {
  const { response, body, ms } = await request("/");
  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(body.includes("Fizioterapia ime"), "Homepage brand text missing");
  const requiredHeaders = [
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy",
  ];
  const missing = requiredHeaders.filter((header) => !response.headers.get(header));
  assert(missing.length === 0, `Missing security headers: ${missing.join(", ")}`);
  return { status: response.status, ms };
});

for (const path of ["/physiotherapist-portal", "/admin-billing", "/patient-dashboard"]) {
  await run(`Protected page rejects anonymous access: ${path}`, async () => {
    const { response, ms } = await request(path);
    assert([302, 303, 307, 308, 401, 403].includes(response.status), `Expected redirect/auth failure, got ${response.status}`);
    return { status: response.status, location: response.headers.get("location"), ms };
  });
}

await run("Patient AI endpoint rejects missing session", async () => {
  const { response, body, ms } = await request("/api/patient/ai-check", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ planExerciseId: "00000000-0000-0000-0000-000000000000", score: 90 }),
  });
  assert([400, 401, 403].includes(response.status), `Expected 4xx, got ${response.status}`);
  assert(!/postgres|supabase|relation .* does not exist|stack/i.test(body), "Response appears to expose internal database details");
  return { status: response.status, ms };
});

await run("Mobile progress endpoint rejects unsigned requests", async () => {
  const { response, body, ms } = await request("/api/mobile/save-progress", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      code: "INVALID",
      patientId: "00000000-0000-0000-0000-000000000000",
      planExerciseId: "00000000-0000-0000-0000-000000000000",
      painScore: 1,
    }),
  });
  assert([400, 401, 403].includes(response.status), `Expected 4xx, got ${response.status}`);
  assert(!/postgres|supabase|stack/i.test(body), "Response appears to expose internal implementation details");
  return { status: response.status, ms };
});

await run("Mobile patient session rejects invalid code", async () => {
  const { response, body, ms } = await request("/api/mobile/patient-session", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.10" },
    body: JSON.stringify({ code: "QA-INVALID-CODE" }),
  });
  assert([400, 401, 404, 429].includes(response.status), `Expected invalid-login response, got ${response.status}`);
  assert(!/postgres|supabase|stack/i.test(body), "Response appears to expose internal implementation details");
  return { status: response.status, ms };
});

await run("QR endpoint rejects anonymous access", async () => {
  const { response, ms } = await request("/api/patient/access-qr/QA-INVALID-CODE");
  assert([302, 303, 307, 308, 401, 403, 404].includes(response.status), `Expected protected response, got ${response.status}`);
  return { status: response.status, ms };
});

const failures = results.filter((result) => !result.ok);
const report = {
  app: "Fizioterapia ime",
  suite: "production-security-qa",
  baseUrl: BASE_URL,
  generatedAt: new Date().toISOString(),
  total: results.length,
  passed: results.length - failures.length,
  failed: failures.length,
  status: failures.length ? "failed" : "passed",
  results,
};

console.table(results.map(({ name, ok, status, ms, reason }) => ({ name, ok, status, ms, reason })));
const reportAbsolutePath = resolve(REPORT_PATH);
mkdirSync(dirname(reportAbsolutePath), { recursive: true });
writeFileSync(reportAbsolutePath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`\nQA report written to ${REPORT_PATH}`);

if (failures.length) {
  console.error(`\nProduction security QA failed for ${failures.length} check(s).`);
  process.exit(1);
}

console.log(`\nProduction security QA passed (${results.length} checks).`);
