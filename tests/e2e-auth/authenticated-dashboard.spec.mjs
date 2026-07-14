import { clerk } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required authenticated E2E environment variable: ${name}`);
  return value;
}

const ownerEmail = requiredEnvironment("E2E_CLERK_OWNER_EMAIL");
const physioEmail = requiredEnvironment("E2E_CLERK_PHYSIO_EMAIL");

test("owner is sent directly to the owner dashboard", async ({ page }) => {
  await page.goto("/");
  await clerk.signIn({ page, emailAddress: ownerEmail });

  await page.goto("/auth/continue");

  await expect(page).toHaveURL(/\/admin-dashboard$/);
  await expect(page.getByRole("heading", { name: "Owner Dashboard" })).toBeVisible();
});

test("physiotherapist is sent directly to the clinical dashboard and sign-out revokes browser access", async ({ page }) => {
  await page.goto("/");
  await clerk.signIn({ page, emailAddress: physioEmail });

  await page.goto("/auth/continue");

  await expect(page).toHaveURL(/\/physiotherapist-portal\/overview$/);
  await expect(page.getByRole("heading", { name: "Përmbledhje klinike" })).toBeVisible();

  await page.goto("/");
  await clerk.signOut({ page, signOutOptions: { redirectUrl: "/sign-in" } });
  await page.goto("/physiotherapist-portal/overview");

  await expect(page).toHaveURL(/\/sign-in(?:\?|$)/);
  await expect(page.getByRole("heading", { name: "Hyr në llogari" })).toBeVisible();
});
