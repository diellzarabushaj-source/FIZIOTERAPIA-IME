import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const BASE_URL = process.env.SMOKE_BASE_URL || "https://fizioterapia-ime.vercel.app";
const REPORT_PATH = process.env.SMOKE_REPORT_PATH || "reports/production-smoke-test.json";

const publicRoutes = [
  "/",
  "/blog",
  "/blog/si-funksionon-plani-digjital-i-fizioterapise",
  "/faq",
  "/support",
  "/clinic-use",
  "/launch-checklist",
  "/qa-checklist",
  "/pilot-onboarding",
  "/pilot-launch",
  "/pilot-readiness",
  "/pilot-runbook",
  "/pilot-communications",
  "/mobile-submission",
  "/final-handoff",
  "/patient-handout",
  "/pilot-feedback",
  "/patient-portal",
  "/privacy",
  "/terms",
  "/medical-disclaimer",
  "/camera-consent",
  "/data-deletion",
];

const expectedContent = {
  "/": "Fizioterapia ime",
  "/blog": "Artikuj të thjeshtë",
  "/blog/si-funksionon-plani-digjital-i-fizioterapise": "Si funksionon plani digjital",
  "/pilot-launch": "Paketa finale",
  "/pilot-readiness": "Final gate para pilotit",
  "/pilot-runbook": "Runbook 7-ditor",
  "/pilot-communications": "Mesazhet gati",
  "/mobile-submission": "Mobile submission handoff",
  "/final-handoff": "Final handoff",
  "/patient-handout": "Si me përdorë Fizioterapia ime",
  "/pilot-feedback": "Feedback form",
  "/qa-checklist": "Final testing script",
};

async function checkRoute(route) {
  const url = `${BASE_URL}${route}`;
  const startedAt = Date.now();
  const response = await fetch(url, {
    redirect: "manual",
    headers: {
      "user-agent": "fizioterapia-ime-smoke-test/1.0",
    },
  });

  const text = await response.text();
  const expected = expectedContent[route];
  const hasExpectedContent = expected ? text.includes(expected) : true;
  const ok = response.status === 200 && hasExpectedContent;

  return {
    route,
    url,
    status: response.status,
    ok,
    ms: Date.now() - startedAt,
    expectedText: expected || null,
    reason: !ok
      ? response.status !== 200
        ? `Expected 200, got ${response.status}`
        : `Missing expected text: ${expected}`
      : "OK",
  };
}

const results = [];
for (const route of publicRoutes) {
  try {
    results.push(await checkRoute(route));
  } catch (error) {
    results.push({
      route,
      url: `${BASE_URL}${route}`,
      status: "error",
      ok: false,
      ms: null,
      expectedText: expectedContent[route] || null,
      reason: error instanceof Error ? error.message : String(error),
    });
  }
}

const failures = results.filter((result) => !result.ok);
const report = {
  app: "Fizioterapia ime",
  baseUrl: BASE_URL,
  generatedAt: new Date().toISOString(),
  total: results.length,
  passed: results.length - failures.length,
  failed: failures.length,
  status: failures.length ? "failed" : "passed",
  results,
};

console.table(results.map(({ route, status, ok, ms, reason }) => ({ route, status, ok, ms, reason })));

const reportAbsolutePath = resolve(REPORT_PATH);
mkdirSync(dirname(reportAbsolutePath), { recursive: true });
writeFileSync(reportAbsolutePath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`\nSmoke report written to ${REPORT_PATH}`);

if (failures.length) {
  console.error(`\nSmoke test failed for ${failures.length} route(s).`);
  process.exit(1);
}

console.log(`\nSmoke test passed for ${results.length} public route(s).`);
