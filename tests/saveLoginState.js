import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://stage-admin.wellityhealth.com/login');
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Sign in with Google' }).click();
  const popup = await popupPromise;
  await popup.getByRole('textbox', { name: 'Email or phone' }).fill('santosh.hundekar@mindbowser.com');
  await popup.getByRole('button', { name: 'Next' }).click();
  await popup.getByRole('textbox', { name: 'Enter your password' }).fill('Wellity@123');
  await popup.getByRole('button', { name: 'Next' }).click();
  await page.waitForURL('https://stage-admin.wellityhealth.com/referrals');
  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();
})();
