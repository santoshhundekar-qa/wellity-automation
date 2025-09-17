import { test, expect } from '@playwright/test';

test.use({ storageState: '../storageState.json' });

test('Create Patient: open form and validate heading', async ({ page }) => {
  await page.goto('https://dev-admin.wellityhealth.com/referrals');
  // Click the first Create Patient button
  await page.getByRole('button', { name: 'Create Patient' }).first().click();
  // Validate heading
  await expect(page.getByRole('heading', { name: 'Create patient in Healthie' })).toBeVisible();
});

test('Create Patient: missing field shows error message', async ({ page }) => {
  await page.goto('https://dev-admin.wellityhealth.com/referrals');
  // Click the first Create Patient button
  await page.getByRole('button', { name: 'Create Patient' }).first().click();
  // Try to submit the form with missing required fields
  await page.getByRole('button', { name: 'Create Patient' }).click();
  // Validate error message appears (update selector/text as needed)
  await expect(page.getByText('This field is required', { exact: false })).toBeVisible();
});
