import { test, expect, type Page } from '@playwright/test';

const ROUTES = ['/', '/about', '/work', '/work/veflo-trace', '/work/internal-platform'];

// --- Contrast helpers (run in Node test context, not browser) ---
function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b]
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
): number {
  const [x, y] = [relativeLuminance(a), relativeLuminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function parseRgb(str: string): { r: number; g: number; b: number } {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) throw new Error(`Cannot parse color: ${str}`);
  return { r: +m[1], g: +m[2], b: +m[3] };
}

/**
 * Contrast of the first match of `selector` against its effective background —
 * the nearest ancestor that actually paints one, not just <body>.
 */
async function readContrast(page: Page, selector: string): Promise<number> {
  const colors = await page.locator(selector).first().evaluate((el) => {
    const transparent = (c: string) => c === 'transparent' || /rgba\(0,\s*0,\s*0,\s*0\)/.test(c);
    let node: HTMLElement | null = el as HTMLElement;
    let bg = 'rgb(255, 255, 255)';
    while (node) {
      const candidate = getComputedStyle(node).backgroundColor;
      if (!transparent(candidate)) {
        bg = candidate;
        break;
      }
      node = node.parentElement;
    }
    return { fg: getComputedStyle(el).color, bg };
  });
  return contrastRatio(parseRgb(colors.fg), parseRgb(colors.bg));
}

/** Wait for every CSS transition/animation on an element to finish. */
async function settle(locator: ReturnType<Page['locator']>): Promise<void> {
  await locator.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
}

/** Tab forward until the selector holds focus. Returns false if unreachable. */
async function tabTo(page: Page, selector: string, maxTabs = 15): Promise<boolean> {
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press('Tab');
    const focused = await page.locator(selector).first().evaluate(
      (el) => el === document.activeElement,
    );
    if (focused) return true;
  }
  return false;
}

// ============================================================
// Landmarks & skip link
// ============================================================
test.describe('Landmarks', () => {
  for (const route of ROUTES) {
    test(`${route} has exactly one <main id="main">`, async ({ page }) => {
      await page.goto(route);
      const main = page.locator('main#main');
      await expect(main).toHaveCount(1);
      await expect(main).toHaveAttribute('tabindex', '-1');
    });
  }

  test('skip link is the first tabbable element and targets #main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.locator('.skip-link');
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute('href', '#main');
  });

  test('skip link is off-canvas until focused, then visible', async ({ page }) => {
    await page.goto('/');
    const skip = page.locator('.skip-link');

    const hiddenBox = await skip.boundingBox();
    expect(hiddenBox, 'skip link should render but sit off-canvas').not.toBeNull();
    expect(hiddenBox!.y + hiddenBox!.height).toBeLessThanOrEqual(0);

    await page.keyboard.press('Tab');
    await settle(skip);
    const shownBox = await skip.boundingBox();
    expect(shownBox!.y).toBeGreaterThanOrEqual(0);
  });

  test('activating the skip link moves focus into main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('main#main')).toBeFocused();
  });
});

// ============================================================
// Focus visibility
// ============================================================
test.describe('Focus states', () => {
  test('theme toggle shows a focus ring on keyboard focus', async ({ page }) => {
    await page.goto('/');
    const reached = await tabTo(page, '.theme-toggle');
    expect(reached, 'theme toggle should be reachable by Tab').toBe(true);

    const outline = await page.locator('.theme-toggle').first().evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor };
    });
    expect(outline.style).not.toBe('none');
    expect(parseFloat(outline.width)).toBeGreaterThanOrEqual(2);
  });

  test('mobile menu toggle shows a focus ring on keyboard focus', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const reached = await tabTo(page, '.mobile-menu-toggle');
    expect(reached, 'mobile menu toggle should be reachable by Tab').toBe(true);

    const outline = await page.locator('.mobile-menu-toggle').evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: s.outlineWidth };
    });
    expect(outline.style).not.toBe('none');
    expect(parseFloat(outline.width)).toBeGreaterThanOrEqual(2);
  });

  test('neither toggle uses all: unset (which strips the outline)', async ({ page }) => {
    await page.goto('/');
    // all: unset would also wipe the border and border-radius these buttons rely on
    const toggle = await page.locator('.theme-toggle').first().evaluate((el) => {
      const s = getComputedStyle(el);
      return { border: s.borderTopWidth, radius: s.borderTopLeftRadius };
    });
    expect(parseFloat(toggle.border)).toBeGreaterThan(0);
    expect(parseFloat(toggle.radius)).toBeGreaterThan(0);
  });

  test('hero CTA links show a focus ring on keyboard focus', async ({ page }) => {
    await page.goto('/');
    const reached = await tabTo(page, '.hero-cta .btn-primary');
    expect(reached, 'hero CTA should be reachable by Tab').toBe(true);

    const outlineWidth = await page
      .locator('.hero-cta .btn-primary')
      .evaluate((el) => getComputedStyle(el).outlineWidth);
    expect(parseFloat(outlineWidth)).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================
// Reduced motion
// ============================================================
test.describe('prefers-reduced-motion', () => {
  test('hero mesh drift animations are disabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const animations = await page.locator('.hero-mesh').evaluate((el) => ({
      before: getComputedStyle(el, '::before').animationName,
      after: getComputedStyle(el, '::after').animationName,
    }));
    expect(animations.before).toBe('none');
    expect(animations.after).toBe('none');
  });

  test('hero mesh drift animations still run by default', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');

    const animations = await page.locator('.hero-mesh').evaluate((el) => ({
      before: getComputedStyle(el, '::before').animationName,
      after: getComputedStyle(el, '::after').animationName,
    }));
    expect(animations.before).toBe('drift1');
    expect(animations.after).toBe('drift2');
  });

  test('smooth scrolling is turned off', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(behavior).toBe('auto');
  });

  test('artifact hover lift is removed', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const artifact = page.locator('.artifact').first();
    await artifact.scrollIntoViewIfNeeded();
    await artifact.hover();
    await settle(artifact);
    const transform = await artifact.evaluate((el) => getComputedStyle(el).transform);
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transform);
  });

  // Regression: reduced motion used to strand the server-rendered opacity:0,
  // leaving every revealed section invisible instead of merely unanimated.
  test('revealed content is visible, not stranded at opacity 0', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // .case is itself the animated node; the grids are wrapped by <Reveal>,
    // so the opacity lives on their parent.
    const targets: Array<[string, 'self' | 'parent']> = [
      ['.case', 'self'],
      ['.proof-grid', 'parent'],
      ['.writing-grid', 'parent'],
    ];

    for (const [selector, where] of targets) {
      const el = page.locator(selector).first();
      await el.scrollIntoViewIfNeeded();
      await expect
        .poll(
          () =>
            el.evaluate((node, w) => {
              const target = w === 'parent' ? node.parentElement! : node;
              return getComputedStyle(target).opacity;
            }, where),
          { message: `${selector} should reach full opacity under reduced motion` },
        )
        .toBe('1');
    }
  });

  test('case cards keep full opacity with motion enabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const card = page.locator('.case').first();
    await card.scrollIntoViewIfNeeded();
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  });
});

// ============================================================
// Text contrast (WCAG AA, 4.5:1 for body text)
// ============================================================
test.describe('Contrast', () => {
  for (const theme of ['dark', 'light'] as const) {
    for (const [label, selector] of [
      ['footer copyright', '.foot-bottom'],
      ['nav links', '.nav-links a'],
      ['case card tags', '.tags'],
    ] as const) {
      test(`${label} meet AA in ${theme} mode`, async ({ page }) => {
        await page.goto('/');
        if (theme === 'light') {
          await page.locator('.theme-toggle').first().click();
          await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        }

        // Theme switching transitions colour over --dur-fast, so poll rather
        // than reading a value that may still be mid-transition.
        await expect
          .poll(() => readContrast(page, selector), {
            message: `${selector} contrast in ${theme} mode`,
          })
          .toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
