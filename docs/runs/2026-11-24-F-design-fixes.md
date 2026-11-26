# Unit F · Design and UX fixes · 24 November 2026

Fixes from the Unit E audit (`docs/audits/2026-11-24-design-audit.md`). The scope was decided by Daniel:

- every top-10 finding except E02 (the live 404 is expected until the merge; now backlog G);
- every medium finding (E11, E13, E14);
- E12 (case 03 card), which the audit rates low but Daniel named;
- lows go to the backlog, not fixed.

No new colors, fonts or dependencies, and no copy changes except the approved facts line.

This unit was not backlog item F (CI runner). It closes backlog C, the facts line of B and the `Reveal` part of D. See the note in `docs/BACKLOG.md`.

## Captures

- **Before:** `C:\Dev\audits\site-unit-f\before\`, taken at `a3c9593` (production build, `next start`).
- **After:** `C:\Dev\audits\site-unit-f\after\`, taken at this unit's code (production build).
- **Same names in both folders:**
  - `{home,about,work,veflo,internal,pitchcraft}-{390,1280}-{dark,light}.png`, full page, at 390×844 (mobile emulation) and 1280×900;
  - `pitchcraft-{390,1280}-{dark,light}-nav-over-cover.png`, the scrolled bar over the cover;
  - `pitchcraft-1280-dark-no-js.png` and `home-1280-dark-no-js.png`, with JavaScript disabled;
  - `pitchcraft-1280-dark-print.png`, print media on a fresh load.
- **Known artifact in the before set:** the capture script returned to the top with a smooth scroll (`html { scroll-behavior: smooth }`). In some before full-page captures the sticky bar therefore appears partway down the page. The after set uses instant scrolling. The artifact does not affect the findings shown.

## Findings and changes

| Finding | Change | Before → after captures |
|---|---|---|
| **E01** Reveal hides content (high) | `Reveal` no longer uses Framer. The server renders content visible, and nothing is hidden until the reader scrolls. After a scroll, a block still below the viewport is armed (`.is-armed`) and fades up when it enters (`.is-playing`). The hidden state is CSS under `@media screen and (prefers-reduced-motion: no-preference)`, so no-JS, print, crawlers and reduced motion never hide anything. The home card stagger uses the same mechanism (`<Reveal stagger>`); `case-card.tsx` lost its `variants` prop. | `pitchcraft-1280-dark-no-js`, `home-1280-dark-no-js`, `pitchcraft-1280-dark-print` (blank body before, full article after) |
| **E03** Mobile cover unreadable | Art direction with `getImageProps` and `<picture>`. Below 768px the cover is `pitchcraft-game5-cover-phone.webp` (750×1612): a crop of the after phone capture from y=280. It drops the app header and off-season banner and keeps the score, the notable reasons and both final lines, so the existing alt text still holds. From 768px it uses the desktop capture. Only the selected source downloads, and each `<source>` has its own width and height. The cover sits in `.prose-wide` (52rem). | `pitchcraft-390-{dark,light}` |
| **E04** Facts strip | `FactsStrip` and its CSS removed. One line under the lead: "Written at v2.2.0 · November 2026 · Open PitchCraft ↗ · GitHub ↗", same links, new tab. Mono 13px, `--fg-2`; the links never break internally. No other copy changed. | `pitchcraft-{390,1280}-{dark,light}` |
| **E05** Inner-page top spacing | `.page-hero` top padding is `--space-12` / `--space-20` (≥768) / `--space-24` (≥1024), down from `clamp(88px, 14vh, 152px)`. It is shared by About, Work and the three cases, which start at the same height (tested). `/work` has no second gap: `.page-hero + .work { padding-top: 0 }`. | `about-*`, `work-*`, `veflo-*`, `internal-*`, `pitchcraft-*` |
| **E06** Before/after uneven | New `pitchcraft-game5-before-crop.webp` (375×946 at 1×, from y=322 of the original). It is paired with the unchanged 750×1892 after capture at 2×, so both are 946 CSS px tall at the same scale. The before crop still opens on the game list and ends on the second starter's stats, so both alt texts still hold. A tighter 700 px window would have cut the second starter from both images and needed new alt text. Side by side from 768px, stacked below. Originals kept. | `pitchcraft-{390,1280}-*` |
| **E07** Nav show-through | Scrolled bar: 95% mix of `--bg-0` (was 80%) and blur 20px (was 14px), same hairline. | `pitchcraft-{390,1280}-{dark,light}-nav-over-cover` |
| **E08** About link | Inline prose links (`.about-prose`, `.about-body`, `.case-facts`, `.case-sources`, unclassed `<a>`): `--accent-fg`, a persistent 1px underline at 0.22em offset, `--accent-hover` on hover. This covers About's "The case study", the facts-line links and the PitchCraft source links. | `about-{390,1280}-*` |
| **E09** Chapter labels | On desktop the labels start at one shared left edge, `--space-12` past the prose column, instead of right-aligned at the far edge. A chapter that opens on a pull quote centres its label on the quote's first line. On mobile the label sits on the prose's left edge, directly above its block. | `about-1280-*`, `veflo-1280-*`, `pitchcraft-1280-*`, and the 390 versions |
| **E10** Eval chart contrast | Unmarked units are outlined squares (transparent, 2px `--fg-2`). Marked units are filled `--accent-fg` circles, or pills for the report units. The states now differ in shape, not only color. The legend matches, and the ARIA labels are unchanged. | `pitchcraft-*` |
| **E11** Floating "← Work" | It moved above the eyebrow on all three cases, with a 44px hit area. The separate CTA row after the title is gone. | `veflo-*`, `internal-*`, `pitchcraft-*` |
| **E12** Case 03 card (low, in scope) | Back to the original spec, `grid-column: 3 / span 8`. DESIGN.md deviation 3 is resolved. | `home-1280-*`, `work-1280-*` |
| **E13** Dense case 03 middle | **Layout part done:** the pipeline is sized by its figure (container query): stacked cards under 30rem, one row per step from 30rem. Five columns no longer fit the 42rem column. **Copy part left open** (backlog B): moving the release decision, separating the three measures, chart placement next to its denominators, descriptive headings. These are copy changes and need Daniel's approval. | `pitchcraft-1280-*` |
| **E14** Long desktop lines | Narrative prose and the chapter column use `.prose-narrow` (42rem) instead of 52rem. The longest measured line is now 76–79 characters at 1280 and 1440 px (the audit measured 87–96). Wide screenshots keep 52rem via `.prose-wide`. | `about-1280-*`, `veflo-1280-*`, `internal-1280-*`, `pitchcraft-1280-*` |
| E02, E15–E22 | Not fixed, by scope: backlog G (post-merge production check) and H–O (lows). | — |

## Files

- `src/components/shared/reveal.tsx`, `motion-provider.tsx`, `case-card.tsx`, `src/components/sections/work.tsx` (reveal).
- `src/app/work/pitchcraft/page.tsx` (facts line, cover, before/after, back link), plus `veflo-trace/page.tsx` and `internal-platform/page.tsx` (back link).
- `src/components/shared/facts-strip.tsx` (deleted).
- `src/app/globals.css`.
- `public/work/pitchcraft/pitchcraft-game5-cover-phone.webp` and `pitchcraft-game5-before-crop.webp` (new; generated with the `sharp` that ships with Next, no new dependency).
- Tests:
  - `tests/reveal.spec.ts` (new);
  - `tests/inline-links.spec.ts` (new);
  - `tests/pitchcraft.spec.ts` (facts line, cover, before/after, back link, eval shapes);
  - `tests/audit-regressions.spec.ts` (shared top spacing at 390 and 1280, the /work gap, nav opacity in both themes).
- `DESIGN.md`: deviations 3 (resolved), 5 (nav) and 6 (reveal); section 7 revised; new section 8 for inner pages.
- `docs/BACKLOG.md`.

## Verification

- `npx tsc --noEmit`: exit 0 · `npm run lint`: exit 0 · `npm run build`: exit 0.
- Playwright: **112 passed** (91 before this unit), against `next start` of the production build on the default port 3000.
- Visual check of the after captures in both themes at 390 and 1280.

### Test failures along the way

- **The previous session's run died.** The `next dev` server crashed with a native Node stack trace during a Playwright run. That is the server dying, not a test result. From then on the suite ran against `next start` of a fresh build.
- **The new reveal tests failed twice in their first form.** Both failures were in the tests, not in the product:
  - `.case-figure img` matched three images, so strict mode rejected it.
  - One 100–200 px wheel step arms nothing when the next block is beyond the arm band. A trace showed the arm and play cycle working.
  - The `.reveal.is-armed` locator re-resolved to the next block once the first one played.

  The fixes: `.first()`, a stepped-scroll helper, and pinning the block by index.
- **Three of the other new tests failed once.**
  - The spacing test compared the first child's box (a 44 px back link against an eyebrow). It now compares the hero prose block.
  - The nav test read the background mid-transition. It now polls.
  - The eval test caught a real issue: Chromium rounds a 1.5 px border down to 1 px. The outline is now 2 px.

  No test that existed before this unit failed.

### CI

- **Run [45522615321](https://github.com/Dher10/danielherdenez-site/actions/runs/45522615321) on `635489d`: failed.** Guard and hook tests: 817 passed. Playwright: 109 passed, 3 failed, all on `/work/pitchcraft` with JavaScript disabled:
  - `serves Article JSON-LD without JavaScript` (pre-existing test, first failure);
  - the two new no-JS reveal tests.

  Each hit the 30 s timeout in `page.goto`: the page rendered and the cover had started painting, but `load` never fired. Without JavaScript, Chromium also disables lazy-loading, so the load event waits for every image on the page.
- **Not reproduced locally.** A cold image cache, single and three concurrent no-JS loads all fired `load` in under 0.4 s.
- **A real defect turned up in the trace.** The desktop `<source>` had no `sizes`, so the browser assumed 100vw and requested the 1920 w rendition for an 832 px slot. Fixed: each `<source>` carries its own `sizes`, and the cover test asserts at most 1080 w at 1280 px. This is the only image request that changed size on that path, so it is the likely cause, but it is not confirmed.
- **Run [45523715990](https://github.com/Dher10/danielherdenez-site/actions/runs/45523715990) on `1330b27`: passed.** Guard and hook tests: 817 passed. Playwright: **112 passed**, including the three that timed out before. This is consistent with the oversized cover request as the cause, but one green run does not prove it. If the no-JS tests time out again in CI, treat it as an open issue.

## Left open

- **Backlog B (E13 copy)** needs Daniel's decision on copy.
- **Backlog G:** after merge, verify `/work/pitchcraft` and its share image in production.
- **Backlog H–O:** the low findings.
- **A stale `next start -p 3100`** from an earlier session was serving an old build at the start of this unit. It is no longer running.

## Round 2 · Codex verification fixes

Codex's independent check (`docs/runs/2026-11-24-F-codex-verify.md`, FAIL) found three problems. All three are fixed.

### 1. Reveal could leave content hidden (E01, regression)

Two root causes, both reproduced with a failing test before the fix:

- **Bottom 10% of the viewport.** Play waited for an armed block to be 10% inside the bottom edge (`rootMargin: 0px 0px -10% 0px`). A block that stopped in that band was on screen at opacity 0. This is Codex's repro (top at y≈817 of 900).
- **Jumped past.** A fast scroll could carry an armed block from below the viewport to above it between two observer samples. The play observer never saw it intersect, so it stayed armed. A jump back up could also arm a block the reader had already passed. Both explain the blank chapters in Codex's scroll-and-return captures.

The fix, in `reveal.tsx`, drops the observers. On each scroll or resize frame, the component reads the block's live position:

- an armed block plays as soon as its top is above the bottom edge, including when it is already above the viewport;
- a block that is in view, passed, or inside anything the reader has already had on screen is never armed;
- an armed block plays after 1.2 s whatever happens (failsafe).

The CSS is unchanged: no JS, print and reduced motion still never hide anything. A block now starts its fade as soon as any part enters, not at 10% in. `DESIGN.md` section "Reveal-on-scroll" still lists the old `-10%` margin from the original spec. It is outside this round's file scope, so it was left as is.

### 2. Print omitted the before/after images

Both comparison images were lazy, so a fresh print never loaded them. They now use `loading="eager"`. The cover was already eager, so every image on the case page loads without scrolling.

### 3. "Before" alt text

The crop no longer shows a game list. Daniel approved the change. The alt now reads "The old daily view on a phone: a matchup headline and the two starters' season stats." No other copy changed.

### Tests added

- `tests/reveal.spec.ts`:
  - a block resting in the bottom tenth of the viewport becomes visible (failed before the fix);
  - an armed block becomes visible on the failsafe timeout (failed before the fix);
  - a block the reader jumped past is not hidden again on the way back (failed before the fix);
  - fast scroll of `/about` to the bottom and back, at 390×844 and 1280×900: nothing is left armed, and every block and chapter heading is fully opaque.
- `tests/pitchcraft.spec.ts`: print media on a fresh load, at 390 and 1280. Every article image is not lazy, is `complete` with a natural width, and has a box. The PDF generates.

The fast-scroll test passed on the old code even with instant jumps larger than the viewport. The deterministic "jumped past" test is the one that catches that cause.

### Verification

- `npm run lint`: exit 0 · `npx tsc --noEmit`: exit 0 · `npm run build`: exit 0.
- Guard and hook tests: 816 passed, 1 skipped.
- Playwright against `next start` on port 3000: **119 passed**. The reveal and PitchCraft specs also passed three times in a row (`--repeat-each=3`, 72 passed).
- Server stopped, and port 3000 confirmed free.
- **CI run [45536634618](https://github.com/Dher10/danielherdenez-site/actions/runs/45536634618) on `17efcd5`: passed.** Guard and hook tests: 817 passed. Playwright: 119 passed.

### Test failures along the way

Two of the new tests failed once after the fix. Both read opacity while the 700 ms fade was still running: the product had already shown the block. They now wait for the fade to end: up to 1 s in the "jumped past" test, which also asserts first that the block is no longer armed, and up to 2 s after the failsafe fires.

`TaskStop` on `npx next start` left the `next start` child running on port 3000. It was stopped by PID before the new build was served, and again at the end.
