import { test, expect } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test('Should use stored login session', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');
  // Add further test steps here
  await expect(page).toHaveURL('https://stage-admin.wellityhealth.com/referrals');
});
