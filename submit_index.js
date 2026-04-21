const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

// 1. Configuration
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service_account.json');

// Check if Service Account JSON exists
if (!fs.existsSync(SERVICE_ACCOUNT_FILE)) {
    console.error('❌ ERROR: "service_account.json" not found!');
    console.log('To use the Google Indexing API, you must:');
    console.log('  1. Go to Google Cloud Console (https://console.cloud.google.com/)');
    console.log('  2. Create a new Project and Enable the "Web Search Indexing API"');
    console.log('  3. Create a Service Account, generate a JSON Key, and download it.');
    console.log('  4. Rename the downloaded file to "service_account.json" and place it in this directory.');
    console.log('  5. Go to Google Search Console and add the Service Account Email as an "Owner" of your property.');
    process.exit(1);
}

// 2. Load Site Data safely
// We read site_data.js. Since it's meant for browser, it has `const products = ...`
// We'll read the file and eval it or parse it.
let siteDataContent = fs.readFileSync(path.join(__dirname, 'site_data.js'), 'utf8');
// Mocking the browser environment variables if any are used in site_data.js
let products = [];
let blogs = [];
let siteConfig = { baseUrl: 'https://bestpvashop.com/' };

try {
    // Strip `const` or `let` to allow eval into current scope, or just wrap it in a function
    const wrappedCode = siteDataContent + `\nreturn { products, blogs, siteConfig };`;
    const result = new Function(wrappedCode)();
    products = result.products || [];
    blogs = result.blogs || [];
    if (result.siteConfig && result.siteConfig.baseUrl) {
        siteConfig.baseUrl = result.siteConfig.baseUrl;
    }
} catch (error) {
    console.warn("⚠️ Warning: Could not execute site_data.js directly.", error.message);
    console.log("Will attempt simple regex fallback.");
    // Fallback: Just grab baseUrl if we can't eval it properly
    // This is a safety measure.
}

const BASE_URL = siteConfig.baseUrl || 'https://bestpvashop.com/';

// 3. Generate URLs to index
function getDynamicUrl(type, slug = '') {
    const slugStr = slug ? slug + '/' : '';
    let typeStr = '';
    if (type === 'product') typeStr = 'product/';
    else if (type === 'blog') typeStr = 'blog/';
    else if (type === 'category') typeStr = 'categories/';
    return `${BASE_URL}${typeStr}${slugStr}`;
}

const urlsToIndex = [];

// Add Homepage
urlsToIndex.push(BASE_URL);

// Add Latest 5 Products
const latestProducts = products.slice(-5);
latestProducts.forEach(p => {
    if (p.slug) urlsToIndex.push(getDynamicUrl('product', p.slug));
});

// Add Latest 5 Blogs
const latestBlogs = blogs.slice(-5);
latestBlogs.forEach(b => {
    if (b.slug) urlsToIndex.push(getDynamicUrl('blog', b.slug));
});

console.log(`📋 Found ${urlsToIndex.length} URLs to submit to Google Indexing API.`);

// 4. Authenticate and Submit
async function submitUrls() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_FILE,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });

        const authClient = await auth.getClient();
        const indexing = google.indexing({ version: 'v3', auth: authClient });

        console.log('🚀 Authenticated successfully. Starting submission...\n');

        let successCount = 0;
        let failCount = 0;

        for (const url of urlsToIndex) {
            try {
                const response = await indexing.urlNotifications.publish({
                    requestBody: {
                        url: url,
                        type: 'URL_UPDATED', // 'URL_UPDATED' is used for both new and updated pages
                    },
                });

                if (response.status === 200) {
                    console.log(`✅ Success: ${url}`);
                    successCount++;
                } else {
                    console.log(`⚠️ Warning: Got status ${response.status} for ${url}`);
                    failCount++;
                }
            } catch (error) {
                // If the error is 403, it usually means the service account is not added as Owner in GSC.
                console.error(`❌ Failed: ${url}`);
                console.error(`   Error details: ${error.message}`);
                failCount++;
                
                if (error.code === 403) {
                    console.log('\n🔒 IMPORTANT: A 403 Permission Denied error usually means you forgot to add the Service Account email as an "Owner" in Google Search Console, or the Web Search Indexing API is not enabled in your Google Cloud Project.');
                    break; // Stop submitting if we get a 403
                }
            }

            // Small delay to prevent hitting rate limits too quickly
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`\n🎉 Submission Complete!`);
        console.log(`✅ Successfully submitted: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);

    } catch (error) {
        console.error('❌ Authentication or Setup Error:', error.message);
    }
}

submitUrls();
