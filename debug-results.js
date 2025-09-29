// debug-results.js - Save this file in your project root directory
const fs = require("fs");
const path = require("path");

const resultsDir = path.join(__dirname, "test-results");

console.log("🔍 Analyzing test-results directory structure...\n");

if (!fs.existsSync(resultsDir)) {
    console.log("❌ No test-results directory found!");
    process.exit(1);
}

const testFolders = fs.readdirSync(resultsDir);
console.log(`📁 Found ${testFolders.length} folders in test-results:`);

testFolders.forEach((folder, index) => {
    const folderPath = path.join(resultsDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) return;

    console.log(`\n${index + 1}. Folder: ${folder}`);

    // List all files in this folder
    const files = fs.readdirSync(folderPath);
    console.log(`   📄 Files (${files.length}):`, files.join(', '));

    // Check for specific indicators
    const hasTrace = files.includes('trace.zip');
    const hasStepsLog = files.includes('steps.log');
    const hasVideo = files.some(f => f.endsWith('.webm'));
    const hasScreenshots = files.some(f => f.endsWith('.png'));

    console.log(`   🔍 Indicators:`);
    console.log(`      - trace.zip: ${hasTrace ? '✅' : '❌'}`);
    console.log(`      - steps.log: ${hasStepsLog ? '✅' : '❌'}`);
    console.log(`      - video: ${hasVideo ? '✅' : '❌'}`);
    console.log(`      - screenshots: ${hasScreenshots ? '✅' : '❌'}`);

    // If steps.log exists, read its content
    if (hasStepsLog) {
        const stepsPath = path.join(folderPath, 'steps.log');
        const content = fs.readFileSync(stepsPath, 'utf-8').substring(0, 200);
        console.log(`   📝 steps.log preview: "${content.replace(/\n/g, ' ')}..."`);
    }
});

console.log("\n💡 Based on this analysis, failed tests should have one or more of:");
console.log("   - trace.zip file");
console.log("   - video recordings (.webm files)");
console.log("   - multiple screenshots");
console.log("   - steps.log with error content");