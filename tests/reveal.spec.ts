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

/**
 * Scroll in small wheel steps until a block arms. A block arms only while it
 * sits in the band just below the viewport, so one step may arm nothing.
 */
async function scrollUntilArmed(page: Page) {
  await page.mouse.move(640, 400);
  const armed = page.locator('.reveal.is-armed');
  for (let i = 0; i < 20 && (await armed.count()) === 0; i++) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(150);
  }
  await expect(armed.first()).toBeAttached();
}

const ROUTES = ['/', '/about', '/work', '/work/veflo-trace', '/work/internal-platform', '/work/pitchcraft-v1-kaggle', '/work/pitchcraft-v2-world-series'];

test.describe('Reveal: content is visible by default', () => {
  for (const [route, lastChapter] of [
    ['/work/pitchcraft-v1-kaggle', 'The first version'],
    ['/work/pitchcraft-v2-world-series', "What's next"],
  ]) {
    test(`${route} article and cover are visible with JavaScript disabled`, async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(route);
      await expectTrulyVisible(page.locator('article'), 'article');
      await expectTrulyVisible(page.locator('.case-figure img').first(), 'cover');
      await expectTrulyVisible(page.getByRole('heading', { name: lastChapter, level: 2 }), 'last chapter');
      await expectTrulyVisible(page.getByRole('heading', { name: 'More work', level: 2 }), 'More work');
      await expectAllRevealsVisible(page, route);
      await context.close();
    });
  }

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
    await page.goto('/work/pitchcraft-v2-world-series');
    await expectAllRevealsVisible(page, 'print /work/pitchcraft-v2-world-series');
    await expectTrulyVisible(page.locator('.case-figure img').first(), 'print cover');
  });

  test('print media still shows content armed by an earlier scroll', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/work/pitchcraft-v2-world-series');
    await page.locator('.theme-toggle').click(); // hydration
    await scrollUntilArmed(page);
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
    await scrollUntilArmed(page);
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

  test('a block resting in the bottom tenth of the viewport is not left hidden', async ({ page }) => {
    // Codex's repro: an armed About chapter stopped with its top at ~y 817 of 900
    // stayed at opacity 0, because play waited for it to be 10% inside.
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/about');
    await page.locator('.theme-toggle').click();
    await page.mouse.move(640, 400);
    const target = page.locator('.reveal').nth(2);
    // Step until the block arms, then stop it just inside the bottom edge.
    for (let i = 0; i < 40; i++) {
      if (await target.evaluate((el) => el.classList.contains('is-armed'))) break;
      await page.mouse.wheel(0, 40);
      await page.waitForTimeout(60);
    }
    await target.evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - window.innerHeight * 0.92, behavior: 'instant' });
    });
    await expect.poll(() => effectiveOpacity(target), { timeout: 2000 }).toBe(1);
  });

  test('an armed block becomes visible on a timeout even if it never enters', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.locator('.theme-toggle').click();
    await scrollUntilArmed(page);
    await expect(page.locator('.reveal.is-armed')).toHaveCount(0, { timeout: 3000 });
    // Allow the fade that the failsafe starts to finish.
    await expect(async () => expectAllRevealsVisible(page, 'after failsafe /')).toPass({ timeout: 2000 });
  });

  test('a block the reader jumped past is not hidden again on the way back', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/about');
    await page.locator('.theme-toggle').click();
    await page.mouse.move(640, 400);
    await page.mouse.wheel(0, 40); // the first scroll enables arming
    await page.waitForTimeout(100);
    const target = page.locator('.reveal').nth(2);
    const place = (fromTop: number) =>
      target.evaluate((el, f) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top - f * window.innerHeight, behavior: 'instant' });
      }, fromTop);
    const frames = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await place(1.1); // just below the viewport: armed
    await frames();
    expect(await target.evaluate((el) => el.classList.contains('is-armed')), 'armed first').toBe(true);
    // One jump that carries the whole block above the viewport.
    await target.evaluate((el) => {
      const r = el.getBoundingClientRect();
      window.scrollTo({ top: r.bottom + window.scrollY + 50, behavior: 'instant' });
    });
    await frames();
    await place(1.1); // back below the viewport after the reader went past it
    await frames();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await frames();
    expect(await target.evaluate((el) => el.classList.contains('is-armed')), 'still armed').toBe(false);
    // It may still be finishing its 700ms fade, well inside the failsafe.
    await expect.poll(() => effectiveOpacity(target), { timeout: 1000 }).toBe(1);
  });

  for (const viewport of [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'desktop', width: 1280, height: 900 },
  ]) {
    test(`fast scroll to the bottom of /about and back leaves every chapter visible (${viewport.name})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto('/about');
      await page.locator('.theme-toggle').click();
      await page.mouse.move(viewport.width / 2, viewport.height / 2);
      // Fast wheel steps, then instant jumps larger than the viewport (which
      // can carry a block past the viewport between two frames), down to the
      // bottom and back to the top.
      for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 300);
      await page.evaluate(async () => {
        const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));
        const step = Math.round(window.innerHeight * 1.3);
        while (window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 2) {
          window.scrollBy({ top: step, behavior: 'instant' });
          await frame();
        }
        while (window.scrollY > 0) {
          window.scrollBy({ top: -step, behavior: 'instant' });
          await frame();
        }
      });
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      // Nothing the reader has already passed may be hidden.
      expect(
        await page.locator('.reveal.is-armed').count(),
        'blocks re-hidden after the reader passed them',
      ).toBe(0);
      // Every chapter heading the page has, read from where the reader stands
      // and once more after scrolling each one into view.
      const chapters = page.locator('.reveal h2, .reveal h3');
      expect(await chapters.count()).toBeGreaterThan(0);
      await expect.poll(async () => {
        const values = await page.locator('.reveal').evaluateAll((els) =>
          els.map((el) => {
            let value = 1;
            for (let node: Element | null = el; node; node = node.parentElement) {
              value *= Number(getComputedStyle(node).opacity);
            }
            for (const child of Array.from(el.children)) value = Math.min(value, Number(getComputedStyle(child).opacity));
            return value;
          }),
        );
        return values.every((v) => v === 1);
      }, { timeout: 3000 }).toBe(true);
      for (const chapter of await chapters.all()) {
        await chapter.scrollIntoViewIfNeeded();
        await expect.poll(() => effectiveOpacity(chapter), { timeout: 2000 }).toBe(1);
      }
    });
  }

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
