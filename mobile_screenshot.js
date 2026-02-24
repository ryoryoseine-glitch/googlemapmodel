const { chromium } = require('playwright-core');

(async () => {
    try {
        const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'; // Try using system Chrome since standard playwright install is blocked
        const browser = await chromium.launch({ executablePath, channel: 'chrome' }).catch(async () => {
            // fallback to default if chrome isn't found
            const b = require('playwright').chromium;
            return await b.launch();
        });

        const context = await browser.newContext({
            viewport: { width: 390, height: 844 },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
        });
        const page = await context.newPage();
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

        // Wait an extra second for layout settling
        await page.waitForTimeout(1000);

        await page.screenshot({ path: '/Users/nemotoryousei/.gemini/antigravity/brain/b633382b-1d64-4e13-963d-0e6038283e1b/mobile_layout_preview.png' });
        console.log("Screenshot successfully saved.");
        await browser.close();
    } catch (e) {
        console.error("Error capturing mobile screenshot:", e);
        process.exit(1);
    }
})();
