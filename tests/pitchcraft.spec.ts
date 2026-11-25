import { test, expect } from '@playwright/test';

const ROUTE = '/work/pitchcraft';

test.use({ contextOptions: { reducedMotion: 'reduce' } });

test.describe('PitchCraft case study', () => {
  test('title, facts line and stage headings render', async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'From a Kaggle capstone to a live baseball product',
    );
    await expect(page.locator('h2.stage-label')).toHaveCount(8);
  });

  test('one facts line under the lead replaces the facts strip', async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.locator('.facts-strip')).toHaveCount(0);
    const facts = page.locator('.page-hero .case-facts');
    await expect(facts).toHaveCount(1);
    // Exact approved copy, normalised for whitespace.
    const text = (await facts.textContent())!.replace(/\s+/g, ' ').trim();
    expect(text).toBe('Written at v2.2.0 · November 2026 · Open PitchCraft ↗ · GitHub ↗');
    // Directly after the lead.
    const follows = await facts.evaluate((el) => el.previousElementSibling?.classList.contains('case-lead'));
    expect(follows).toBe(true);
    const links = facts.locator('a');
    await expect(links).toHaveCount(2);
    await expect(links.nth(0)).toHaveAttribute('href', 'https://pitchcraft-agent.vercel.app');
    await expect(links.nth(1)).toHaveAttribute('href', 'https://github.com/Dher10/pitchcraft-agent');
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });

  test('cover is art-directed: phone crop on mobile, desktop capture on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ROUTE);
    const cover = page.locator('.case-figure img').first();
    await expect.poll(() => cover.evaluate((img: HTMLImageElement) => img.currentSrc)).toContain('cover-phone');
    const phoneBox = await cover.boundingBox();
    const proseWidth = await page.locator('.prose-wide').first().evaluate((el) => el.clientWidth);
    expect(Math.round(phoneBox!.width)).toBe(proseWidth);

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(ROUTE);
    await expect.poll(() => cover.evaluate((img: HTMLImageElement) => img.currentSrc)).toContain('game5-desktop');
    // sizes reaches the <source>: an 832px slot at DPR 1 never needs the 1920w rendition.
    const width = Number(new URL(await cover.evaluate((img: HTMLImageElement) => img.currentSrc)).searchParams.get('w'));
    expect(width).toBeLessThanOrEqual(1080);
  });

  test('before and after crops share height and scale; stacked on mobile', async ({ page }) => {
    await page.goto(ROUTE);
    const imgs = page.locator('.before-after img');
    await expect(imgs).toHaveCount(2);
    await imgs.first().scrollIntoViewIfNeeded();
    const [a, b] = [await imgs.nth(0).boundingBox(), await imgs.nth(1).boundingBox()];
    expect(Math.abs(a!.width - b!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(a!.height - b!.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(a!.y - b!.y)).toBeLessThanOrEqual(1); // side by side

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ROUTE);
    const [c, d] = [await imgs.nth(0).boundingBox(), await imgs.nth(1).boundingBox()];
    expect(d!.y).toBeGreaterThan(c!.y + c!.height); // stacked
    expect(Math.abs(c!.height - d!.height)).toBeLessThanOrEqual(1);
  });

  for (const viewport of [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'desktop', width: 1280, height: 900 },
  ]) {
    test(`print from a fresh load has every case image loaded (${viewport.name})`, async ({ page }) => {
      // Lazy images below the fold never load in print, which left the
      // before/after pair blank. No scrolling here: a fresh load, then print.
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.emulateMedia({ media: 'print' });
      await page.goto(ROUTE);
      const imgs = page.locator('article img');
      expect(await imgs.count()).toBeGreaterThanOrEqual(3);
      await expect(page.locator('.before-after img')).toHaveCount(2);
      for (const img of await imgs.all()) {
        await expect(img).not.toHaveAttribute('loading', 'lazy');
        await expect
          .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
          .toBe(true);
        const box = await img.boundingBox();
        expect(box?.width ?? 0).toBeGreaterThan(0);
        expect(box?.height ?? 0).toBeGreaterThan(0);
      }
      // The PDF itself renders: Chromium prints what has decoded.
      const pdf = await page.pdf();
      expect(pdf.byteLength).toBeGreaterThan(0);
    });
  }

  test('every case puts the back link above the eyebrow', async ({ page }) => {
    for (const route of ['/work/veflo-trace', '/work/internal-platform', ROUTE]) {
      await page.goto(route);
      const back = page.locator('.page-hero .back-link');
      await expect(back, route).toHaveCount(1);
      await expect(back).toHaveAttribute('href', '/work');
      const order = await back.evaluate((el) => el.nextElementSibling?.classList.contains('eyebrow'));
      expect(order, route).toBe(true);
      expect((await back.boundingBox())!.height, route).toBeGreaterThanOrEqual(44);
    }
  });

  test('eval units differ in shape, not only color', async ({ page }) => {
    await page.goto(ROUTE);
    const plain = page.locator('.units .unit:not(.unit-marked)').first();
    const marked = page.locator('.units-sentence .unit-marked').first();
    const style = (l: typeof plain) =>
      l.evaluate((el) => {
        const s = getComputedStyle(el);
        return { bg: s.backgroundColor, radius: s.borderTopLeftRadius, border: s.borderTopWidth };
      });
    const p = await style(plain);
    const m = await style(marked);
    expect(p.bg).toBe('rgba(0, 0, 0, 0)'); // outlined
    expect(parseFloat(p.border)).toBeGreaterThan(1);
    expect(m.bg).not.toBe('rgba(0, 0, 0, 0)'); // filled
    expect(parseFloat(m.radius)).toBeGreaterThan(parseFloat(p.radius)); // circle vs square
  });

  test('figures have captions and accessible content', async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.locator('.case-figure')).toHaveCount(4);
    await expect(page.locator('.case-figure figcaption')).toHaveCount(4);
    await expect(page.locator('.pipeline-step')).toHaveCount(5);
    await expect(page.getByRole('img', { name: /36 of 40/ })).toBeAttached();
    await expect(page.getByRole('img', { name: /3 of 5/ })).toBeAttached();
    for (const img of await page.locator('.case-figure img').all()) {
      expect((await img.getAttribute('alt'))?.length ?? 0).toBeGreaterThan(20);
    }
  });

  test('external links open in a new tab and source links are pinned to a commit', async ({ page }) => {
    await page.goto(ROUTE);
    const external = page.locator('main a[href^="https://"]');
    for (const link of await external.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
    const sources = page.locator('.case-sources a');
    await expect(sources).toHaveCount(8);
    for (const link of await sources.all()) {
      await expect(link).toHaveAttribute('href', /pitchcraft-agent\/(blob|tree)\/fd96889\//);
    }
  });

  test('serves Article JSON-LD without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(ROUTE);
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw!);
    expect(data['@type']).toBe('Article');
    expect(data.headline).toBe('From a Kaggle capstone to a live baseball product');
    await context.close();
  });

  test('More work lists the other two cases', async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.locator('a.case[href="/work/veflo-trace"]')).toHaveCount(1);
    await expect(page.locator('a.case[href="/work/internal-platform"]')).toHaveCount(1);
  });
});
