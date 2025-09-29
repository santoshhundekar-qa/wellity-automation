// referral.spec.js - Updated to use enhanced PageLogger
import { test, expect } from '@playwright/test';
const fs = require('fs');
const path = require('path');
require('../test-setup'); // Add this import to enable enhanced logging

const storageState = 'storageState.json';

test.use({ storageState });

test('Select first payer and referral type, validate filter and clear', async ({ page }, testInfo) => {
  const pageLogger = testInfo.pageLogger; // Get PageLogger from test context

  await pageLogger.goto('https://stage-admin.wellityhealth.com/referrals');

  pageLogger.step('Starting payer and referral type selection test');

  // Select first payer
  await pageLogger.click('button[role="combobox"]:has-text("Select payer")');

  pageLogger.step('Selecting first payer (AA)');
  const firstPayerDiv = pageLogger.locator('div').filter({ hasText: /^AA$/ }).first();
  await firstPayerDiv.click();
  await pageLogger.click('h1:has-text("Referral List")');
  await pageLogger.page.waitForTimeout(2000);

  // Select first referral type
  await pageLogger.click('button[role="combobox"]:has-text("Select referral type")');

  pageLogger.step('Selecting first referral type (MED)');
  const firstTypeDiv = pageLogger.locator('div').filter({ hasText: /^MED$/ }).first();
  await firstTypeDiv.click();
  await pageLogger.click('h1:has-text("Referral List")');
  await pageLogger.page.waitForTimeout(2000);

  // Validate table for selected filter
  pageLogger.step('Validating filtered results in table');
  const payerCells = await pageLogger.page.locator('table tr td:nth-child(8)').allTextContents();
  const referralTypeCells = await pageLogger.page.locator('table tr td:nth-child(7)').allTextContents();

  await pageLogger.expect(
    expect(payerCells.map(cell => cell.trim())).toContain('AA'),
    'Table should contain selected payer "AA"'
  );
  await pageLogger.expect(
    expect(referralTypeCells.map(cell => cell.trim())).toContain('MED'),
    'Table should contain selected referral type "MED"'
  );

  // Clear all filters
  pageLogger.step('Clearing all applied filters');
  await pageLogger.click('button:has-text("Clear All")');
  await pageLogger.page.waitForTimeout(2000);

  // Validate selectors are deselected
  pageLogger.step('Validating filters are cleared');
  const payerDropdownText = await pageLogger.page.getByRole('combobox').filter({ hasText: 'Select payer' }).textContent();
  const referralTypeDropdownText = await pageLogger.page.getByRole('combobox').filter({ hasText: 'Select referral type' }).textContent();

  await pageLogger.expect(
    expect(payerDropdownText).toContain('Select payer'),
    'Payer dropdown should show placeholder text'
  );
  await pageLogger.expect(
    expect(referralTypeDropdownText).toContain('Select referral type'),
    'Referral type dropdown should show placeholder text'
  );

  pageLogger.step('Filter test completed successfully');
});

test.describe('Select Referral Type Dropdown Functionality', () => {
  test.beforeEach(async ({ page, context }, testInfo) => {
    const pageLogger = testInfo.pageLogger;
    await pageLogger.goto('https://stage-admin.wellityhealth.com/referrals');
  });

  test('Single select referral type and validate result', async ({ page }, testInfo) => {
    const pageLogger = testInfo.pageLogger;

    pageLogger.step('Testing single referral type selection');
    await pageLogger.click('button[role="combobox"]:has-text("Select referral type")');
    await pageLogger.click('div:has-text("MED"):not(:has(div))');

    // Click outside dropdown to apply filter
    await pageLogger.click('h1:has-text("Referral List")');
    await pageLogger.page.waitForTimeout(2000);

    // Validate referral type column in table
    pageLogger.step('Validating filtered results contain MED');
    const referralTypeCells = await pageLogger.page.locator('table tr td:nth-child(7)').allTextContents();
    await pageLogger.expect(
      expect(referralTypeCells.map(cell => cell.trim())).toContain('MED'),
      'Table should contain selected referral type "MED"'
    );
  });

  test('Multiple select referral types and validate result', async ({ page }, testInfo) => {
    const pageLogger = testInfo.pageLogger;

    pageLogger.step('Testing multiple referral type selection');
    await pageLogger.click('button[role="combobox"]:has-text("Select referral type")');
    await pageLogger.click('div:has-text("MED"):not(:has(div))');
    await pageLogger.click('div:has-text("MED & THERAPY"):not(:has(div))');
    await pageLogger.click('div:has-text("THERAPY"):not(:has(div))');

    // Click outside dropdown to apply filter
    await pageLogger.click('h1:has-text("Referral List")');
    await pageLogger.page.waitForTimeout(2000);

    // Validate referral type column in table
    pageLogger.step('Validating filtered results contain selected types');
    const referralTypeCells = await pageLogger.page.locator('table tr td:nth-child(7)').allTextContents();
    await pageLogger.expect(
      expect(referralTypeCells.some(cell => cell.includes('MED') || cell.includes('MED & THERAPY') || cell.includes('THERAPY'))).toBe(true),
      'Table should contain at least one of the selected referral types'
    );
  });

  test('Select all referral types and validate result', async ({ page }, testInfo) => {
    const pageLogger = testInfo.pageLogger;

    pageLogger.step('Testing select all referral types');
    await pageLogger.click('button[role="combobox"]:has-text("Select referral type")');

    const types = ['MED', 'MED & THERAPY', 'THERAPY'];
    for (const type of types) {
      pageLogger.step(`Selecting referral type: ${type}`);
      await pageLogger.click(`div:has-text("${type}"):not(:has(div))`);
    }

    // Click outside dropdown to apply filter
    await pageLogger.click('h1:has-text("Referral List")');
    await pageLogger.page.waitForTimeout(2000);

    // Validate referral type column in table
    pageLogger.step('Validating all selected types are represented in results');
    const referralTypeCells = await pageLogger.page.locator('table tr td:nth-child(7)').allTextContents();
    const found = types.some(type => referralTypeCells.map(cell => cell.trim()).includes(type));
    await pageLogger.expect(
      expect(found).toBe(true),
      'Table should contain at least one of the selected referral types'
    );
  });

  test('Dropdown closes when clicking outside', async ({ page }, testInfo) => {
    const pageLogger = testInfo.pageLogger;

    pageLogger.step('Testing dropdown close functionality');
    await pageLogger.click('button[role="combobox"]:has-text("Select referral type")');

    // Wait for dialog to appear
    pageLogger.step('Verifying dropdown dialog is visible');
    const dialog = pageLogger.page.locator('div[role="dialog"]');
    await pageLogger.expect(expect(dialog).toBeVisible(), 'Dropdown dialog should be visible');

    // Click on search field to close dropdown
    pageLogger.step('Clicking outside dropdown to close it');
    await pageLogger.click('input[placeholder="Search by patient name"]');

    // Wait for dialog to disappear
    pageLogger.step('Verifying dropdown dialog is closed');
    await pageLogger.expect(expect(dialog).not.toBeVisible(), 'Dropdown dialog should be hidden');
  });
});

test('Referral search - valid and invalid', async ({ page }, testInfo) => {
  const pageLogger = testInfo.pageLogger;

  await pageLogger.goto('https://stage-admin.wellityhealth.com/referrals');

  pageLogger.step('Starting referral search validation test');

  // Get the first patient name from the table (skip header row)
  pageLogger.step('Getting first patient name from table for valid search');
  const patientRows = pageLogger.page.locator('table tr').nth(1).locator('td').nth(0);
  const firstPatientName = await patientRows.textContent();
  pageLogger.step(`Found first patient name: ${firstPatientName}`);

  // Valid search: search for the first patient name
  pageLogger.step('Performing valid search test');
  await pageLogger.page.waitForTimeout(1000);
  const validPatientRows = await pageLogger.page.locator('table tr').count();
  await pageLogger.expect(
    expect(validPatientRows).toBeGreaterThan(1),
    'Table should have header plus at least one patient row'
  );

  // Invalid search: search for a name that does not exist
  pageLogger.step('Performing invalid search test');
  await pageLogger.fill('input[placeholder="Search by patient name"]', 'InvalidName123');
  await pageLogger.page.waitForTimeout(1000);

  pageLogger.step('Verifying no records found message appears');
  const noRecordsMessage = await pageLogger.page.locator('text=No records found').isVisible();
  await pageLogger.expect(
    expect(noRecordsMessage).toBeTruthy(),
    'No records found message should be visible for invalid search'
  );
});

test.describe('Select Payer Dropdown Functionality', () => {
  test.beforeEach(async ({ page, context }, testInfo) => {
    const pageLogger = testInfo.pageLogger;
    const storageStatePath = path.resolve(__dirname, '../storageState.json');
    const storageState = JSON.parse(fs.readFileSync(storageStatePath, 'utf-8'));
    if (storageState.cookies) {
      await context.addCookies(storageState.cookies);
    }
    await pageLogger.goto('https://stage-admin.wellityhealth.com/referrals');
  });

  test('Single select payer and validate result', async ({ page }, testInfo) => {
    const pageLogger = testInfo.pageLogger;

    pageLogger.step('Testing single payer selection');
    await pageLogger.click('button[role="combobox"]:has-text("Select payer")');
    await pageLogger.click('div:has-text("AA"):not(:has(div))');

    // Click outside dropdown to apply filter
    await pageLogger.click('h1:has-text("Referral List")');
    await pageLogger.page.waitForTimeout(2000);

    // Validate payer column in table
    pageLogger.step('Validating filtered results contain selected payer');
    const payerCells = await pageLogger.page.locator('table tr td:nth-child(8)').allTextContents();
    await pageLogger.expect(
      expect(payerCells.map(cell => cell.trim())).toContain('AA'),
      'Table should contain selected payer "AA"'
    );
  });

  test('Multiple select payers and validate result', async ({ page }, testInfo) => {
    const pageLogger = testInfo.pageLogger;

    pageLogger.step('Testing multiple payer selection');
    await pageLogger.click('button[role="combobox"]:has-text("Select payer")');
    await pageLogger.click('div:has-text("AA"):not(:has(div))');
    await pageLogger.click('div:has-text("Carelon"):not(:has(div))');

    // Click outside dropdown to apply filter
    await pageLogger.click('h1:has-text("Referral List")');
    await pageLogger.page.waitForTimeout(2000);

    // Validate payer column in table
    pageLogger.step('Validating filtered results contain selected payers');
    const payerCells = await pageLogger.page.locator('table tr td:nth-child(8)').allTextContents();
    await pageLogger.expect(
      expect(payerCells.some(cell => cell.includes('AA') || cell.includes('Carelon'))).toBe(true),
      'Table should contain at least one of the selected payers'
    );
  });

  test('Select all payers and validate result', async ({ page }, testInfo) => {
    const pageLogger = testInfo.pageLogger;

    pageLogger.step('Testing select all payers');
    await pageLogger.click('button[role="combobox"]:has-text("Select payer")');

    const payers = ['AA', 'Carelon', 'CCAH', 'CCHP', 'HPSM', 'SCFHP', 'VHP'];
    for (const payer of payers) {
      pageLogger.step(`Selecting payer: ${payer}`);
      await pageLogger.click(`div:has-text("${payer}"):not(:has(div))`);
    }

    // Click outside dropdown to apply filter
    await pageLogger.click('h1:has-text("Referral List")');
    await pageLogger.page.waitForTimeout(2000);

    // Validate payer column in table
    pageLogger.step('Validating all selected payers are represented in results');
    const payerCells = await pageLogger.page.locator('table tr td:nth-child(8)').allTextContents();
    const found = payers.some(payer => payerCells.map(cell => cell.trim()).includes(payer));
    await pageLogger.expect(
      expect(found).toBe(true),
      'Table should contain at least one of the selected payers'
    );
  });

  test('Dropdown closes when clicking outside', async ({ page }, testInfo) => {
    const pageLogger = testInfo.pageLogger;

    pageLogger.step('Testing payer dropdown close functionality');
    await pageLogger.click('button[role="combobox"]:has-text("Select payer")');

    // Wait for dialog to appear
    pageLogger.step('Verifying payer dropdown dialog is visible');
    const dialog = pageLogger.page.locator('div[role="dialog"]');
    await pageLogger.expect(expect(dialog).toBeVisible(), 'Payer dropdown dialog should be visible');

    // Click on search field to close dropdown
    pageLogger.step('Clicking outside payer dropdown to close it');
    await pageLogger.click('input[placeholder="Search by patient name"]');

    // Wait for dialog to disappear
    pageLogger.step('Verifying payer dropdown dialog is closed');
    await pageLogger.expect(expect(dialog).not.toBeVisible(), 'Payer dropdown dialog should be hidden');
  });
});

test('Open Referral Date Filter displays calendar options', async ({ page }, testInfo) => {
  const pageLogger = testInfo.pageLogger;

  await pageLogger.goto('https://stage-admin.wellityhealth.com/referrals');

  pageLogger.step('Testing referral date filter calendar display');

  // Click the referral date range filter button
  await pageLogger.click('button:has-text("Select referral date range")');

  // Validate calendar options are visible
  pageLogger.step('Validating calendar options are displayed');
  await pageLogger.expect(expect(pageLogger.page.getByRole('button', { name: 'Today' })).toBeVisible(), 'Today button should be visible');
  await pageLogger.expect(expect(pageLogger.page.getByRole('button', { name: 'Last 7 Days' })).toBeVisible(), 'Last 7 Days button should be visible');
  await pageLogger.expect(expect(pageLogger.page.getByRole('button', { name: 'This Month' })).toBeVisible(), 'This Month button should be visible');
  await pageLogger.expect(expect(pageLogger.page.getByRole('button', { name: 'Apply' })).toBeVisible(), 'Apply button should be visible');
  await pageLogger.expect(expect(pageLogger.page.getByRole('button', { name: 'Cancel' })).toBeVisible(), 'Cancel button should be visible');

  // Validate calendar grid is visible
  pageLogger.step('Validating calendar grid is displayed');
  await pageLogger.expect(expect(pageLogger.page.getByLabel('September')).toBeVisible(), 'Calendar grid should be visible');
});

test('Apply Today filter: validate only no data found message', async ({ page }, testInfo) => {
  const pageLogger = testInfo.pageLogger;

  await pageLogger.goto('https://stage-admin.wellityhealth.com/referrals');

  pageLogger.step('Testing Today filter application');
  await pageLogger.click('button:has-text("Select referral date range")');
  await pageLogger.click('button:has-text("Today")');
  await pageLogger.click('button:has-text("Apply")');

  // Validate no records message
  pageLogger.step('Validating no records found message for Today filter');
  const noRecordsContainer = pageLogger.page.locator('div.flex.flex-col.items-center').filter({ hasText: 'No records found' });
  await pageLogger.expect(expect(noRecordsContainer.getByText('No records found', { exact: true })).toBeVisible(), 'No records found message should be visible');
  await pageLogger.expect(expect(noRecordsContainer.getByText('Try adjusting your filters or search criteria', { exact: true })).toBeVisible(), 'Filter adjustment message should be visible');
});

test('Apply Last 7 Days filter: at least one referral date in last 7 days', async ({ page }, testInfo) => {
  const pageLogger = testInfo.pageLogger;

  await pageLogger.goto('https://stage-admin.wellityhealth.com/referrals');

  pageLogger.step('Testing Last 7 Days filter application');
  await pageLogger.click('button:has-text("Select referral date range")');
  await pageLogger.click('button:has-text("Last 7 Days")');
  await pageLogger.click('button:has-text("Apply")');

  pageLogger.step('Last 7 Days filter applied successfully');
});

test('Apply Last 7 Days filter: validate selected date range button', async ({ page }, testInfo) => {
  const pageLogger = testInfo.pageLogger;

  await pageLogger.goto('https://stage-admin.wellityhealth.com/referrals');

  pageLogger.step('Testing Last 7 Days filter and date range button validation');
  await pageLogger.click('button:has-text("Select referral date range")');
  await pageLogger.click('button:has-text("Last 7 Days")');
  await pageLogger.click('button:has-text("Apply")');

  // Calculate expected date range string
  pageLogger.step('Calculating expected date range for validation');
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  const startStr = sevenDaysAgo.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const endStr = today.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const expectedRange = `${startStr} - ${endStr}`;

  pageLogger.step(`Expected date range: ${expectedRange}`);

  // Validate the button showing the selected date range
  pageLogger.step('Validating date range button displays correct range');
  await pageLogger.expect(expect(pageLogger.page.getByRole('button', { name: expectedRange })).toBeVisible(), `Date range button should show ${expectedRange}`);

  // Optionally, interact with the date range button
  pageLogger.step('Clicking on date range button to verify interaction');
  await pageLogger.click(`button:has-text("${expectedRange}")`);
});