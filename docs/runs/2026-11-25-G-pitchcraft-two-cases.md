# Unit G: PitchCraft split into two case studies

**Date:** 2026-11-25 · **Branch:** `dev` · **Source of truth:** `docs/editorial/pitchcraft-2026-11-25/` (files 01 and 02 for visible copy, 04 for routes and cards, 03 for facts, 05 for the owner's decisions, which win over 00 to 04).

Naming note: "Unit G" is the name of this run's brief. It is not backlog item G (production check), which this run rewrote for the new routes.

## What changed

**Cases and routes**
- `src/lib/cases.ts`: `pitchcraft` replaced by `pitchcraftV1` (case · 03) and `pitchcraftV2` (case · 04). Titles and descriptions from file 04, tags from file 05 §4. Order 01 to 04. New `otherCases(href)` returns the other three cases for each "More work" grid. Header comment updated.
- New pages `src/app/work/pitchcraft-v1-kaggle/page.tsx` and `src/app/work/pitchcraft-v2-world-series/page.tsx`, built from the existing case pieces: back link, eyebrow, title, lead, the "Based on / Written at" facts line, cover, chapter labels, body, figures, pull quote, serif beat, closing statement, CTA row, project notes and sources, "More work". Each has its own metadata (title with the site suffix, description, canonical URL, Open Graph and Twitter image) and Article JSON-LD.
- `src/app/work/pitchcraft/` removed, with no redirect (file 05 §1). `tests/pitchcraft.spec.ts` removed with it.
- New `src/components/shared/case-cover.tsx`: the art-directed cover (phone crop below 768px, desktop capture above) that the old page had inline, now shared by both cases.
- Links to the old route updated: hero eyebrow "New case studies · PitchCraft" → `/work`; `/about` sentence with "the Kaggle capstone" and "the live product" (file 05 §5); sitemap lists both routes; "More work" on veflo-trace and internal-platform lists the other three cases. veflo-trace keeps its name-based labels: "PitchCraft v1 · Kaggle" and "PitchCraft v2 · World Series".
- `globals.css`: the work grid places cards two per row (odd / even); the centered third card applies only with `:nth-child(3):last-child`, that is, in a grid of exactly three.

**Assets**
- `public/work/pitchcraft/` moved unchanged to `public/work/pitchcraft-v2-world-series/` (cover, three figures' captures, share image).
- `public/work/pitchcraft-v1-kaggle/`: new cover (`pitchcraft-v1-desktop.webp` 1440×900, `pitchcraft-v1-cover-phone.webp` 750×1612) and share image (`og.png` 1200×630), same sizes and treatment as case 04, all from the v1 rebuild.

**v1.0.0-kaggle rebuild**
- `git -C C:\Dev\pitchcraft-agent archive v1.0.0-kaggle` into `C:\Dev\audits\pitchcraft-v1-build\` (tag commit `e32744a`, 4 July 2026). `npm install` and `npm run build` succeeded (Next.js 16.2.9, exit 0, log in the build folder); served locally and captured. The pitchcraft-agent working tree was checked afterwards: clean, on its branch `v2`, and the tag still points at `e32744a`.

**Captures** (file 05 §7): `docs/captures/2026-11-25-pitchcraft-cases/` holds the rebuild at 1280 and 390 px, and the final pages of both cases at 1280 and 390 px, in WebP, with a README. The case 04 page at 390 px is 16,626 px tall, above WebP's 16,383 px limit, so it is saved in two parts.

**Docs**
- `AGENTS.md`: structure updated; new sections "Case studies y rutas" (the four cases, the removed route, the naming convention `/work/pitchcraft-v{version}-{context}`, where the copy lives) and "Capturas de cambios mayores" (the standing rule). Open-context notes for PitchCraft, shared pieces and the hero eyebrow updated.
- `DESIGN.md`: the work grid rule (two per row; centered third card only in a grid of three); the reveal note no longer describes the old 0.05 threshold and `-10%` margin and now matches `reveal.tsx` (arm within a quarter viewport below the edge, play when the top crosses the edge, 1200ms failsafe); PitchCraft paths, cover and facts line for both cases; hero eyebrow.
- `docs/BACKLOG.md`: B closed; G rewritten as "after merge: check both case routes and share images in production".
- `.gitignore`: `.claude/settings.local.json` (Daniel's local configuration, never committed).

## Tests

- New `tests/cases.spec.ts`: four cards on home and `/work` in order (meta, title, and for 03/04 description and tags); two rows of two at 1280 px, one column at 390 px; each case's "More work" lists the other three and no link points at the page itself, with the third card centered; veflo-trace name labels; no page or the sitemap links to `/work/pitchcraft`; `/work/pitchcraft` is a 404 with no redirect; sitemap; title, description, canonical, `og:url`, `og:image`, `twitter:image` and image size per PitchCraft route, and the image is served; back link; cross-links both ways.
- New `tests/pitchcraft-v1.spec.ts` and `tests/pitchcraft-v2.spec.ts`: the visible text (eyebrow, title, lead, facts line, chapter labels, body paragraphs, quotes, figure captions, closing, CTA, sources heading, intro and links) is compared block by block, in order, with files 01 and 02, read at test time by `tests/support/editorial-copy.ts`; every link in the copy file is on the page with its exact destination; no bracketed note renders; cross-link position; cover caption and art direction; case 04 figure order and captions; external links open in a new tab; source pins (`v1.0.0-kaggle`, `fd96889`); JSON-LD; print.
- Updated for the new routes: `a11y`, `audit-regressions`, `inline-links`, `qa-home`, `reveal`.
- Fixed during this run: two specs compared the cover's `currentSrc` without decoding the `/_next/image` URL; the card tag check read the separators' text with no spaces; `audit-regressions` still expected three cards after browser back.

## Verification

- `npm run lint`: clean. `npx tsc --noEmit`: exit 0. `npm run build`: 12 static pages, both new routes, no `/work/pitchcraft`.
- Guard and hook tests (`python -m pytest .claude/hooks -q`): 816 passed, 1 skipped.
- Playwright against `next start` on port 3000: **153 passed**. Server stopped and port 3000 confirmed free.
- External links on both pages (read-only HTTP, following redirects): all 200, including every `v1.0.0-kaggle` and `fd96889` path and the live app. The canonical URLs on danielherdenez.com return 404 until the merge reaches production (backlog G). LinkedIn (footer) answers 999 to scripted requests, as before.
- `git status` after staging: `.claude/settings.local.json` not included.
- Commits on `dev`: `3c87e4c` (editorial source, Unit F records, .gitignore), `d05ece8` (the split), `a04dc44` (tests), `c5d291a` (docs, captures, this report). Pushed.
- **CI run [45740160753](https://github.com/Dher10/danielherdenez-site/actions/runs/45740160753) on `c5d291a`: passed.** Guard and hook tests: 817 passed. Playwright: 153 passed.

## Closing (2026-11-25)

Daniel updated file 05 §2 after seeing the rebuild: it shows the cached demo snapshot, with demo values next to real player names.

- Case 03 cover caption now reads "The Kaggle version and its cached demo data, rebuilt from the v1.0.0-kaggle tag in November 2026." The cover alt and the share image alt also say it is the cached demo, with no player names or stats. `tests/pitchcraft-v1.spec.ts` checks the new caption; the text comparison against file 01 is unaffected (the cover caption comes from file 05).
- Captures README states the rebuild runs on demo data. The two final case 03 page captures (`pitchcraft-v1-kaggle-1280.webp`, `-390.webp`) were retaken from this build so they show the new caption; the case 04 captures did not change.
- `AGENTS.md` "Contexto abierto": the note on content invisible without JavaScript now describes the current `reveal.tsx` (visible by default, armed only after scroll, hidden state limited to screen and motion), and the "truly visible" note points to the existing `expectTrulyVisible` and `expectAllRevealsVisible` in `tests/reveal.spec.ts`.
- Verification: `eslint` exit 0, `tsc --noEmit` exit 0, `npm run build` 12 static pages; guard and hook tests 816 passed, 1 skipped; Playwright against `next start` on port 3000: **153 passed**. Server stopped, port 3000 free.

## Notes for Daniel

- The "Before" / "After" labels on the case 04 phone comparison and the text inside the pipeline and eval figures are the existing figure artwork, not copy from file 02. Kept as they were.
- File 00 asks to flag claims from personal notes and the case 03 closing line; file 05 §6 approves all of them, so nothing was changed or flagged further.
- `AGENTS.md` "Contexto abierto" still has two notes that Unit F made obsolete (content invisible without JavaScript; the missing "truly visible" helper). Left as they are; outside this unit's scope.
- Backlog O (crop the case 04 share card) stays open; this run kept that image unchanged as file 05 §3 asks.
- No PR opened.
