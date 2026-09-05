import { test, expect } from '@playwright/test';

const routes = ['/', '/about', '/work', '/work/veflo-trace', '/work/internal-platform'];

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
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og-image\.png$/);
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
  await expect(page.locator('.case-inactive')).toHaveCount(1);
  await expect(page.locator('.case-inactive a')).toHaveCount(0);
});
