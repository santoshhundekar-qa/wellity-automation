## 📋 Project Overview

This is a **Playwright automation framework** for testing the Wellity Health portal (stage-admin.wellityhealth.com). The project includes comprehensive test automation with advanced reporting and Jira integration.

## 🏗️ Architecture & Structure

### **Core Components:**
- **Playwright Tests** (`tests/` directory) - Main test suites
- **Enhanced Logging System** (`page-logger.js`, `test-setup.js`) - Custom logging wrapper
- **Test Processing** (`keep-failed.js`) - Filters and organizes test results
- **Jira Integration** (`jira-reporter.js`) - Automated bug reporting
- **Reporting** (`allure-report/`, `allure-results/`) - Allure test reports

### **Test Suites:**
1. **`login.spec.js`** - Google OAuth authentication and session storage
2. **`createPatient.spec.js`** - Patient creation form validation and workflows
3. **`referral.spec.js`** - Referral management with filtering and search
4. **`session.spec.js`** - Session validation tests

## 🔧 Technical Stack

- **Playwright 1.55.1** - Main testing framework
- **Allure Reporting** - Comprehensive test reporting
- **Jira Client Integration** - Automated bug creation/updating
- **Custom PageLogger** - Enhanced test step logging
- **Session Persistence** - Reusable authentication state

## 🎯 Key Features

### **Advanced Test Infrastructure:**
- **Session Management**: Reuses authenticated sessions via `storageState.json`
- **Enhanced Logging**: Custom `PageLogger` with step-by-step execution tracking
- **Smart Result Processing**: `keep-failed.js` automatically filters and organizes results
- **Jira Automation**: Creates, updates, and closes issues based on test results

### **Test Coverage:**
- **Authentication**: Google OAuth flow with session persistence
- **Patient Management**: Form validation, error handling, and creation workflows
- **Referral System**: Filtering (payer, referral type, date ranges), search functionality
- **UI Validation**: Comprehensive element visibility and interaction tests

### **Reporting & Integration:**
- **Allure Reports**: HTML reports with screenshots, videos, and traces
- **Jira Sync**: Automatic issue creation for failures with attachments
- **Test Artifacts**: Videos, screenshots, and logs for failed tests
- **CI/CD Ready**: Scripts for full workflow execution

## 📊 Current State

The repository shows:
- **400+ test result files** in `allure-results/`
- **Comprehensive test reports** in `allure-report/` and `docs/`
- **Active development** with recent test executions
- **Well-structured** test organization and reporting

## 🚀 Usage Patterns

From the package.json scripts, the typical workflow is:
1. `npm run test:clean` - Clean previous results
2. `npm run test` - Execute tests
3. `npm run test:process` - Process results (keep only failures)
4. `npm run jira:report` - Create/update Jira issues

The framework is designed for **continuous testing** with **automated bug tracking** and **comprehensive reporting**.
