import { test, expect } from '@playwright/test';

const URL = 'https://danielherdenez-site.vercel.app';

// --- Color helpers (run in Node test context, not browser) ---
function parseRgb(str: string): { r: number; g: number; b: number } | null {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return m ? { r: +m[1], g: +m[2], b: +m[3] } : null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function colorsMatch(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  tol = 10,
): boolean {
  return (
    Math.abs(a.r - b.r) <= tol &&
    Math.abs(a.g - b.g) <= tol &&
    Math.abs(a.b - b.b) <= tol
  );
}

// ============================================================
// SECTION 1 — Nav
// ============================================================
test.describe('Section 1 — Nav', () => {
  test('nav element exists and is position: sticky', async ({ page }) => {
    await page.goto(URL);
    const nav = page.locator('.nav').first();
    await expect(nav).toBeVisible();
    const position = await nav.evaluate(el => getComputedStyle(el).position);
    expect(position).toBe('sticky');
  });

  test('monogram "d" is visible', async ({ page }) => {
    await page.goto(URL);
    const monogram = page.locator('.monogram').first();
    await expect(monogram).toBeVisible();
    await expect(monogram).toContainText('d');
  });

  test('nav links Work, About, Writing & Artifacts visible at 1280px', async ({ page }) => {
    await page.goto(URL);
    const navLinks = page.locator('.nav-links');
    await expect(navLinks.getByText('Work')).toBeVisible();
    await expect(navLinks.getByText('About')).toBeVisible();
    await expect(navLinks.getByText('Writing & Artifacts')).toBeVisible();
  });

  test('theme toggle button exists', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('.theme-toggle').first()).toBeVisible();
  });

  test('nav gets class .scrolled after scrolling 50px', async ({ page }) => {
    await page.goto(URL);
    await page.evaluate(() => window.scrollTo({ top: 50, behavior: 'instant' }));
    await page.waitForTimeout(350);
    await expect(page.locator('.nav').first()).toHaveClass(/scrolled/);
  });
});

// ============================================================
// SECTION 2 — Hero
// ============================================================
test.describe('Section 2 — Hero', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('eyebrow text "available · summer 2026" is visible', async ({ page }) => {
    await expect(page.locator('.eyebrow')).toContainText('available · summer 2026');
  });

  test('h1 contains "Product Manager" and "shipped products"', async ({ page }) => {
    const h1 = page.locator('.hero h1');
    await expect(h1).toContainText('Product Manager');
    await expect(h1).toContainText('shipped products');
  });

  test('.em span inside h1 has font-style italic', async ({ page }) => {
    const em = page.locator('.hero h1 .em');
    await expect(em).toBeVisible();
    const fontStyle = await em.evaluate(el => getComputedStyle(el).fontStyle);
    expect(fontStyle).toBe('italic');
  });

  test('sub text contains "MindTechSourcing"', async ({ page }) => {
    await expect(page.locator('.hero .sub')).toContainText('MindTechSourcing');
  });

  test('CTA buttons "Let\'s talk", "LinkedIn", "GitHub" are visible', async ({ page }) => {
    const cta = page.locator('.hero-cta');
    await expect(cta.getByText(/let's talk/i)).toBeVisible();
    await expect(cta.getByText(/linkedin/i)).toBeVisible();
    await expect(cta.getByText(/github/i)).toBeVisible();
  });

  test('hero mesh element exists', async ({ page }) => {
    await expect(page.locator('.hero-mesh')).toBeAttached();
  });
});

// ============================================================
// SECTION 3 — Proof tiles
// ============================================================
test.describe('Section 3 — Proof tiles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('3 proof tiles exist with labels CURRENT, FOCUS, BACKGROUND', async ({ page }) => {
    const tiles = page.locator('.proof-tile');
    await expect(tiles).toHaveCount(3);
    await expect(tiles.nth(0).locator('.label')).toContainText('CURRENT');
    await expect(tiles.nth(1).locator('.label')).toContainText('FOCUS');
    await expect(tiles.nth(2).locator('.label')).toContainText('BACKGROUND');
  });

  test('CURRENT value contains "MindTechSourcing"', async ({ page }) => {
    await expect(page.locator('.proof-tile').nth(0).locator('.value')).toContainText('MindTechSourcing');
  });

  test('FOCUS value contains "native AI"', async ({ page }) => {
    await expect(page.locator('.proof-tile').nth(1).locator('.value')).toContainText('native AI');
  });

  test('BACKGROUND value contains "engineering"', async ({ page }) => {
    await expect(page.locator('.proof-tile').nth(2).locator('.value')).toContainText('engineering');
  });
});

// ============================================================
// SECTION 4 — Work
// ============================================================
test.describe('Section 4 — Work', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('section with id="work" exists', async ({ page }) => {
    await expect(page.locator('#work')).toBeAttached();
  });

  test('3 case cards exist', async ({ page }) => {
    await expect(page.locator('.case')).toHaveCount(3);
  });

  test('card 1 title contains "workflow tool"', async ({ page }) => {
    await expect(page.locator('.case').nth(0).locator('h3')).toContainText('workflow tool');
  });

  test('card 2 title contains "governance"', async ({ page }) => {
    await expect(page.locator('.case').nth(1).locator('h3')).toContainText('governance');
  });

  test('card 3 title contains "AI to do product work"', async ({ page }) => {
    await expect(page.locator('.case').nth(2).locator('h3')).toContainText('AI to do product work');
  });

  test('cards 1 and 2 are side by side (same row) at 1280px', async ({ page }) => {
    // Scroll work into view and allow reveal + stagger animations to settle
    await page.locator('#work').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const cases = page.locator('.case');
    const box1 = await cases.nth(0).boundingBox();
    const box2 = await cases.nth(1).boundingBox();
    expect(box1).not.toBeNull();
    expect(box2).not.toBeNull();
    // Same row: Y positions within 50px (generous to absorb staggered translateY animations)
    expect(Math.abs(box1!.y - box2!.y)).toBeLessThan(50);
    // Side by side: card 2 starts to the right of card 1
    expect(box2!.x).toBeGreaterThan(box1!.x + box1!.width * 0.5);
  });
});

// ============================================================
// SECTION 5 — About
// ============================================================
test.describe('Section 5 — About', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('section with id="about" exists', async ({ page }) => {
    await expect(page.locator('#about')).toBeAttached();
  });

  test('"How I got here" is visible', async ({ page }) => {
    await expect(page.locator('#about h2')).toContainText('How I got here');
  });

  test('"MindTechSourcing" appears in bold', async ({ page }) => {
    const bold = page.locator('#about strong').filter({ hasText: 'MindTechSourcing' });
    await expect(bold).toBeVisible();
    const fontWeight = await bold.evaluate(el => parseInt(getComputedStyle(el).fontWeight, 10));
    expect(fontWeight).toBeGreaterThanOrEqual(500);
  });

  test('"More about me" link exists', async ({ page }) => {
    await expect(page.locator('#about').getByText(/more about me/i)).toBeVisible();
  });
});

// ============================================================
// SECTION 6 — Writing
// ============================================================
test.describe('Section 6 — Writing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('section with id="writing" exists', async ({ page }) => {
    await expect(page.locator('#writing')).toBeAttached();
  });

  test('"PM-AI-Prompts" card is visible', async ({ page }) => {
    await expect(page.locator('#writing').getByText('PM-AI-Prompts')).toBeVisible();
  });

  test('"Essays coming soon" card is visible', async ({ page }) => {
    await expect(page.locator('#writing').getByText('Essays coming soon')).toBeVisible();
  });

  test('"View on GitHub" link exists', async ({ page }) => {
    await expect(page.locator('#writing').getByText(/view on github/i)).toBeVisible();
  });
});

// ============================================================
// SECTION 7 — Footer
// ============================================================
test.describe('Section 7 — Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('footer exists with monogram "d"', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('.foot-mark')).toContainText('d');
  });

  test('footer has Work, About, Writing & Artifacts links', async ({ page }) => {
    const footCenter = page.locator('.foot-center');
    await expect(footCenter.getByText('Work')).toBeVisible();
    await expect(footCenter.getByText('About')).toBeVisible();
    await expect(footCenter.getByText('Writing & Artifacts')).toBeVisible();
  });

  test('footer social icons: email, LinkedIn, GitHub links exist', async ({ page }) => {
    const socials = page.locator('.foot-socials');
    await expect(socials.locator('[aria-label="Email"]')).toBeAttached();
    await expect(socials.locator('[aria-label="LinkedIn"]')).toBeAttached();
    await expect(socials.locator('[aria-label="GitHub"]')).toBeAttached();
  });

  test('copyright "© 2026 Daniel Herdenez" is visible', async ({ page }) => {
    await expect(page.locator('.foot-bottom')).toContainText('© 2026 Daniel Herdenez');
  });
});

// ============================================================
// SECTION 8 — Theme toggle
// ============================================================
test.describe('Section 8 — Theme toggle', () => {
  test('clicking theme toggle adds data-theme="light" to html', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(URL);
    // Ensure we start from dark (no data-theme attribute)
    await page.evaluate(() => {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('dh-theme');
    });
    await page.locator('.theme-toggle').first().click();
    await page.waitForTimeout(250);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('clicking theme toggle again removes data-theme="light"', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(URL);
    await page.evaluate(() => {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('dh-theme');
    });
    const toggle = page.locator('.theme-toggle').first();
    await toggle.click();
    await page.waitForTimeout(250);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await toggle.click();
    await page.waitForTimeout(250);
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'light');
  });
});

// ============================================================
// SECTION 9 — Typography
// ============================================================
test.describe('Section 9 — Typography', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('h1 in hero has font-family containing "Instrument"', async ({ page }) => {
    const fontFamily = await page.locator('.hero h1').evaluate(
      el => getComputedStyle(el).fontFamily,
    );
    expect(fontFamily.toLowerCase()).toContain('instrument');
  });

  test('nav links have font-family containing "Geist Mono" or monospace', async ({ page }) => {
    const fontFamily = await page.locator('.nav-links a').first().evaluate(
      el => getComputedStyle(el).fontFamily,
    );
    const lower = fontFamily.toLowerCase();
    expect(lower.includes('geistmono') || lower.includes('geist mono') || lower.includes('monospace')).toBe(true);
  });
});

// ============================================================
// SECTION 10 — Colors (spot check)
// ============================================================
test.describe('Section 10 — Colors', () => {
  test('body background is approximately #0E0E0F in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(URL);
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const actual = parseRgb(bg);
    const expected = hexToRgb('#0E0E0F');
    expect(actual, `Expected rgb() string, got: ${bg}`).not.toBeNull();
    expect(
      colorsMatch(actual!, expected, 10),
      `Background ${bg} not close to #0E0E0F (rgb ${expected.r},${expected.g},${expected.b})`,
    ).toBe(true);
  });

  test('.em span color is approximately #7B9F92 in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(URL);
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
    const color = await page.locator('.hero h1 .em').evaluate(
      el => getComputedStyle(el).color,
    );
    const actual = parseRgb(color);
    const expected = hexToRgb('#7B9F92');
    expect(actual, `Expected rgb() string, got: ${color}`).not.toBeNull();
    expect(
      colorsMatch(actual!, expected, 10),
      `.em color ${color} not close to #7B9F92 (rgb ${expected.r},${expected.g},${expected.b})`,
    ).toBe(true);
  });
});
