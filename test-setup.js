// test-setup.js - Updated version with clean test logs
const { test } = require('@playwright/test');
const PageLogger = require('./page-logger');
console.log('PageLogger imported:', typeof PageLogger, PageLogger);
const path = require('path');

// Enhanced test setup that integrates PageLogger with test execution
test.beforeEach(async ({ page }, testInfo) => {
    // Create test folder based on test title and retry attempt
    const sanitizedTestName = testInfo.title.replace(/[^a-z0-9]/gi, "_");
    const browserName = testInfo.project.name || 'chromium';
    const retryInfo = testInfo.retry > 0 ? `-retry${testInfo.retry}` : '';

    const testFolder = path.join(__dirname, "test-results", `${sanitizedTestName}-${browserName}${retryInfo}`);

    // Initialize PageLogger for this test
    const pageLogger = new PageLogger(page, testFolder);

    // Store pageLogger in test context for use in test
    testInfo.pageLogger = pageLogger;

    // Only log essential test information - remove timestamps, retry, file paths, etc.
    pageLogger.log(`=== TEST STARTED: ${testInfo.title} ===`);
    pageLogger.log(`Browser: ${browserName}`);
    pageLogger.log('--- Test Execution Steps ---');
});

test.afterEach(async ({ page }, testInfo) => {
    const pageLogger = testInfo.pageLogger;

    if (pageLogger) {
        // Log test completion status
        pageLogger.log('--- Test Execution Complete ---');

        if (testInfo.status === 'passed') {
            pageLogger.log(`=== TEST PASSED ===`);
            pageLogger.log('All test steps completed successfully');
        } else if (testInfo.status === 'failed') {
            pageLogger.log(`=== TEST FAILED ===`);
            pageLogger.log(`Error: ${testInfo.error?.message || 'Unknown error'}`);
            if (testInfo.error?.stack) {
                pageLogger.log(`Stack trace: ${testInfo.error.stack}`);
            }

            // Take a screenshot on failure for additional debugging
            try {
                const screenshotPath = path.join(pageLogger.testFolder, 'failure-screenshot.png');
                await page.screenshot({ path: screenshotPath, fullPage: true });
                pageLogger.log(`Screenshot saved: failure-screenshot.png`);
            } catch (screenshotError) {
                pageLogger.log(`Failed to take screenshot: ${screenshotError.message}`);
            }
        } else if (testInfo.status === 'timedOut') {
            pageLogger.log(`=== TEST TIMED OUT ===`);
            pageLogger.log('Test exceeded maximum execution time');
        } else if (testInfo.status === 'skipped') {
            pageLogger.log(`=== TEST SKIPPED ===`);
            pageLogger.log('Test was skipped');
        }

        // Remove execution time and completion timestamp
        // pageLogger.log(`Completed at: ${new Date().toISOString()}`);
        // pageLogger.log(`Total execution time: ${testInfo.duration}ms`);
    }
});

module.exports = { test };