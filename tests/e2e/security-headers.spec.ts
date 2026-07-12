import { expect, test } from "@playwright/test";

test("public responses include baseline security headers", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  const headers = response.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toContain("strict-origin");
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
});

test("private entry routes are not indexable or cacheable", async ({ request }) => {
  const response = await request.get("/patient-portal");
  const headers = response.headers();
  expect(headers["x-robots-tag"]).toContain("noindex");
  expect(headers["cache-control"]).toContain("no-store");
});

test("CSP report collector accepts a sanitized same-origin report", async ({ request, baseURL }) => {
  const response = await request.post("/api/security/csp-report", {
    headers: {
      "content-type": "application/csp-report",
      origin: baseURL ?? "https://fizioterapia-ime.vercel.app",
    },
    data: {
      "csp-report": {
        "effective-directive": "script-src",
        "blocked-uri": "inline",
        disposition: "report",
      },
    },
  });
  expect(response.status()).toBe(204);
});

test("CSP report collector rejects oversized payloads", async ({ request, baseURL }) => {
  const response = await request.post("/api/security/csp-report", {
    headers: {
      "content-type": "application/csp-report",
      origin: baseURL ?? "https://fizioterapia-ime.vercel.app",
    },
    data: { report: "x".repeat(20_000) },
  });
  expect(response.status()).toBe(413);
});
