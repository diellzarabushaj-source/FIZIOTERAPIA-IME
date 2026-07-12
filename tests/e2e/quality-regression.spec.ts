import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/',
  '/blog',
  '/faq',
  '/support',
  '/contact',
  '/privacy',
  '/terms',
  '/medical-disclaimer',
  '/patient-dashboard/demo',
  '/app-preview',
];

for (const route of publicRoutes) {
  test(`${route} loads without a server error`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

    expect(response, `${route} should return a response`).not.toBeNull();
    expect(response?.status(), `${route} should not return a server error`).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();

    const fatalErrors = consoleErrors.filter(
      (message) =>
        !message.includes('favicon') &&
        !message.includes('Failed to load resource') &&
        !message.includes('Content Security Policy'),
    );

    expect(fatalErrors, `Unexpected console errors on ${route}`).toEqual([]);
  });
}

test('mobile pages do not overflow horizontally', async ({ page }) => {
  for (const route of ['/', '/patient', '/patient-dashboard/demo', '/physiotherapist-portal']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );

    expect(overflow, `${route} should fit the mobile viewport`).toBe(false);
  }
});

test('private entry routes are not indexed', async ({ request }) => {
  for (const route of ['/patient', '/patient-dashboard', '/physiotherapist-portal']) {
    const response = await request.get(route, { maxRedirects: 0 });
    const robots = response.headers()['x-robots-tag'] ?? '';

    expect(robots.toLowerCase(), `${route} should be noindex`).toContain('noindex');
  }
});
