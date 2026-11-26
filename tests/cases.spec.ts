import { test, expect } from '@playwright/test';

/**
 * The four cases across the site (Unit G, 2026-11-25): cards on home and
 * /work, "More work" on each case, per-route metadata, and the removed
 * /work/pitchcraft route. Card copy: docs/editorial/pitchcraft-2026-11-25/
 * files 04 and 05.
 */

const CARDS = [
  {
    href: '/work/veflo-trace',
    meta: 'case · 01',
    title: 'From workflow software to AI-assisted operations',
  },
  {
    href: '/work/internal-platform',
    meta: 'case · 02',
    title: 'Designing product work beside an agentic build system',
  },
  {
    href: '/work/pitchcraft-v1-kaggle',
    meta: 'case · 03',
    title: 'Building a scouting product around verifiable claims',
    desc: 'Turning a personal idea into a baseball scouting product in seven days, with a deterministic agent pipeline and a fact-checking mechanism.',
    tags: 'Product discovery · Agent pipeline · July 2026',
  },
  {
    href: '/work/pitchcraft-v2-world-series',
    meta: 'case · 04',
    title: 'From a Kaggle capstone to a live baseball product',
    desc: 'Taking PitchCraft into production, evaluating a language model as its writer and redesigning the experience for the off-season.',
    tags: 'AI evaluation · Agentic build · Since Oct 2026',
  },
];
const CASE_ROUTES = CARDS.map((c) => c.href);
const ALL_ROUTES = ['/', '/about', '/work', ...CASE_ROUTES];

test.use({ contextOptions: { reducedMotion: 'reduce' } });

for (const route of ['/', '/work']) {
  test(`${route} shows the four cases in order 01 to 04`, async ({ page }) => {
    await page.goto(route);
    const cards = page.locator('.work-grid a.case');
    await expect(cards).toHaveCount(4);
    for (const [i, card] of CARDS.entries()) {
      const el = cards.nth(i);
      await expect(el).toHaveAttribute('href', card.href);
      await expect(el.locator('.case-meta')).toHaveText(card.meta);
      await expect(el.locator('h2, h3')).toHaveText(card.title);
      if (card.desc) await expect(el.locator('.desc')).toHaveText(card.desc);
      // The separators are markup between the tag spans; compare the tags themselves.
      if (card.tags) await expect(el.locator('.tags > span:not([aria-hidden])')).toHaveText(card.tags.split(' · '));
    }
  });

  test(`${route} lays the four cards out as two rows of two at 1280px`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(route);
    const boxes = await page.locator('.work-grid a.case').evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) };
      }),
    );
    const [a, b, c, d] = boxes;
    expect(a.y).toBe(b.y);
    expect(c.y).toBe(d.y);
    expect(c.y).toBeGreaterThan(a.y);
    expect(c.x).toBe(a.x);
    expect(d.x).toBe(b.x);
    expect(new Set(boxes.map((box) => box.w)).size).toBe(1); // all the same width
  });
}

test('/work at 390px stacks the four cards in one column', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/work');
  const xs = await page.locator('.work-grid a.case').evaluateAll((els) =>
    els.map((el) => Math.round(el.getBoundingClientRect().x)),
  );
  expect(new Set(xs).size).toBe(1);
});

for (const route of CASE_ROUTES) {
  test(`${route}: More work lists the other three cases, third card centred`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(route);
    const grid = page.locator('section.work .work-grid');
    const hrefs = await grid.locator('a.case').evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(hrefs).toEqual(CASE_ROUTES.filter((r) => r !== route));
    // No link on the page points back at the page itself.
    await expect(page.locator(`a[href="${route}"]`)).toHaveCount(0);
    // A grid of exactly three: the third card is wider and centred under the first two.
    const [a, b, c] = await grid.locator('a.case').evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, w: r.width };
      }),
    );
    const gridBox = (await grid.boundingBox())!;
    expect(c.w).toBeGreaterThan(a.w);
    expect(Math.abs(c.x + c.w / 2 - (gridBox.x + gridBox.width / 2))).toBeLessThanOrEqual(2);
    expect(b.x).toBeGreaterThan(a.x);
  });
}

test('veflo-trace labels its More work neighbours by name', async ({ page }) => {
  await page.goto('/work/veflo-trace');
  await expect(page.locator('section.work .case-meta')).toHaveText([
    'Internal platform · Since 2026',
    'PitchCraft v1 · Kaggle',
    'PitchCraft v2 · World Series',
  ]);
});

test('no page links to the removed /work/pitchcraft route', async ({ page }) => {
  for (const route of [...ALL_ROUTES, '/sitemap.xml']) {
    const res = await page.goto(route);
    expect(res!.status(), route).toBe(200);
    const html = await res!.text();
    expect(html, route).not.toMatch(/\/work\/pitchcraft(?![-\w])/);
  }
});

test('/work/pitchcraft is gone (404), with no redirect', async ({ request }) => {
  const res = await request.get('/work/pitchcraft', { maxRedirects: 0 });
  expect(res.status()).toBe(404);
});

test('the sitemap lists both PitchCraft cases', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const route of CASE_ROUTES) {
    expect(xml).toContain(`<loc>https://danielherdenez.com${route}</loc>`);
  }
});

for (const card of CARDS.slice(2)) {
  test(`${card.href} has its own title, description, canonical URL and share image`, async ({ page, request }) => {
    await page.goto(card.href);
    const url = `https://danielherdenez.com${card.href}`;
    await expect(page).toHaveTitle(`${card.title} — Daniel Herdenez`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', card.desc!);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', url);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', url);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${url}/og.png`);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', `${url}/og.png`);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    // The image itself is served from this site.
    const img = await request.get(`${card.href}/og.png`);
    expect(img.status()).toBe(200);
    expect(img.headers()['content-type']).toBe('image/png');
  });
}

test('every case puts the back link above the eyebrow', async ({ page }) => {
  for (const route of CASE_ROUTES) {
    await page.goto(route);
    const back = page.locator('.page-hero .back-link');
    await expect(back, route).toHaveCount(1);
    await expect(back).toHaveAttribute('href', '/work');
    const order = await back.evaluate((el) => el.nextElementSibling?.classList.contains('eyebrow'));
    expect(order, route).toBe(true);
    expect((await back.boundingBox())!.height, route).toBeGreaterThanOrEqual(44);
  }
});

test('the two PitchCraft cases link to each other', async ({ page }) => {
  await page.goto('/work/pitchcraft-v1-kaggle');
  await expect(page.locator('article .about-prose a[href="/work/pitchcraft-v2-world-series"]')).toHaveCount(1);
  await page.goto('/work/pitchcraft-v2-world-series');
  await expect(page.locator('article .about-prose a[href="/work/pitchcraft-v1-kaggle"]')).toHaveCount(1);
});
