#!/usr/bin/env node

/**
 * Post-generation patch script for Mobile API client
 * This script ensures axios is configured to handle binary responses correctly
 * Run after: npm run generate-api
 */

const fs = require('fs');
const path = require('path');

const REQUEST_FILE_PATH = path.join(__dirname, '../src/infrastructure/api/generated/core/request.ts');

console.log('🔧 Patching mobile API client...');

try {
    let content = fs.readFileSync(REQUEST_FILE_PATH, 'utf-8');

    // Check if already patched
    if (content.includes('responseType for binary')) {
        console.log('✅ Mobile API client already patched, skipping...');
        process.exit(0);
    }

    // Find the sendRequest function and add responseType configuration
    const sendRequestPattern = /(const requestConfig: AxiosRequestConfig = \{[\s\S]*?cancelToken: source\.token,)/;

    if (sendRequestPattern.test(content)) {
        content = content.replace(
            sendRequestPattern,
            `$1
        // Set responseType for binary files (Excel, PDF, etc.)
        responseType: options.url.includes('/export/') ? 'blob' : 'json',`
        );

        fs.writeFileSync(REQUEST_FILE_PATH, content, 'utf-8');
        console.log('✅ Successfully patched request.ts for binary response handling');
    } else {
        console.warn('⚠️  Could not find expected pattern in request.ts');
        console.warn('⚠️  Manual patching may be required');
        process.exit(1);
    }

} catch (error) {
    console.error('❌ Error patching mobile API client:', error);
    process.exit(1);
}
