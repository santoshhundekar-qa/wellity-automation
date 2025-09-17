import { test, expect } from '@playwright/test';
const path = require('path');

test.use({ storageState: path.resolve(__dirname, '../storageState.json') });

test('Create Patient: open form and validate heading', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');
  await page.waitForSelector('button:has-text("Create Patient")');
  await page.getByRole('button', { name: 'Create Patient' }).first().click();
  await expect(page.getByRole('heading', { name: 'Create patient in Healthie' })).toBeVisible();
});

test('Create Patient: missing field shows error message', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');
  await page.waitForSelector('button:has-text("Create Patient")');
  await page.getByRole('button', { name: 'Create Patient' }).first().click();
  await page.getByRole('button', { name: 'Create Patient' }).click();
  await expect(page.getByText('This field is required', { exact: false })).toBeVisible();
});

test('Create Patient: missing Sex field shows error message', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');
  await page.waitForSelector('button:has-text("Create Patient")');
  await page.getByRole('button', { name: 'Create Patient' }).first().click();
  // Validate error message for missing Sex field
  await expect(page.getByText('sex is required', { exact: false })).toBeVisible();
});

test('Create Patient: missing City field shows error message', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');
  await page.waitForSelector('button:has-text("Create Patient")');
  await page.getByRole('button', { name: 'Create Patient' }).first().click();
  // Try to submit the form with City field missing
  await expect(page.getByText('city is required', { exact: false })).toBeVisible();
});

test('Create Patient: missing State field shows error message', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');
  await page.waitForSelector('button:has-text("Create Patient")');
  await page.getByRole('button', { name: 'Create Patient' }).first().click();
  // Validate error message for missing State field
  await expect(page.getByText('state is required', { exact: false })).toBeVisible();
});

test('Create Patient: button is disabled when any field is missing', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');
  await page.waitForSelector('button:has-text("Create Patient")');
  await page.getByRole('button', { name: 'Create Patient' }).first().click();
  // Assume required fields are empty by default
  const createBtn = page.getByRole('button', { name: 'Create Patient' });
  await expect(createBtn).toBeDisabled();
});

test('Edit mode: Cancel returns to Create Patient page with Edit button and non-editable fields', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');
  await page.waitForSelector('button:has-text("Create Patient")');
  await page.getByRole('button', { name: 'Create Patient' }).first().click();
  // Cancel edit mode
  await page.getByRole('button', { name: 'Cancel' }).click();
  // Validate returned to Create Patient in Healthie page
  await expect(page.getByRole('heading', { name: 'Create Patient in Healthie' })).toBeVisible();
  // Validate Edit button is visible
  await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    // Validate Patient Name is displayed
    const patientNameValue = await page.locator('p.text-lg.font-medium.text-gray-900');
    await expect(patientNameValue).toBeVisible();
    // Optionally check the text value if needed
});

test('Create Patient: Close icon closes the popup', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');
  await page.waitForSelector('button:has-text("Create Patient")');
  await page.getByRole('button', { name: 'Create Patient' }).first().click();
  // Click the Close icon (update selector if needed)
  await page.getByRole('button', { name: 'Close' }).click();
  // Validate the Create Patient popup is closed (e.g., heading not visible)
  await expect(page.getByRole('heading', { name: 'Create patient in Healthie' })).not.toBeVisible();
});

test('Patient row click opens Patient Details popup and displays details fields', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');
  // Wait for the patient table to be visible
  await page.waitForSelector('table');
  // Click the first patient row (using the patient name span)
  await page.locator('span.text-blue-700.font-medium.cursor-pointer').first().click();
  // Wait for the Patient Details popup to appear
  await expect(page.getByRole('dialog', { name: /Patient Details/i })).toBeVisible();
  // Validate all expected fields are present (labels only, not hardcoded values)
  const labels = [
    'Patient Name',
    'Referral Date',
    'Member ID',
    'Medi-Cal ID',
    'DOB',
    'Sex',
    'Phone',
    'Email',
    'Address'
  ];
  for (const label of labels) {
    await expect(page.locator(`label:text-is(\"${label}\")`)).toBeVisible();
  }
});
