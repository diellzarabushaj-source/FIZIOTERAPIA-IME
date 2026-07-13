import { expect, test } from "@playwright/test";

const UNKNOWN_PATIENT_ID = "11111111-1111-4111-8111-111111111111";
const CLINICAL_MARKERS = [
  "Databaza klinike",
  "Diagnoza / arsyeja",
  "Seancat e fundit",
  "Matjet e progresit",
  "patient_code",
  "access_code",
];

async function expectNoClinicalContent(body: string) {
  for (const marker of CLINICAL_MARKERS) {
    expect(body, `Response must not expose clinical marker: ${marker}`).not.toContain(marker);
  }
}

test.describe("Negative authorization and privacy boundaries", () => {
  test("unauthenticated physiotherapist workspace redirects to sign-in", async ({ page }) => {
    const response = await page.goto("/physiotherapist-portal/overview", {
      waitUntil: "domcontentloaded",
    });

    expect(response).not.toBeNull();
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/sign-in(?:\?|$)/);
    await expect(page.locator("body")).not.toContainText("Lista e pacientëve");
  });

  test("unauthenticated owner route never renders admin data", async ({ page }) => {
    const response = await page.goto("/admin-dashboard", {
      waitUntil: "domcontentloaded",
    });

    expect(response).not.toBeNull();
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/(?:admin-hidden|sign-in)(?:\?|$)/);
    const body = await page.locator("body").innerText();
    await expectNoClinicalContent(body);
    expect(body).not.toContain("Manual Billing");
  });

  test("random patient report id is indistinguishable from a missing resource", async ({ page }) => {
    const response = await page.goto(`/patient-report/${UNKNOWN_PATIENT_ID}`, {
      waitUntil: "domcontentloaded",
    });

    expect(response).not.toBeNull();
    expect(response?.status()).toBe(404);
    const body = await page.locator("body").innerText();
    await expectNoClinicalContent(body);
    expect(body).not.toContain(UNKNOWN_PATIENT_ID);
  });

  test("development patient fixtures are not reachable in production mode", async ({ page }) => {
    const response = await page.goto("/patient-dashboard/demo", {
      waitUntil: "domcontentloaded",
    });

    expect(response).not.toBeNull();
    expect(response?.status()).toBe(404);
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("PACIENTI DEMO");
    expect(body).not.toContain("Arta");
    expect(body).not.toContain("Heel slides");
  });

  test("AI result endpoint rejects a cross-origin write before data access", async ({ request }) => {
    const response = await request.post("/api/patient/ai-check", {
      headers: {
        Origin: "https://attacker.example",
        "Content-Type": "application/json",
      },
      data: {
        planExerciseId: UNKNOWN_PATIENT_ID,
        score: 95,
        feedback: "client-controlled feedback",
        alertType: "good",
      },
    });

    expect(response.status()).toBe(403);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["x-request-id"]).toBeTruthy();
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "invalid_origin",
      requestId: expect.any(String),
    });
  });

  test("AI result endpoint fails closed without a patient session", async ({ request }) => {
    const response = await request.post("/api/patient/ai-check", {
      headers: { "Content-Type": "application/json" },
      data: {
        planExerciseId: UNKNOWN_PATIENT_ID,
        score: 95,
      },
    });

    expect([401, 503]).toContain(response.status());
    const payload = await response.json();
    expect(["patient_not_logged_in", "service_unavailable"]).toContain(payload.error);
    expect(JSON.stringify(payload)).not.toContain("diagnosis");
    expect(JSON.stringify(payload)).not.toContain("patient_id");
  });

  test("protected mobile write does not accept an invented bearer token", async ({ request }) => {
    const response = await request.post("/api/mobile/save-progress", {
      headers: {
        Authorization: "Bearer invented-session-token",
        "Content-Type": "application/json",
      },
      data: {
        patientId: UNKNOWN_PATIENT_ID,
        planExerciseId: UNKNOWN_PATIENT_ID,
        completed: true,
        painScore: 0,
      },
    });

    expect(response.status()).toBeLessThan(500);
    expect([401, 403, 503]).toContain(response.status());
    const body = await response.text();
    await expectNoClinicalContent(body);
  });
});
