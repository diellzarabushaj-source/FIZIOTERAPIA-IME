import { expect, test } from "@playwright/test";

test.describe("Production fixture isolation", () => {
  test("patient mock dashboard route is not deployed", async ({ page }) => {
    const response = await page.goto("/patient-dashboard/demo", {
      waitUntil: "domcontentloaded",
    });

    expect(response).not.toBeNull();
    expect(response?.status()).toBe(404);
    await expect(page.locator("body")).not.toContainText("PACIENTI DEMO");
    await expect(page.locator("body")).not.toContainText("Pamje demonstrimi");
  });
});
