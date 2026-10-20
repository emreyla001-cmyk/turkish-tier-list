const { chromium } = require('@playwright/test');

(async ()=> {
  console.log('ğŸ§ª Verifying Web Audio API Sound Triggers in Real Browser Runtime...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Console log dinleyici
  page.on('console', msg=> console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:3000/kart-oyunu', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Audio Context Durumunu Test Et
  const audioStatus = await page.evaluate(()=> {
    try {
      const { cardAudio } = require('../lib/cardAudio');
      cardAudio.init();
      return {
        contextState: cardAudio.ctx ? cardAudio.ctx.state : 'null',
        sampleRate: cardAudio.ctx ? cardAudio.ctx.sampleRate : 0,
      };
    } catch (e) {
      return { error: e.message };
    }
  });

  console.log('ğŸ§ Audio Engine Runtime Status:', JSON.stringify(audioStatus));
  await browser.close();
})();



