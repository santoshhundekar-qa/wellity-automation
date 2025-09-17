import { test, expect } from '@playwright/test';

test('Login flow with Google and save session', async ({ page, context }) => {
  // Navigate to the login page
  await page.goto('https://stage-admin.wellityhealth.com/login');

  // Wait for the Google sign-in popup
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Sign in with Google' }).click();
  const popup = await popupPromise;

  // Fill in Google credentials
  await popup.getByRole('textbox', { name: 'Email or phone' }).fill('santosh.hundekar@mindbowser.com');
  await popup.getByRole('button', { name: 'Next' }).click();
  await popup.getByRole('textbox', { name: 'Enter your password' }).fill('Wellity@123');
  await popup.getByRole('button', { name: 'Next' }).click();

  // Wait for redirect and verify successful login
  await page.waitForURL('https://stage-admin.wellityhealth.com/referrals');
  await expect(page).toHaveURL('https://stage-admin.wellityhealth.com/referrals');

  // Save storage state for reuse
  await context.storageState({ path: 'storageState.json' });
});
