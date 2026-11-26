import { test, expect } from '@playwright/test';
import { normalize, pageBlocks, readCopy } from './support/editorial-copy';

const ROUTE = '/work/pitchcraft-v1-kaggle';
const COPY = readCopy('01_PitchCraft_v1_Kaggle_Copy.md');

test.use({ contextOptions: { reducedMotion: 'reduce' } });

test.describe('Case 03: PitchCraft v1 · Kaggle', () => {
  test('visible text matches file 01 word for word, in order', async ({ page }) => {
    await page.goto(ROUTE);
    expect(await pageBlocks(page)).toEqual(COPY.blocks);
  });

  test('every link in file 01 is on the page with its exact destination', async ({ page }) => {
    await page.goto(ROUTE);
    for (const { text, href } of COPY.links) {
      const links = page.locator(`main a[href="${href}"]`).filter({ hasText: text });
      expect(await links.count(), `${text} -> ${href}`).toBeGreaterThanOrEqual(1);
    }
  });

  test('no implementation note is rendered', async ({ page }) => {
    await page.goto(ROUTE);
    const text = (await page.locator('main').textContent())!;
    expect(text).not.toMatch(/\[(label|Figure|Cover|closing|pull|serif)/i);
  });

  test('title, facts line and chapter labels render', async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Building a scouting product around verifiable claims',
    );
    await expect(page.locator('h2.stage-label')).toHaveText([
      'The idea',
      'Seven days',
      'Verifiable claims',
      'The first version',
    ]);
    const facts = page.locator('.page-hero .case-facts');
    expect(normalize((await facts.textContent())!)).toBe('Based on v1.0.0-kaggle · July 2026 · Open PitchCraft · GitHub');
    const links = facts.locator('a');
    await expect(links.nth(0)).toHaveAttribute('href', 'https://pitchcraft-agent.vercel.app/');
    await expect(links.nth(1)).toHaveAttribute('href', 'https://github.com/Dher10/pitchcraft-agent/tree/v1.0.0-kaggle');
  });

  test('cross-link to case 04 sits in the final body paragraph', async ({ page }) => {
    await page.goto(ROUTE);
    const last = page.locator('article .about-prose > p').last();
    const link = last.getByRole('link', { name: 'From a Kaggle capstone to a live baseball product', exact: true });
    await expect(link).toHaveAttribute('href', '/work/pitchcraft-v2-world-series');
    await expect(link).not.toHaveAttribute('target', /.+/);
  });

  test('cover is the v1 rebuild with its approved caption, art-directed', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ROUTE);
    const figure = page.locator('.prose-wide .case-figure').first();
    await expect(figure.locator('figcaption')).toHaveText(
      'The Kaggle version, rebuilt from the v1.0.0-kaggle tag in November 2026.',
    );
    const cover = figure.locator('img');
    expect((await cover.getAttribute('alt'))?.length ?? 0).toBeGreaterThan(20);
    await expect.poll(() => cover.evaluate((img: HTMLImageElement) => decodeURIComponent(img.currentSrc))).toContain(
      '/work/pitchcraft-v1-kaggle/pitchcraft-v1-cover-phone',
    );
    const box = await cover.boundingBox();
    const proseWidth = await page.locator('.prose-wide').first().evaluate((el) => el.clientWidth);
    expect(Math.round(box!.width)).toBe(proseWidth);

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(ROUTE);
    await expect.poll(() => cover.evaluate((img: HTMLImageElement) => decodeURIComponent(img.currentSrc))).toContain(
      '/work/pitchcraft-v1-kaggle/pitchcraft-v1-desktop',
    );
    const width = Number(new URL(await cover.evaluate((img: HTMLImageElement) => img.currentSrc)).searchParams.get('w'));
    expect(width).toBeLessThanOrEqual(1080);
    // The only figure on this page is the cover.
    await expect(page.locator('.case-figure')).toHaveCount(1);
  });

  test('print from a fresh load has the cover loaded', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.goto(ROUTE);
    const img = page.locator('article img').first();
    await expect(img).not.toHaveAttribute('loading', 'lazy');
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  });

  test('external links open in a new tab; sources are pinned to the Kaggle tag', async ({ page }) => {
    await page.goto(ROUTE);
    for (const link of await page.locator('main a[href^="https://"]').all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
    const sources = page.locator('.case-sources a');
    await expect(sources).toHaveCount(3);
    for (const link of await sources.all()) {
      await expect(link).toHaveAttribute('href', /pitchcraft-agent\/(blob|tree)\/v1\.0\.0-kaggle(\/|$)/);
    }
    await expect(page.locator('main a[href*="fd96889"]')).toHaveCount(0);
  });

  test('serves Article JSON-LD without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(ROUTE);
    const data = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
    expect(data['@type']).toBe('Article');
    expect(data.headline).toBe('Building a scouting product around verifiable claims');
    expect(data.url).toBe(`https://danielherdenez.com${ROUTE}`);
    expect(data.image).toBe(`https://danielherdenez.com${ROUTE}/og.png`);
    await context.close();
  });

  test('More work lists the other three cases, never this one', async ({ page }) => {
    await page.goto(ROUTE);
    const hrefs = await page.locator('section.work a.case').evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(hrefs).toEqual(['/work/veflo-trace', '/work/internal-platform', '/work/pitchcraft-v2-world-series']);
    await expect(page.locator(`main a[href="${ROUTE}"]`)).toHaveCount(0);
  });
});
