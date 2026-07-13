import { expect, test } from '@playwright/test';

const healthMode = process.env.E2E_HEALTH_MODE ?? 'contract';

test.describe('Public application smoke tests', () => {
  test('homepage loads without a server error', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

    expect(response, 'Homepage should return a response').not.toBeNull();
    expect(response?.status(), 'Homepage should not return a server error').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveTitle(/.+/);
  });

  test('health endpoint follows the configured readiness contract', async ({ request }) => {
    const response = await request.get('/api/health');
    const body = await response.json();

    expect(body).toMatchObject({
      status: expect.stringMatching(/^(ok|degraded)$/),
      timestamp: expect.any(String),
      failedChecks: expect.any(Array),
    });

    if (healthMode === 'healthy') {
      expect(response.ok(), `Health endpoint returned ${response.status()}`).toBeTruthy();
      expect(body).toMatchObject({ status: 'ok', failedChecks: [] });
      return;
    }

    if (healthMode === 'degraded') {
      expect(response.status(), 'Unconfigured branch server must fail closed').toBe(503);
      expect(body.status).toBe('degraded');
      expect(body.failedChecks.length).toBeGreaterThan(0);
      expect(body).not.toHaveProperty('checks');
      expect(body).not.toHaveProperty('environment');
      expect(body).not.toHaveProperty('version');
      return;
    }

    expect([200, 503]).toContain(response.status());
    expect(body.status === 'ok').toBe(response.status() === 200);
    expect(body.failedChecks.length === 0).toBe(response.status() === 200);
  });

  test('patient entry route does not crash', async ({ page }) => {
    const response = await page.goto('/patient', { waitUntil: 'domcontentloaded' });

    expect(response, 'Patient route should return a response').not.toBeNull();
    expect(response?.status(), 'Patient route should not return a server error').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('physiotherapist portal route does not crash', async ({ page }) => {
    const response = await page.goto('/physiotherapist-portal', { waitUntil: 'domcontentloaded' });

    expect(response, 'Portal route should return a response').not.toBeNull();
    expect(response?.status(), 'Portal route should not return a server error').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });
});
