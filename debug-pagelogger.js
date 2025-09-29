const fs = require('fs');

// Check if files exist
console.log('Checking files...');
console.log('test-setup.js exists:', fs.existsSync('./test-setup.js'));
console.log('page-logger.js exists:', fs.existsSync('./page-logger.js'));
console.log('referral.spec.js exists:', fs.existsSync('./referral.spec.js'));

// Check referral.spec.js content
if (fs.existsSync('./referral.spec.js')) {
    const content = fs.readFileSync('./referral.spec.js', 'utf-8');
    console.log('\nreferral.spec.js analysis:');
    console.log('- Has test-setup import:', content.includes("require('./test-setup')"));
    console.log('- Uses pageLogger:', content.includes('pageLogger'));
    console.log('- Has testInfo param:', content.includes('testInfo'));
} else {
    console.log('referral.spec.js not found in current directory');
}