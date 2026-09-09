import { test, expect } from '@playwright/test';

test.use({ contextOptions: { javaScriptEnabled: false } });

test('about serves a Person profile as JSON-LD without JavaScript', async ({ page }) => {
  await page.goto('/about');
  const scripts = page.locator('script[type="application/ld+json"]');
  await expect(scripts).toHaveCount(1);
  const profile = JSON.parse((await scripts.textContent())!);
  expect(profile['@context']).toBe('https://schema.org');
  expect(profile['@type']).toBe('ProfilePage');
  expect(profile.url).toBe('https://danielherdenez.com/about');
  expect(profile.mainEntity).toMatchObject({
    '@type': 'Person',
    '@id': 'https://danielherdenez.com/#person',
    name: 'Daniel Herdenez',
    url: 'https://danielherdenez.com',
  });
  // Structured identity must agree with the public profile links on the page.
  const socialUrls = await page.locator('.foot-socials a[target="_blank"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(profile.mainEntity.sameAs).toEqual(socialUrls);
  await page.goto('/work');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
});
