const { chromium } = require('@playwright/test');

(async ()=> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/magaza', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // MaÄŸaza genel gÃ¶rÃ¼nÃ¼mÃ¼
  await page.screenshot({ path: '.scratch/magaza_overview.png' });
  console.log('âœ… Overview saved');

  // Herhangi bir Kart AÃ§ butonunu ara ve tÄ±kla
  const btn = page.locator('button:has-text("Kart AÃ§")').first();
  if (await btn.isVisible()) {
    console.log('Found Kart AÃ§ button');
    await btn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '.scratch/magaza_pack_opened.png' });
    console.log('âœ… Pack opened screenshot saved');
  } else {
    console.log('Kart AÃ§ button not visible directly, checking text...');
  }

  await browser.close();
})();



