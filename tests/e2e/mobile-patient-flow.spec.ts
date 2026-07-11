import { expect, test } from '@playwright/test';

async function fillPatientCode(page: import('@playwright/test').Page, code: string) {
  const codeInput = page.locator('input').first();
  await expect(codeInput).toBeVisible();
  await codeInput.fill(code);
}

async function openDemoPlan(page: import('@playwright/test').Page) {
  await page.goto('/app-preview');
  await expect(page.getByRole('heading', { name: 'Qasje e sigurt për pacientin' })).toBeVisible();
  await fillPatientCode(page, 'ARB-4821');
  await page.getByRole('button', { name: 'Hap planin' }).click();
  await expect(page.getByRole('heading', { name: 'Arbër Rexha' })).toBeVisible();
  await expect(page.getByText('Lumbosciatica')).toBeVisible();
}

test.describe('patient mobile rehabilitation flow', () => {
  test('rejects an invalid patient code without exposing a plan', async ({ page }) => {
    await page.goto('/app-preview');
    await fillPatientCode(page, 'INVALID-000');
    await page.getByRole('button', { name: 'Hap planin' }).click();

    await expect(page.getByText('Kodi nuk u gjet. Për demonstrim përdorni kodin ARB-4821.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Arbër Rexha' })).not.toBeVisible();
  });

  test('opens the plan and preserves readable mobile layout', async ({ page }) => {
    await openDemoPlan(page);

    await expect(page.getByRole('heading', { name: 'Ushtrimet e sotme' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Glute bridge/ })).toBeVisible();
    await expect(page.getByText('Dita 3/14')).toBeVisible();

    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(horizontalOverflow).toBe(false);
  });

  test('shows the clinical disclaimer before movement assessment', async ({ page }) => {
    await openDemoPlan(page);
    await page.getByRole('button', { name: /Glute bridge/ }).click();
    await expect(page.getByRole('heading', { name: 'Glute bridge' })).toBeVisible();

    await page.getByRole('button', { name: 'Kontrollo lëvizjen' }).click();
    await expect(page.getByText('Nuk është diagnozë dhe nuk zëvendëson fizioterapeutin.')).toBeVisible();

    await page.getByRole('button', { name: 'Start assessment' }).click();
    await expect(page.getByText('Vendimi klinik mbetet përgjegjësi e fizioterapeutit.')).toBeVisible();
    await expect(page.getByText('82%')).toBeVisible();
  });

  test('completes a low-pain exercise and updates progress', async ({ page }) => {
    await openDemoPlan(page);
    await page.getByRole('button', { name: /Glute bridge/ }).click();
    await page.getByRole('button', { name: 'Shëno si të kryer' }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Ushtrimi u regjistrua' })).toBeVisible();
    await expect(page.getByText('Progresi dhe raportimi i dhimbjes u ruajtën për kontroll nga fizioterapeuti.')).toBeVisible();
    await page.getByRole('button', { name: 'Kthehu te plani' }).click();
    await expect(page.getByText('2/5', { exact: true })).toBeVisible();
  });

  test('hard-stops the exercise when pain is seven or higher', async ({ page }) => {
    await openDemoPlan(page);
    await page.getByRole('button', { name: /Glute bridge/ }).click();
    await page.getByRole('button', { name: 'Shëno si të kryer' }).click();
    await page.getByRole('button', { name: '8', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Ndërpriteni ushtrimin' })).toBeVisible();
    await expect(page.getByText('Dhimbja e raportuar është 8/10.')).toBeVisible();
    await expect(page.getByText(/Kontaktoni fizioterapeutin/)).toBeVisible();
  });
});
