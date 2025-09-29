// keep-failed.js - Updated to only keep failed tests (remove all passed tests)
const fs = require("fs");
const path = require("path");

const resultsDir = path.join(__dirname, "test-results");

function sanitizeName(name) {
    return name.replace(/[^a-z0-9]/gi, "_");
}

function isTestFailed(folderPath, folderName) {
    const files = fs.readdirSync(folderPath);

    // Method 1: Check for video recordings (most reliable for your setup)
    const hasVideo = files.some(f => f.endsWith('.webm') || f.endsWith('.mp4'));
    if (hasVideo) {
        console.log(`   ✅ FAILED - Video recording found`);
        return true;
    }

    // Method 2: Check for "test-failed" screenshots
    const hasFailedScreenshot = files.some(f => f.includes('test-failed'));
    if (hasFailedScreenshot) {
        console.log(`   ✅ FAILED - test-failed screenshot found`);
        return true;
    }

    // Method 3: Check steps.log for failure indicators
    const stepsLogPath = path.join(folderPath, 'steps.log');
    if (fs.existsSync(stepsLogPath)) {
        const content = fs.readFileSync(stepsLogPath, 'utf-8');
        // Check if the log contains "TEST FAILED" or error markers
        if (content.includes('=== TEST FAILED ===') ||
            content.includes('ERROR') ||
            content.includes('FAILED:')) {
            console.log(`   ✅ FAILED - Error markers found in steps.log`);
            return true;
        }
    }

    // Method 4: Multiple screenshots usually indicate failures
    const screenshots = files.filter(f => f.endsWith('.png'));
    if (screenshots.length > 2) {
        console.log(`   ✅ FAILED - Multiple screenshots (${screenshots.length})`);
        return true;
    }

    console.log(`   ✅ PASSED - Only basic artifacts found`);
    return false;
}

function processTestResults() {
    if (!fs.existsSync(resultsDir)) {
        console.log("❌ No test-results directory found!");
        return;
    }

    const testFolders = fs.readdirSync(resultsDir);
    let passedCount = 0;
    let failedCount = 0;

    console.log(`🔍 Processing ${testFolders.length} test result folders...\n`);

    testFolders.forEach((folder, index) => {
        const folderPath = path.join(resultsDir, folder);
        if (!fs.statSync(folderPath).isDirectory()) return;

        console.log(`${index + 1}. ${folder}`);

        const testFailed = isTestFailed(folderPath, folder);

        if (!testFailed) {
            console.log(`   🗑️  Removing passed test folder\n`);
            fs.rmSync(folderPath, { recursive: true, force: true });
            passedCount++;
        } else {
            console.log(`   📦 Keeping failed test folder`);

            // Ensure steps.log exists and is clean for failed tests
            const stepsLogPath = path.join(folderPath, 'steps.log');
            if (!fs.existsSync(stepsLogPath)) {
                const files = fs.readdirSync(folderPath);
                const defaultLog = `=== TEST FAILED ===

Test: ${folder}
Status: FAILED

Test artifacts generated:
${files.map(f => `- ${f}`).join('\n')}

Error Details:
This test failed during execution. Please check the attached:
- Video recording (video.webm) for visual playback
- Screenshot (test-failed-*.png) showing failure point  
- Trace file (trace.zip) for detailed debugging

Note: Detailed step-by-step logging was not available for this test run.
To get detailed steps, ensure the test is using the enhanced PageLogger system.`;

                fs.writeFileSync(stepsLogPath, defaultLog);
                console.log(`   📝 Created default steps.log for Jira reporting`);
            } else {
                // Clean up existing steps.log to ensure it only contains test execution steps
                let content = fs.readFileSync(stepsLogPath, 'utf-8');

                // Find the "Test Execution Steps" section and only keep that part
                const stepsStartMarker = '--- Test Execution Steps ---';
                const stepsEndMarker = '--- Test Execution Complete ---';

                if (content.includes(stepsStartMarker) && content.includes(stepsEndMarker)) {
                    const stepsStart = content.indexOf(stepsStartMarker);
                    const stepsEnd = content.indexOf(stepsEndMarker);

                    if (stepsStart !== -1 && stepsEnd !== -1) {
                        // Extract only the test execution steps
                        const executionSteps = content.substring(stepsStart + stepsStartMarker.length, stepsEnd).trim();

                        // Create clean log with only execution steps
                        const cleanLog = `Test: ${folder}
Status: FAILED

=== Test Execution Steps ===

${executionSteps}

=== END OF EXECUTION STEPS ===`;

                        fs.writeFileSync(stepsLogPath, cleanLog);
                        console.log(`   📝 Cleaned steps.log - kept only execution steps`);
                    }
                }
            }

            // Clean up folder name for better Jira integration
            const cleanTestName = folder
                .split('-chromium')[0]
                .replace(/-[a-f0-9]{5,}/g, '') // Remove hash-like patterns
                .replace(/--+/g, '-') // Replace multiple dashes
                .replace(/^-|-$/g, ''); // Remove leading/trailing dashes

            const cleanFolder = path.join(resultsDir, sanitizeName(cleanTestName));

            // Rename if needed and target doesn't exist
            if (folderPath !== cleanFolder && !fs.existsSync(cleanFolder)) {
                fs.renameSync(folderPath, cleanFolder);
                console.log(`   🏷️  Renamed to: ${sanitizeName(cleanTestName)}`);
            }

            console.log(''); // Add spacing
            failedCount++;
        }
    });

    console.log(`📊 Results Summary:`);
    console.log(`✅ Passed tests removed: ${passedCount}`);
    console.log(`❌ Failed tests kept: ${failedCount}`);

    if (failedCount > 0) {
        console.log(`\n🎯 Next step: Run 'node jira-reporter.js' to create ${failedCount} Jira issues`);
        console.log(`📝 Only failed tests with clean execution steps will be reported to Jira`);
    } else {
        console.log(`\n🎉 All tests passed! No Jira issues needed.`);
    }
}

// Run the cleanup
try {
    console.log("🚀 Starting test results processing (failed tests only)...\n");
    processTestResults();
    console.log("\n✅ Test results processing completed successfully.");
} catch (error) {
    console.error("\n❌ Error processing test results:", error);
    process.exit(1);
}