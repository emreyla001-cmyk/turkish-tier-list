const { chromium } = require('@playwright/test');

(async () => {
  console.log('📸 Taking visual screenshots of Home Page and Pack Opening...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Ana Sayfa Görüntüsü
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '.scratch/homepage_live.png' });
  console.log('✅ Homepage screenshot saved to .scratch/homepage_live.png');

  // 2. Kart Oyunu Sayfası & Paket Açılışı
  await page.goto('http://localhost:3000/kart-oyunu', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '.scratch/kart_oyunu_live.png' });
  console.log('✅ Kart Oyunu screenshot saved to .scratch/kart_oyunu_live.png');

  await browser.close();
})();
