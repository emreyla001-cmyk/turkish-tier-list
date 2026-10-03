const { chromium } = require('@playwright/test');

(async ()=> {
  console.log('ğŸ¬ Testing Magaza Pack Opening Animation Flow...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/magaza', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Paketler Sekmesine TÄ±kla
  const packsTab = page.locator('button:has-text("Tier Kart Paketleri")').first();
  if (await packsTab.isVisible()) {
    await packsTab.click();
    await page.waitForTimeout(1000);
  }

  // Paket aÃ§ butonuna tÄ±kla
  const packBtn = page.locator('button:has-text("Kart AÃ§")').first();
  if (await packBtn.isVisible()) {
    console.log('ğŸ¯ Clicking Kart AÃ§ button on Magaza page...');
    await packBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: '.scratch/magaza_pack_stage1.png' });
    console.log('âœ… Stage 1 screenshot saved to .scratch/magaza_pack_stage1.png');

    await page.waitForTimeout(2000);
    await page.screenshot({ path: '.scratch/magaza_pack_stage2.png' });
    console.log('âœ… Stage 2 screenshot saved to .scratch/magaza_pack_stage2.png');
  }

  await browser.close();
})();



