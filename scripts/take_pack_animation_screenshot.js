const { chromium } = require('@playwright/test');

(async () => {
  console.log('🎬 Testing Pack Opening Animation Flow Visuals...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/kart-oyunu', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Paket Mağazası Sekmesine tıkla
  const packTab = page.locator('button:has-text("Paket Mağazası")').first();
  if (await packTab.isVisible()) {
    await packTab.click();
    await page.waitForTimeout(1000);
  }

  // Sinematik Paket Açılış Demosu Butonuna Tıkla
  const demoBtn = page.locator('button:has-text("Sinematik Paket Açılış Demosu")').first();
  if (await demoBtn.isVisible()) {
    console.log('🎯 Clicking Sinematik Paket Açılış Demosu button...');
    await demoBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: '.scratch/pack_animation_stage1.png' });
    console.log('✅ Stage 1 screenshot saved to .scratch/pack_animation_stage1.png');

    await page.waitForTimeout(2000);
    await page.screenshot({ path: '.scratch/pack_animation_stage2.png' });
    console.log('✅ Stage 2 card reveal screenshot saved to .scratch/pack_animation_stage2.png');
  } else {
    // Paket aç butonlarından birine tıkla
    const openBtn = page.locator('button:has-text("Kart Aç")').first();
    if (await openBtn.isVisible()) {
      console.log('🎯 Clicking Kart Aç button...');
      await openBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: '.scratch/pack_animation_stage1.png' });
    }
  }

  await browser.close();
})();
