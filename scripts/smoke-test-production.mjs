const BASE_URL = process.env.SMOKE_BASE_URL || "https://fizioterapia-ime.vercel.app";

const publicRoutes = [
  "/",
  "/faq",
  "/support",
  "/clinic-use",
  "/launch-checklist",
  "/qa-checklist",
  "/pilot-onboarding",
  "/pilot-launch",
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
  "/pilot-launch": "Paketa finale",
  "/patient-handout": "Si me përdorë Fizioterapia ime",
  "/pilot-feedback": "Feedback form",
  "/qa-checklist": "Final testing script",
};

async function checkRoute(route) {
  const url = `${BASE_URL}${route}`;
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
      reason: error instanceof Error ? error.message : String(error),
    });
  }
}

console.table(results.map(({ route, status, ok, reason }) => ({ route, status, ok, reason })));

const failures = results.filter((result) => !result.ok);
if (failures.length) {
  console.error(`\nSmoke test failed for ${failures.length} route(s).`);
  process.exit(1);
}

console.log(`\nSmoke test passed for ${results.length} public route(s).`);
