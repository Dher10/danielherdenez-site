import { test, expect, type Page } from '@playwright/test';

/**
 * Inline links in running prose carry the sage link color and a persistent
 * underline at rest, in both themes (audit E08). Classed links (buttons,
 * ghost links) are excluded: they have their own treatment.
 */
const ACCENT = { dark: 'rgb(123, 159, 146)', light: 'rgb(74, 107, 95)' };
const SELECTOR = ':is(.about-prose, .about-body, .case-facts, .case-sources) a:not([class])';
const ROUTES = [
  '/about',
  '/work/pitchcraft-v1-kaggle',
  '/work/pitchcraft-v2-world-series',
  '/work/veflo-trace',
  '/work/internal-platform',
  '/',
];

test.use({ contextOptions: { reducedMotion: 'reduce' } });

async function setTheme(page: Page, theme: 'dark' | 'light') {
  await page.addInitScript((t) => localStorage.setItem('dh-theme', t), theme);
}

for (const theme of ['dark', 'light'] as const) {
  test(`About links to both PitchCraft cases with underlined sage links (${theme})`, async ({ page }) => {
    await setTheme(page, theme);
    await page.goto('/about');
    for (const [name, href] of [
      ['the Kaggle capstone', '/work/pitchcraft-v1-kaggle'],
      ['the live product', '/work/pitchcraft-v2-world-series'],
    ]) {
      const link = page.getByRole('link', { name, exact: true });
      await expect(link).toHaveAttribute('href', href);
      const style = await link.evaluate((el) => {
        const s = getComputedStyle(el);
        return { color: s.color, line: s.textDecorationLine };
      });
      expect(style.color).toBe(ACCENT[theme]);
      expect(style.line).toContain('underline');
    }
  });

  test(`every inline prose link uses the same rule (${theme})`, async ({ page }) => {
    await setTheme(page, theme);
    let checked = 0;
    for (const route of ROUTES) {
      await page.goto(route);
      const styles = await page.locator(SELECTOR).evaluateAll((els) =>
        els.map((el) => {
          const s = getComputedStyle(el);
          return { text: el.textContent, color: s.color, line: s.textDecorationLine };
        }),
      );
      for (const s of styles) {
        expect(s.color, `${route}: ${s.text}`).toBe(ACCENT[theme]);
        expect(s.line, `${route}: ${s.text}`).toContain('underline');
      }
      checked += styles.length;
    }
    // About's two case links; per PitchCraft case, its two facts-line links,
    // its cross-link and its sources (3 on case 03, 10 on case 04).
    expect(checked).toBeGreaterThanOrEqual(2 + (2 + 1 + 3) + (2 + 1 + 10));
  });
}
