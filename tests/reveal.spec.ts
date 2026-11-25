import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * "Visible for real": Playwright's toBeVisible() ignores opacity, which let
 * content hidden by the old Framer reveal (inline opacity: 0) pass. These
 * checks multiply opacity up the ancestor chain and require real dimensions.
 */
async function effectiveOpacity(locator: Locator): Promise<number> {
  return locator.evaluate((el) => {
    let value = 1;
    for (let node: Element | null = el; node; node = node.parentElement) {
      value *= Number(getComputedStyle(node).opacity);
    }
    return value;
  });
}

async function expectTrulyVisible(locator: Locator, label: string) {
  await expect(locator, label).toBeAttached();
  const box = await locator.boundingBox();
  expect(box?.width ?? 0, `${label} width`).toBeGreaterThan(0);
  expect(box?.height ?? 0, `${label} height`).toBeGreaterThan(0);
  expect(await effectiveOpacity(locator), `${label} opacity`).toBe(1);
}

/** Every revealed block on the page, fully opaque, without any scrolling. */
async function expectAllRevealsVisible(page: Page, route: string) {
  const reveals = page.locator('.reveal');
  expect(await reveals.count(), `${route} has reveal blocks`).toBeGreaterThan(0);
  for (const reveal of await reveals.all()) {
    expect(await effectiveOpacity(reveal), `${route} reveal opacity`).toBe(1);
    for (const child of await reveal.locator(':scope > *').all()) {
      expect(await effectiveOpacity(child), `${route} reveal child opacity`).toBe(1);
    }
  }
}

const ROUTES = ['/', '/about', '/work', '/work/veflo-trace', '/work/internal-platform', '/work/pitchcraft'];

test.describe('Reveal: content is visible by default', () => {
  test('PitchCraft article and cover are visible with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/work/pitchcraft');
    await expectTrulyVisible(page.locator('article'), 'article');
    await expectTrulyVisible(page.locator('.case-figure img').first(), 'cover');
    await expectTrulyVisible(page.getByRole('heading', { name: 'Still open', level: 2 }), 'last chapter');
    await expectTrulyVisible(page.getByRole('heading', { name: 'More work', level: 2 }), 'More work');
    await expectAllRevealsVisible(page, '/work/pitchcraft');
    await context.close();
  });

  test('every page renders its revealed blocks visible with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    for (const route of ROUTES) {
      await page.goto(route);
      await expectAllRevealsVisible(page, route);
    }
    await context.close();
  });

  test('print media shows the whole PitchCraft case', async ({ page }) => {
    await page.emulateMedia({ media: 'print', reducedMotion: 'no-preference' });
    await page.goto('/work/pitchcraft');
    await expectAllRevealsVisible(page, 'print /work/pitchcraft');
    await expectTrulyVisible(page.locator('.case-figure img').first(), 'print cover');
  });

  test('print media still shows content armed by an earlier scroll', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/work/pitchcraft');
    await page.locator('.theme-toggle').click(); // hydration
    await page.mouse.wheel(0, 200);
    await expect.poll(() => page.locator('.reveal.is-armed').count()).toBeGreaterThan(0);
    await page.emulateMedia({ media: 'print' });
    await expectAllRevealsVisible(page, 'print after scroll');
  });

  test('a fresh load with motion hides nothing before the reader scrolls', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const route of ROUTES) {
      await page.goto(route);
      await page.locator('.theme-toggle').click(); // hydration, without scrolling
      await expectAllRevealsVisible(page, route);
    }
  });
});

test.describe('Reveal: motion stays as enhancement', () => {
  test('scrolling arms blocks below the fold and plays them in', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.locator('.theme-toggle').click();
    // Scroll in small steps: a block arms only while it sits in the band
    // just below the viewport, so one short wheel step may arm nothing yet.
    await page.mouse.move(640, 400);
    const armedCount = page.locator('.reveal.is-armed');
    for (let i = 0; i < 12 && (await armedCount.count()) === 0; i++) {
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(150);
    }
    await expect(armedCount.first()).toBeAttached();
    // Pin the block by position: `.is-armed` would re-resolve to the next one.
    const index = await page.locator('.reveal').evaluateAll((els) =>
      els.findIndex((el) => el.classList.contains('is-armed')),
    );
    const armed = page.locator('.reveal').nth(index);
    await armed.scrollIntoViewIfNeeded();
    await expect.poll(() => armed.evaluate((el) => el.classList.contains('is-armed'))).toBe(false);
    await expect.poll(() => effectiveOpacity(page.locator('.reveal').first())).toBe(1);
    // Wherever the reader ends up, nothing is left hidden in view.
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await expect.poll(async () => {
      const visible = await page.locator('.reveal').evaluateAll((els) =>
        els.filter((el) => {
          const r = el.getBoundingClientRect();
          return r.bottom > 0 && r.top < window.innerHeight * 0.85;
        }).map((el) => getComputedStyle(el).opacity),
      );
      return visible.every((o) => o === '1');
    }).toBe(true);
  });

  test('reduced motion never arms a block', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('.theme-toggle').click();
    await page.mouse.wheel(0, 300);
    await page.mouse.wheel(0, 600);
    await expect(page.locator('.reveal.is-armed')).toHaveCount(0);
    await expectAllRevealsVisible(page, 'reduced motion /');
  });
});
