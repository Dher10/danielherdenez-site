import { test, expect } from '@playwright/test';

test('debug nav link font family', async ({ page }) => {
  await page.goto('https://danielherdenez-site.vercel.app');
  await page.setViewportSize({ width: 1280, height: 800 });

  const fontFamily = await page.evaluate(() => {
    const link = document.querySelector('.nav-links a');
    if (!link) return 'NO ELEMENT FOUND';
    return window.getComputedStyle(link).fontFamily;
  });

  console.log('FONT FAMILY VALUE:', fontFamily);
  console.log('LOWERCASE:', fontFamily.toLowerCase());

  // This will always pass - we just want the console output
  expect(fontFamily).toBeDefined();
});
