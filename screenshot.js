const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/Users/nemotoryousei/.gemini/antigravity/brain/b633382b-1d64-4e13-963d-0e6038283e1b/mobile_layout_preview.png' });
  await browser.close();
})();
