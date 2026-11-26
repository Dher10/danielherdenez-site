import { test, expect } from '@playwright/test';

const routes = ['/', '/about', '/work', '/work/veflo-trace', '/work/internal-platform', '/work/pitchcraft-v1-kaggle', '/work/pitchcraft-v2-world-series'];

test.use({ contextOptions: { reducedMotion: 'reduce' } });

test('internal pages expose sections without skipping heading levels', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const levels = await page.getByRole('heading').evaluateAll((headings) =>
      headings.map((heading) => Number(heading.tagName.slice(1))),
    );
    expect(levels[0], route).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i], `${route}: heading ${i + 1}`).toBeLessThanOrEqual(levels[i - 1] + 1);
    }
    if (route === '/about') {
      await expect(page.getByRole('heading', { name: 'Manufacturing', level: 2 })).toBeAttached();
      await expect(page.getByRole('heading', { name: 'Now', level: 2 })).toBeAttached();
    }
  }
});

test('scroll-spy clears the current section when returning to the hero', async ({ page }) => {
  await page.goto('/');
  // A real interaction ensures hydration before testing the observer.
  await page.locator('.theme-toggle').click();
  for (const [id, label] of [['work', 'Work'], ['about', 'About'], ['writing', 'Writing & Artifacts']]) {
    await page.locator(`#${id}`).evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await expect(page.locator('.nav-links a.active')).toHaveText(label);
    await expect(page.locator('.nav-links a.active')).toHaveAttribute('aria-current', 'location');
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(page.locator('.nav-links .active')).toHaveCount(0);
  await expect(page.locator('.nav-links [aria-current]')).toHaveCount(0);
});

test('mobile navigation exposes and styles the current page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  const nav = page.getByRole('navigation', { name: 'Mobile primary' });
  const active = nav.getByRole('link', { name: 'About', exact: true });
  await expect(active).toHaveAttribute('aria-current', 'page');
  await expect.poll(async () => {
    const activeColor = await active.evaluate((el) => getComputedStyle(el).color);
    const otherColor = await nav.getByRole('link', { name: 'Work', exact: true })
      .evaluate((el) => getComputedStyle(el).color);
    return activeColor !== otherColor;
  }).toBe(true);
  await nav.getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page).toHaveURL(/\/work$/);
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(nav.getByRole('link', { name: 'Work', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('footer social links keep a 44px mobile hit area', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const sizes = await page.locator('.foot-socials .social-link').evaluateAll((links) =>
    links.map((link) => {
      const styles = getComputedStyle(link);
      return { width: styles.width, height: styles.height };
    }),
  );

  expect(sizes).toEqual([
    { width: '44px', height: '44px' },
    { width: '44px', height: '44px' },
    { width: '44px', height: '44px' },
  ]);
});

test('every route shares its own title, description and URL', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', description!);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', description!);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content', `https://danielherdenez.com${route === '/' ? '' : route}`,
    );
    // Each PitchCraft case has its own share image in its asset folder.
    const ogImage = route.startsWith('/work/pitchcraft-')
      ? `https://danielherdenez.com${route}/og.png`
      : /\/og-image\.png$/;
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', ogImage);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href', `https://danielherdenez.com${route === '/' ? '' : route}`,
    );
  }
});

test('theme state is accessible after switching, reloading and client navigation', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Light theme', exact: true });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.nav-links').getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light');
});

test('case links navigate without replacing the document and support browser back', async ({ page }) => {
  await page.goto('/work');
  await page.locator('.theme-toggle').click();
  const documents: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'document') documents.push(request.url());
  });
  await page.locator('a.case[href="/work/veflo-trace"]').click();
  await expect(page).toHaveURL(/\/work\/veflo-trace$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('AI-assisted operations');
  expect(documents).toEqual([]);
  await page.goBack();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.locator('a.case')).toHaveCount(4);
});

test('case-to-case navigation from More work resets scroll to the top', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/work/veflo-trace');
  await page.getByRole('heading', { name: 'More work' }).scrollIntoViewIfNeeded();

  await page.getByRole('link', { name: /Internal platform/ }).click();

  await expect(page).toHaveURL(/\/work\/internal-platform$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

const INNER = [
  '/about',
  '/work',
  '/work/veflo-trace',
  '/work/internal-platform',
  '/work/pitchcraft-v1-kaggle',
  '/work/pitchcraft-v2-world-series',
];

for (const [width, height, maxGap] of [[390, 844, 56], [1280, 900, 104]] as const) {
  test(`inner pages share one compact top spacing at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const tops: number[] = [];
    for (const route of INNER) {
      await page.goto(route);
      const navBottom = await page.locator('.nav').evaluate((el) => el.getBoundingClientRect().bottom);
      // The hero's prose block: the back link (cases) or the eyebrow starts it.
      const first = await page
        .locator('.page-hero .prose-narrow')
        .evaluate((el) => el.getBoundingClientRect().top);
      expect(first - navBottom, route).toBeLessThanOrEqual(maxGap);
      tops.push(Math.round(first));
    }
    expect(new Set(tops).size, `first-element tops ${tops.join(', ')}`).toBe(1);
  });
}

test('/work has no second gap between the heading and the first card', async ({ page }) => {
  await page.goto('/work');
  const pad = await page.locator('section.work').evaluate((el) => getComputedStyle(el).paddingTop);
  expect(pad).toBe('0px');
});

for (const theme of ['dark', 'light'] as const) {
  test(`scrolled nav surface is near-opaque (${theme})`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('dh-theme', t), theme);
    await page.goto('/work/pitchcraft-v2-world-series');
    await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'instant' }));
    const nav = page.locator('.nav');
    await expect(nav).toHaveClass(/scrolled/);
    // Poll: the background transitions in over 200ms.
    await expect
      .poll(() =>
        nav.evaluate((el) => {
          const bg = getComputedStyle(el).backgroundColor;
          const parts = bg.match(/[\d.]+/g)!.map(Number);
          // rgb() → opaque; rgba()/color(... / a) → last number is alpha.
          return /rgba|\//.test(bg) ? parts[parts.length - 1] : 1;
        }),
      )
      .toBeGreaterThanOrEqual(0.94);
  });
}
