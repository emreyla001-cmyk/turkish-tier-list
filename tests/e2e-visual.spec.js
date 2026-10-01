const { test, expect } = require('@playwright/test');

test.describe('Turkish Tier List - Visual & UI Integrity Tests', () => {
  test('Homepage loads correctly and brand logo is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Turkish Tier List/);
    const brand = page.locator('header a.brand').first();
    await expect(brand).toBeVisible();
  });

  test('Dark mode toggle works and toggles html theme class', async ({ page }) => {
    await page.goto('/');
    const darkModeBtn = page.locator('button[aria-label*="Modu"], button[aria-label*="Gece"]').first();
    if (await darkModeBtn.isVisible()) {
      await darkModeBtn.click();
      const hasThemeClass = await page.evaluate(() => 
        document.documentElement.classList.contains('light') || document.documentElement.classList.contains('dark')
      );
      expect(hasThemeClass).toBeTruthy();
    }
  });

  test('Legal DMCA notice page is accessible', async ({ page }) => {
    const response = await page.goto('/legal.html');
    expect(response.status()).toBe(200);
    await expect(page.locator('body')).toContainText('Telif Hakları');
  });

  test('Admin panel auth check works', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('body')).toContainText(/Giriş|Erişim Reddedildi|Admin/i);
  });
});
