import { expect, test, type Browser } from "@playwright/test";

const ownerState = "test-results/auth/owner.json";
const physioAState = "test-results/auth/physio-a.json";
const physioBState = "test-results/auth/physio-b.json";
const patientAPath = process.env.E2E_PHYSIO_A_PATIENT_PATH;
const patientBPath = process.env.E2E_PHYSIO_B_PATIENT_PATH;

async function openWithState(browser: Browser, storageState: string, path: string) {
  const context = await browser.newContext({ storageState });
  const page = await context.newPage();
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  return { context, page, response };
}

test.describe("real Clerk/Supabase role boundaries", () => {
  test.skip(!patientAPath || !patientBPath, "Synthetic staging patient paths are required.");

  test("owner can open the administrative dashboard", async ({ browser }) => {
    const { context, page, response } = await openWithState(browser, ownerState, "/admin-dashboard");
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/admin-dashboard/);
    await context.close();
  });

  test("physiotherapist cannot open the administrative dashboard", async ({ browser }) => {
    const { context, page } = await openWithState(browser, physioAState, "/admin-dashboard");
    await expect(page).not.toHaveURL(/\/admin-dashboard\/?$/);
    await context.close();
  });

  test("physiotherapist A can open own synthetic patient", async ({ browser }) => {
    const { context, page, response } = await openWithState(browser, physioAState, patientAPath!);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(new RegExp(patientAPath!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    await context.close();
  });

  test("physiotherapist A cannot open physiotherapist B patient", async ({ browser }) => {
    const { context, page, response } = await openWithState(browser, physioAState, patientBPath!);
    const deniedByStatus = response ? [401, 403, 404].includes(response.status()) : false;
    const deniedByRedirect = !page.url().includes(patientBPath!);
    expect(deniedByStatus || deniedByRedirect).toBe(true);
    await context.close();
  });

  test("physiotherapist B cannot open physiotherapist A patient", async ({ browser }) => {
    const { context, page, response } = await openWithState(browser, physioBState, patientAPath!);
    const deniedByStatus = response ? [401, 403, 404].includes(response.status()) : false;
    const deniedByRedirect = !page.url().includes(patientAPath!);
    expect(deniedByStatus || deniedByRedirect).toBe(true);
    await context.close();
  });
});
