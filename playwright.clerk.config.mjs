import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "https://fizioterapia-ime.vercel.app";

export default defineConfig({
  testDir: "./tests/e2e-auth",
  fullyParallel: false,
  forbidOnly: true,
  retries: 1,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report-clerk", open: "never" }],
    ["github"],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ignoreHTTPSErrors: false,
  },
  projects: [
    {
      name: "clerk-setup",
      testMatch: /clerk\.setup\.mjs/,
    },
    {
      name: "authenticated-chromium",
      testIgnore: /clerk\.setup\.mjs/,
      dependencies: ["clerk-setup"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
