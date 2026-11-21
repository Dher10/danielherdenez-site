import { test, expect } from '@playwright/test';

const ROUTE = '/work/pitchcraft';

test.use({ contextOptions: { reducedMotion: 'reduce' } });

test.describe('PitchCraft case study', () => {
  test('title, facts strip and stage headings render', async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'From a Kaggle capstone to a live baseball product',
    );
    await expect(page.locator('.facts-strip .fact')).toHaveCount(4);
    await expect(page.locator('.facts-strip')).toContainText('$0');
    await expect(page.locator('h2.stage-label')).toHaveCount(8);
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
