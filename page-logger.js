// page-logger.js - Updated version with clean logs (no timestamps)
const fs = require('fs');
const path = require('path');

class PageLogger {
    constructor(page, testFolder) {
        this.page = page;
        this.testFolder = testFolder;
        console.log('PageLogger constructed');
        this.logPath = path.join(testFolder, 'steps.log');
        this.stepCount = 0;

        // Reset log file at start of test
        fs.mkdirSync(this.testFolder, { recursive: true });
        fs.writeFileSync(this.logPath, '');
    }

    // Updated log method without timestamps
    log(step, isError = false) {
        const prefix = isError ? 'ERROR' : `${++this.stepCount}.`;
        const logEntry = `${prefix} ${step}`;

        fs.appendFileSync(this.logPath, logEntry + '\n');
        console.log(`[${new Date().toISOString()}] ${logEntry}`); // Keep timestamp in console for debugging
    }

    logError(step, error) {
        this.log(`${step} - FAILED: ${error.message}`, true);
        if (error.stack) {
            this.log(`Stack trace: ${error.stack}`, true);
        }
    }

    friendlyLabel(selector) {
        if (!selector) return 'element';

        // Handle different selector types
        if (typeof selector === 'object' && selector.toString) {
            selector = selector.toString();
        }

        // Clean up selector for better readability
        let cleaned = selector
            .replace(/^#/, '')           // Remove # for IDs
            .replace(/^\\./, '')         // Remove . for classes
            .replace(/\[.*?\]/g, '')     // Remove attribute selectors
            .replace(/:/g, ' ')          // Replace : with space
            .replace(/-/g, ' ')          // Replace - with space
            .replace(/_/g, ' ')          // Replace _ with space
            .replace(/\s+/g, ' ')        // Multiple spaces to single
            .trim();

        // Capitalize first letter of each word
        return cleaned.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Element';
    }

    // Enhanced wrapper method with error handling
    async executeWithLogging(actionName, action) {
        this.log(actionName);
        try {
            const result = await action();
            this.log(`✅ ${actionName} - Success`);
            return result;
        } catch (error) {
            this.logError(actionName, error);
            throw error; // Re-throw to maintain test failure behavior
        }
    }

    // Wrapped Page Actions with enhanced logging
    async goto(url, options = {}) {
        const actionName = `Navigate to "${url}"`;
        return this.executeWithLogging(actionName, () => this.page.goto(url, options));
    }

    async click(selector, options = {}) {
        const actionName = `Click ${this.friendlyLabel(selector)}`;
        return this.executeWithLogging(actionName, () => this.page.click(selector, options));
    }

    async fill(selector, value, options = {}) {
        const actionName = `Fill ${this.friendlyLabel(selector)} with "${value}"`;
        return this.executeWithLogging(actionName, () => this.page.fill(selector, value, options));
    }

    async press(selector, key, options = {}) {
        const actionName = `Press "${key}" in ${this.friendlyLabel(selector)}`;
        return this.executeWithLogging(actionName, () => this.page.press(selector, key, options));
    }

    async check(selector, options = {}) {
        const actionName = `Check ${this.friendlyLabel(selector)}`;
        return this.executeWithLogging(actionName, () => this.page.check(selector, options));
    }

    async uncheck(selector, options = {}) {
        const actionName = `Uncheck ${this.friendlyLabel(selector)}`;
        return this.executeWithLogging(actionName, () => this.page.uncheck(selector, options));
    }

    async selectOption(selector, value, options = {}) {
        const displayValue = Array.isArray(value) ? value.join(', ') : value;
        const actionName = `Select option "${displayValue}" in ${this.friendlyLabel(selector)}`;
        return this.executeWithLogging(actionName, () => this.page.selectOption(selector, value, options));
    }

    async setInputFiles(selector, files, options = {}) {
        const fileDisplay = Array.isArray(files) ? files.join(', ') : files;
        const actionName = `Upload file "${fileDisplay}" to ${this.friendlyLabel(selector)}`;
        return this.executeWithLogging(actionName, () => this.page.setInputFiles(selector, files, options));
    }

    async waitForSelector(selector, options = {}) {
        const actionName = `Wait for ${this.friendlyLabel(selector)} to appear`;
        return this.executeWithLogging(actionName, () => this.page.waitForSelector(selector, options));
    }

    async waitForLoadState(state = 'load', options = {}) {
        const actionName = `Wait for page to reach "${state}" state`;
        return this.executeWithLogging(actionName, () => this.page.waitForLoadState(state, options));
    }

    async screenshot(options = {}) {
        const actionName = `Take screenshot`;
        return this.executeWithLogging(actionName, () => this.page.screenshot(options));
    }

    async hover(selector, options = {}) {
        const actionName = `Hover over ${this.friendlyLabel(selector)}`;
        return this.executeWithLogging(actionName, () => this.page.hover(selector, options));
    }

    async dragAndDrop(source, target, options = {}) {
        const actionName = `Drag ${this.friendlyLabel(source)} to ${this.friendlyLabel(target)}`;
        return this.executeWithLogging(actionName, () => this.page.dragAndDrop(source, target, options));
    }

    async reload(options = {}) {
        const actionName = `Reload page`;
        return this.executeWithLogging(actionName, () => this.page.reload(options));
    }

    async goBack(options = {}) {
        const actionName = `Navigate back`;
        return this.executeWithLogging(actionName, () => this.page.goBack(options));
    }

    async goForward(options = {}) {
        const actionName = `Navigate forward`;
        return this.executeWithLogging(actionName, () => this.page.goForward(options));
    }

    // Custom assertion logging
    async expect(condition, description) {
        this.log(`Assert: ${description}`);
        try {
            const result = await condition;
            this.log(`✅ Assert: ${description} - Passed`);
            return result;
        } catch (error) {
            this.logError(`Assert: ${description}`, error);
            throw error;
        }
    }

    // Custom step logging
    step(description) {
        this.log(`📝 ${description}`);
    }

    // Access to raw Playwright page if needed
    get original() {
        return this.page;
    }

    // Get locator with logging
    locator(selector) {
        const locator = this.page.locator(selector);

        // Add logging wrapper to common locator methods
        const originalClick = locator.click.bind(locator);
        const originalFill = locator.fill.bind(locator);
        const originalCheck = locator.check.bind(locator);

        locator.click = async (options = {}) => {
            return this.executeWithLogging(`Click ${this.friendlyLabel(selector)}`, () => originalClick(options));
        };

        locator.fill = async (value, options = {}) => {
            return this.executeWithLogging(`Fill ${this.friendlyLabel(selector)} with "${value}"`, () => originalFill(value, options));
        };

        locator.check = async (options = {}) => {
            return this.executeWithLogging(`Check ${this.friendlyLabel(selector)}`, () => originalCheck(options));
        };

        return locator;
    }
}

module.exports = PageLogger;