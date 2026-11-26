import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from '@playwright/test';

/**
 * Reads a PitchCraft copy file from docs/editorial/pitchcraft-2026-11-25/ and
 * returns the visible text blocks it defines, in order, so a spec can compare
 * the rendered page against the approved copy word for word.
 *
 * The page copy sits between the first `---` rule and the `## Card copy`
 * section. Square-bracket notes are implementation notes: a line that is only
 * a note is skipped, and a trailing note (`[closing statement]`) is dropped.
 */
// Playwright runs from the repository root.
const EDITORIAL = join(process.cwd(), 'docs', 'editorial', 'pitchcraft-2026-11-25');
const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

export interface CopyLink {
  text: string;
  href: string;
}

/** Whitespace collapsed; the ↗ marker dropped (the site renders it on every external link). */
export function normalize(text: string): string {
  return text.replace(/↗/g, '').replace(/\s+/g, ' ').trim();
}

export function readCopy(file: string): { blocks: string[]; links: CopyLink[] } {
  const raw = readFileSync(join(EDITORIAL, file), 'utf8').replace(/\r\n/g, '\n');
  const start = raw.indexOf('\n---\n') + 5;
  const cardCopy = raw.indexOf('\n## Card copy');
  const body = raw.slice(start, raw.lastIndexOf('\n---\n', cardCopy));

  const blocks: string[] = [];
  const links: CopyLink[] = [];
  const plain = (line: string) =>
    line.replace(LINK, (_, text: string, href: string) => {
      links.push({ text, href });
      return text;
    });

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    // A whole-line note: [Cover image: ...], [Figure 1: ...].
    if (/^\[[^\]]*\]$/.test(line) && !/\]\(/.test(line)) continue;

    let m: RegExpMatchArray | null;
    if ((m = line.match(/^## \[label: (.+)\]$/))) blocks.push(m[1]);
    else if ((m = line.match(/^#{1,2} (.+)$/))) blocks.push(m[1]);
    else if ((m = line.match(/^Eyebrow: (.+)$/))) blocks.push(m[1]);
    else if ((m = line.match(/^Caption: (.+)$/))) blocks.push(m[1]);
    else if ((m = line.match(/^> (.+?)(?: \[[^\]]+\])?$/))) blocks.push(m[1]);
    else if ((m = line.match(/^CTA: (.+)$/))) blocks.push(...plain(m[1]).split(' · '));
    else if ((m = line.match(/^- (.+)$/))) blocks.push(plain(m[1]));
    else blocks.push(plain(line));
  }
  return { blocks: blocks.map(normalize), links };
}

/**
 * The visible text blocks of a case page, in document order: hero eyebrow,
 * title, lead and facts line; chapter labels; body paragraphs; quotes; figure
 * captions inside the chapters; closing statement; CTA row; sources. The
 * cover caption and figure internals are left out (checked separately).
 */
export const PAGE_BLOCKS = [
  '.page-hero .eyebrow',
  '.page-hero h1',
  '.page-hero .case-lead',
  '.page-hero .case-facts',
  'article .stage-label',
  'article .about-prose > p',
  'article .about-prose > blockquote > p',
  'article .about-prose figcaption',
  'article .close > p',
  'article .cta-row a',
  'article h2.eyebrow',
  'article .case-sources-intro',
  'article .case-sources a',
].join(', ');

export async function pageBlocks(page: Page): Promise<string[]> {
  const texts = await page.locator(PAGE_BLOCKS).evaluateAll((els) => els.map((el) => el.textContent ?? ''));
  return texts.map(normalize);
}
