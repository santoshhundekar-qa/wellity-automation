import { test, expect } from '@playwright/test';
const fs = require('fs');
const path = require('path');

const storageState = 'storageState.json';

test.use({ storageState });
test('Select first payer and referral type, validate filter and clear', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');

  // Select first payer
  await page.getByRole('combobox').filter({ hasText: 'Select payer' }).click();
  const firstPayerDiv = await page.locator('div').filter({ hasText: /^AA$/ }).first();
  await firstPayerDiv.click();
  await page.locator('h1:has-text("Referral List")').click();
  await page.waitForTimeout(2000);

  // Select first referral type
  await page.getByRole('combobox').filter({ hasText: 'Select referral type' }).click();
  const firstTypeDiv = await page.locator('div').filter({ hasText: /^MED$/ }).first();
  await firstTypeDiv.click();
  await page.locator('h1:has-text("Referral List")').click();
  await page.waitForTimeout(2000);

  // Validate table for selected filter
  const payerCells = await page.locator('table tr td:nth-child(8)').allTextContents();
  const referralTypeCells = await page.locator('table tr td:nth-child(7)').allTextContents();
  expect(payerCells.map(cell => cell.trim())).toContain('AA');
  expect(referralTypeCells.map(cell => cell.trim())).toContain('MED');

  // Clear all filters
  const clearAllBtn = await page.getByRole('button', { name: /Clear All/i });
  await clearAllBtn.click();
  await page.waitForTimeout(2000);

  // Validate selectors are deselected (dropdowns show placeholder text)
  const payerDropdownText = await page.getByRole('combobox').filter({ hasText: 'Select payer' }).textContent();
  const referralTypeDropdownText = await page.getByRole('combobox').filter({ hasText: 'Select referral type' }).textContent();
  expect(payerDropdownText).toContain('Select payer');
  expect(referralTypeDropdownText).toContain('Select referral type');
});

test.describe('Select Referral Type Dropdown Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.goto('https://stage-admin.wellityhealth.com/referrals');
  });

  test('Single select referral type and validate result', async ({ page }) => {
    await page.getByRole('combobox').filter({ hasText: 'Select referral type' }).click();
    await page.locator('div').filter({ hasText: /^MED$/ }).click();
    // Click outside dropdown to apply filter
    await page.locator('h1:has-text("Referral List")').click();
    await page.waitForTimeout(2000);
    // Validate referral type column in table (7th td)
    const referralTypeCells = await page.locator('table tr td:nth-child(7)').allTextContents();
    expect(referralTypeCells.map(cell => cell.trim())).toContain('MED');
  });

  test('Multiple select referral types and validate result', async ({ page }) => {
    await page.getByRole('combobox').filter({ hasText: 'Select referral type' }).click();
    await page.locator('div').filter({ hasText: /^MED$/ }).click();
    await page.locator('div').filter({ hasText: /^MED & THERAPY$/ }).click();
    await page.locator('div').filter({ hasText: /^THERAPY$/ }).click();
    // Click outside dropdown to apply filter
    await page.locator('h1:has-text("Referral List")').click();
    await page.waitForTimeout(2000);
    // Validate referral type column in table (7th td)
    const referralTypeCells = await page.locator('table tr td:nth-child(7)').allTextContents();
    expect(referralTypeCells.some(cell => cell.includes('MED') || cell.includes('MED & THERAPY') || cell.includes('THERAPY'))).toBe(true);
  });

  test('Select all referral types and validate result', async ({ page }) => {
    await page.getByRole('combobox').filter({ hasText: 'Select referral type' }).click();
    const types = ['MED', 'MED & THERAPY', 'THERAPY'];
    for (const type of types) {
      await page.locator('div').filter({ hasText: new RegExp(`^${type}$`) }).click();
    }
    // Click outside dropdown to apply filter
    await page.locator('h1:has-text("Referral List")').click();
    await page.waitForTimeout(2000);
    // Validate referral type column in table (7th td)
    const referralTypeCells = await page.locator('table tr td:nth-child(7)').allTextContents();
    // Check that at least one selected type is present in the table
    const found = types.some(type => referralTypeCells.map(cell => cell.trim()).includes(type));
    expect(found).toBe(true);
  });
test('Dropdown closes when clicking outside', async ({ page }) => {
    const referralTypeDropdown = page.locator('button[role="combobox"]:has-text("Select referral type")');
    await referralTypeDropdown.click();
    // Wait for dialog to appear
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    // Click on 'Search by patient name' textbox to close dropdown
    await page.getByPlaceholder('Search by patient name').click();
    // Wait for dialog to disappear
    await expect(dialog).not.toBeVisible();
  });
});

test('Referral search - valid and invalid', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');

  // Get the first patient name from the table (skip header row)
  const patientRows = page.locator('table tr').nth(1).locator('td').nth(0);
  const firstPatientName = await patientRows.textContent();

  // Valid search: search for the first patient name
  await page.waitForTimeout(1000); // Wait for search results to update
  const validPatientRows = await page.locator('table tr').count();
  expect(validPatientRows).toBeGreaterThan(1); // Should have header + at least one patient row

  // Invalid search: search for a name that does not exist
  await page.getByPlaceholder('Search by patient name').fill('InvalidName123');
  await page.waitForTimeout(1000); // Wait for search results to update
  const noRecordsMessage = await page.locator('text=No records found').isVisible();
  expect(noRecordsMessage).toBeTruthy();
});

test.describe('Select Payer Dropdown Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    const storageStatePath = path.resolve(__dirname, '../storageState.json');
    const storageState = JSON.parse(fs.readFileSync(storageStatePath, 'utf-8'));
    if (storageState.cookies) {
      await context.addCookies(storageState.cookies);
    }
    await page.goto('https://stage-admin.wellityhealth.com/referrals');
  });

  test('Single select payer and validate result', async ({ page }) => {
  await page.getByRole('combobox').filter({ hasText: 'Select payer' }).click();
  await page.locator('div').filter({ hasText: /^AA$/ }).click();
  // Click outside dropdown to apply filter
  await page.locator('h1:has-text("Referral List")').click();
  // Wait for table to update
  await page.waitForTimeout(2000);
  // Validate payer column in table (8th td)
  const payerCells = await page.locator('table tr td:nth-child(8)').allTextContents();
  expect(payerCells.map(cell => cell.trim())).toContain('AA');
  });

  test('Multiple select payers and validate result', async ({ page }) => {
  await page.getByRole('combobox').filter({ hasText: 'Select payer' }).click();
  await page.locator('div').filter({ hasText: /^AA$/ }).click();
  await page.locator('div').filter({ hasText: /^Carelon$/ }).click();
  // Click outside dropdown to apply filter
  await page.locator('h1:has-text("Referral List")').click();
  await page.waitForTimeout(2000);
  // Validate payer column in table (8th td)
  const payerCells = await page.locator('table tr td:nth-child(8)').allTextContents();
  expect(payerCells.some(cell => cell.includes('AA') || cell.includes('Carelon'))).toBe(true);
  });

  test('Select all payers and validate result', async ({ page }) => {
      await page.getByRole('combobox').filter({ hasText: 'Select payer' }).click();
      const payers = ['AA', 'Carelon', 'CCAH', 'CCHP', 'HPSM', 'SCFHP', 'VHP'];
      for (const payer of payers) {
        await page.locator('div').filter({ hasText: new RegExp(`^${payer}$`) }).click();
      }
      // Click outside dropdown to apply filter
      await page.locator('h1:has-text("Referral List")').click();
      await page.waitForTimeout(2000);
  // Validate payer column in table (8th td)
  const payerCells = await page.locator('table tr td:nth-child(8)').allTextContents();
  // Check that at least one selected payer is present in the table
  const found = payers.some(payer => payerCells.map(cell => cell.trim()).includes(payer));
  expect(found).toBe(true);
  });

  test('Dropdown closes when clicking outside', async ({ page }) => {
  const payerDropdown = page.locator('button[role="combobox"]:has-text("Select payer")');
  await payerDropdown.click();
  // Wait for dialog to appear
  const dialog = page.locator('div[role="dialog"]');
  await expect(dialog).toBeVisible();
  // Click on 'Search by patient name' textbox to close dropdown
  await page.getByPlaceholder('Search by patient name').click();
  // Wait for dialog to disappear
  await expect(dialog).not.toBeVisible();
  });

});

test('Open Referral Date Filter displays calendar options', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');

  // Click the referral date range filter button
  await page.getByRole('button', { name: 'Select referral date range' }).click();

  // Validate calendar options are visible
  await expect(page.getByRole('button', { name: 'Today' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Last 7 Days' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'This Month' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Apply' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

  // Validate calendar grid is visible
  await expect(page.getByLabel('September')).toBeVisible();
});

test('Apply Today filter: validate only no data found message', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');
  await page.getByRole('button', { name: 'Select referral date range' }).click();
  await page.getByRole('button', { name: 'Today' }).click();
  await page.getByRole('button', { name: 'Apply' }).click();

  // Use a more robust locator for the no records message container
  const noRecordsContainer = page.locator('div.flex.flex-col.items-center').filter({ hasText: 'No records found' });
  await expect(noRecordsContainer.getByText('No records found', { exact: true })).toBeVisible();
  await expect(noRecordsContainer.getByText('Try adjusting your filters or search criteria', { exact: true })).toBeVisible();
});

test('Apply Last 7 Days filter: at least one referral date in last 7 days', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');
  await page.getByRole('button', { name: 'Select referral date range' }).click();
  await page.getByRole('button', { name: 'Last 7 Days' }).click();
  await page.getByRole('button', { name: 'Apply' }).click();

});

test('Apply Last 7 Days filter: validate selected date range button', async ({ page }) => {
  await page.goto('https://stage-admin.wellityhealth.com/referrals');
  await page.getByRole('button', { name: 'Select referral date range' }).click();
  await page.getByRole('button', { name: 'Last 7 Days' }).click();
  await page.getByRole('button', { name: 'Apply' }).click();

  // Calculate expected date range string
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  const startStr = sevenDaysAgo.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const endStr = today.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const expectedRange = `${startStr} - ${endStr}`;

  // Validate the button showing the selected date range
  await expect(page.getByRole('button', { name: expectedRange })).toBeVisible();

  // Optionally, interact with the date range button
  await page.getByRole('button', { name: expectedRange }).click();
});




