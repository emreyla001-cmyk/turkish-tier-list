/**
 * SITE HEALTH SCANNER (Playwright E2E Scanner)
 * ---------------------------------------------------------
 * Canlı siteni gezip şunları otomatik tespit eder:
 *   - Konsol hataları/uyarıları (JS error, React warning vs.)
 *   - Başarısız ağ istekleri (404, 500, timeout)
 *   - Kırık görseller (img src yüklenemeyenler)
 *   - Kırık linkler (aynı site içindeki <a href> linkleri)
 *   - Yatay taşma / düzen bozulması (mobil + masaüstü genişlikte)
 *   - Sayfa yüklenme süresi (çok yavaşsa uyarı verir)
 *   - Eksik temel SEO/meta etiketleri (title, description, h1)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.argv[2] || 'http://localhost:3004';

const EXTRA_PATHS = [
  '/vs',
  '/magaza',
  '/profil',
  '/koleksiyon',
  '/hakkinda',
  '/kaos',
  '/kart-oyunu'
];

const MAX_PAGES = 30;
const SLOW_LOAD_MS = 3000;
const NAV_TIMEOUT_MS = 15000;

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

function normalizeUrl(base, href) {
  try {
    const u = new URL(href, base);
    u.hash = '';
    if (u.origin !== new URL(base).origin) return null;
    if (/\.(pdf|zip|png|jpg|jpeg|gif|svg|webp|mp4|mp3)$/i.test(u.pathname)) return null;
    return u.toString().replace(/\/$/, '') || u.origin;
  } catch {
    return null;
  }
}

async function scanPage(browser, url, report) {
  const pageReport = {
    url,
    consoleErrors: [],
    consoleWarnings: [],
    failedRequests: [],
    brokenImages: [],
    loadTimeMs: null,
    missingMeta: [],
    layoutOverflow: [],
    discoveredLinks: [],
  };

  for (const viewport of VIEWPORTS) {
    let context;
    try {
      context = await browser.newContext({ viewport });
      const page = await context.newPage();

      page.on('console', (msg) => {
        const type = msg.type();
        if (type === 'error') pageReport.consoleErrors.push(`[${viewport.name}] ${msg.text()}`);
        if (type === 'warning') pageReport.consoleWarnings.push(`[${viewport.name}] ${msg.text()}`);
      });

      page.on('pageerror', (err) => {
        pageReport.consoleErrors.push(`[${viewport.name}] (uncaught) ${err.message}`);
      });

      page.on('requestfailed', (req) => {
        pageReport.failedRequests.push(`[${viewport.name}] ${req.method()} ${req.url()} -> ${req.failure()?.errorText}`);
      });

      page.on('response', (res) => {
        if (res.status() >= 400) {
          pageReport.failedRequests.push(`[${viewport.name}] HTTP ${res.status()} ${res.url()}`);
        }
      });

      const start = Date.now();
      await page.goto(url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
      const loadTime = Date.now() - start;
      if (viewport.name === 'desktop') pageReport.loadTimeMs = loadTime;

      // Kırık görseller
      const broken = await page.evaluate(() => {
        return Array.from(document.images)
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.src);
      });
      broken.forEach((src) => pageReport.brokenImages.push(`[${viewport.name}] ${src}`));

      // Yatay taşma
      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const overflowing = [];
        document.querySelectorAll('body *').forEach((el) => {
          if (el.scrollWidth > docWidth + 5) {
            overflowing.push(el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
          }
        });
        return [...new Set(overflowing)].slice(0, 10);
      });
      if (overflow.length) {
        pageReport.layoutOverflow.push(`[${viewport.name}] taşan elementler: ${overflow.join(', ')}`);
      }

      // Temel SEO/meta kontrolü
      if (viewport.name === 'desktop') {
        const meta = await page.evaluate(() => ({
          title: document.title || null,
          description: document.querySelector('meta[name="description"]')?.content || null,
          h1Count: document.querySelectorAll('h1').length,
        }));
        if (!meta.title) pageReport.missingMeta.push('title etiketi yok');
        if (!meta.description) pageReport.missingMeta.push('meta description yok');
        if (meta.h1Count === 0) pageReport.missingMeta.push('sayfada h1 yok');
        if (meta.h1Count > 1) pageReport.missingMeta.push(`birden fazla h1 var (${meta.h1Count} adet)`);

        const links = await page.evaluate(() =>
          Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href'))
        );
        pageReport.discoveredLinks = links
          .map((href) => normalizeUrl(url, href))
          .filter(Boolean);
      }

      await context.close();
    } catch (e) {
      pageReport.failedRequests.push(`[${viewport.name}] NAVIGATION ERROR: ${e.message}`);
      if (context) await context.close().catch(() => {});
    }
  }

  report.push(pageReport);
  return pageReport.discoveredLinks;
}

function printReport(report) {
  console.log('\n=================================================');
  console.log('              SITE HEALTH SCAN REPORT            ');
  console.log('=================================================\n');

  let totalIssues = 0;

  for (const r of report) {
    const issues =
      r.consoleErrors.length +
      r.failedRequests.length +
      r.brokenImages.length +
      r.layoutOverflow.length +
      r.missingMeta.length +
      (r.loadTimeMs && r.loadTimeMs > SLOW_LOAD_MS ? 1 : 0);

    if (issues === 0) {
      console.log(`✅ ${r.url} — sorun bulunamadı (${r.loadTimeMs}ms)`);
      continue;
    }

    totalIssues += issues;
    console.log(`⚠️  ${r.url}`);
    if (r.loadTimeMs > SLOW_LOAD_MS) console.log(`   🐢 Yavaş yükleme: ${r.loadTimeMs}ms (sınır: ${SLOW_LOAD_MS}ms)`);
    r.consoleErrors.forEach((e) => console.log(`   🔴 Konsol hatası: ${e}`));
    r.consoleWarnings.slice(0, 5).forEach((w) => console.log(`   🟡 Konsol uyarısı: ${w}`));
    r.failedRequests.forEach((f) => console.log(`   🔴 Başarısız istek: ${f}`));
    r.brokenImages.forEach((b) => console.log(`   🖼️  Kırık görsel: ${b}`));
    r.layoutOverflow.forEach((o) => console.log(`   📐 ${o}`));
    r.missingMeta.forEach((m) => console.log(`   📝 SEO eksikliği: ${m}`));
    console.log('');
  }

  console.log('=================================================');
  console.log(`Toplam taranan sayfa: ${report.length} | Toplam tespit edilen sorun: ${totalIssues}`);
  console.log('=================================================\n');
}

(async () => {
  console.log(`Taramaya başlanıyor: ${BASE_URL}\n`);
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (e) {
    console.error("Playwright browser launch failed: " + e.message);
    process.exit(1);
  }

  const report = [];
  const visited = new Set();
  const queue = [normalizeUrl(BASE_URL, BASE_URL), ...EXTRA_PATHS.map((p) => normalizeUrl(BASE_URL, p))].filter(Boolean);

  while (queue.length && visited.size < MAX_PAGES) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);

    process.stdout.write(`Taranıyor: ${url} ... `);
    try {
      const newLinks = await scanPage(browser, url, report);
      console.log('tamam.');
      newLinks.forEach((l) => {
        if (!visited.has(l) && !queue.includes(l)) queue.push(l);
      });
    } catch (e) {
      console.log(`HATA: ${e.message}`);
      report.push({ url, consoleErrors: [`Sayfa hiç açılamadı: ${e.message}`], consoleWarnings: [], failedRequests: [], brokenImages: [], loadTimeMs: null, missingMeta: [], layoutOverflow: [], discoveredLinks: [] });
    }
  }

  await browser.close();
  printReport(report);

  const scratchDir = path.join(__dirname, '..', '.scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }
  const reportPath = path.join(scratchDir, 'site_health_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Detaylı rapor ${reportPath} dosyasına kaydedildi.`);
})();
