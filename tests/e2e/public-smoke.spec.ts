import { expect, test } from '@playwright/test';

test.describe('Public production smoke tests', () => {
  test('homepage loads without a server error', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

    expect(response, 'Homepage should return a response').not.toBeNull();
    expect(response?.status(), 'Homepage should not return a server error').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveTitle(/.+/);
  });

  test('health endpoint reports a healthy application', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.ok(), `Health endpoint returned ${response.status()}`).toBeTruthy();
    const body = await response.json();
    expect(body).toMatchObject({ status: 'ok', failedChecks: [] });
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
