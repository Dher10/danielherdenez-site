# PitchCraft: owner decisions for implementation

**Date:** 25 November 2026 · **Owner:** Daniel Herdenez
**Applies to:** files 00 to 04 in this folder. Where this file and 00 to 04 differ, this file wins. It resolves the open points those files left for the owner. It does not change any copy in 01 or 02.

## 1. Routes

- Case 03: `/work/pitchcraft-v1-kaggle`. Case 04: `/work/pitchcraft-v2-world-series`.
- `/work/pitchcraft` is removed entirely. It only ever existed on the `dev` branch, never in production, so it gets no redirect and no page. A bare `/work/pitchcraft` route would also collide with future PitchCraft cases.
- Naming convention for future cases: `/work/pitchcraft-v{version}-{context}`.

## 2. Case 03 cover

- Rebuild the `v1.0.0-kaggle` version from the PitchCraft repository tag and capture it. Work outside both repositories (export the tag with `git archive`; never check out, branch or change anything in `pitchcraft-agent`).
- Capture the main matchup view at desktop size, plus a phone crop, with the same treatment as the case 04 cover.
- Approved caption (updated 25 Nov, after seeing the rebuild): "The Kaggle version and its cached demo data, rebuilt from the v1.0.0-kaggle tag in November 2026." The rebuilt view shows the cached demo snapshot, with demo values next to real player names; the caption says so instead of presenting them as real statistics.
- If the tag cannot be built and run after two attempts, stop and report. Do not substitute another image.

## 3. Assets

- Regenerate whatever is needed. Case 03 gets its own share image from the rebuilt capture, same size and treatment as the case 04 share image.
- Case 04 keeps its existing cover, cover caption ("World Series Game 5 in the PitchCraft postseason archive, November 2026."), three figures and share image.
- Assets live in `public/work/pitchcraft-v1-kaggle/` and `public/work/pitchcraft-v2-world-series/`.

## 4. Card tags

- Case 03: Product discovery · Agent pipeline · July 2026
- Case 04: AI evaluation · Agentic build · Since Oct 2026

## 5. Site copy outside the two case pages

Two texts linked to `/work/pitchcraft` and change because there are now two cases:

- Home hero eyebrow: "New case studies · PitchCraft", linking to `/work`.
- `/about`, last sentence of the PitchCraft paragraph: "Two case studies tell how it got there: the Kaggle capstone and the live product." "the Kaggle capstone" links to `/work/pitchcraft-v1-kaggle`; "the live product" links to `/work/pitchcraft-v2-world-series`.

No other copy changes outside the two case pages. Cases 01 and 02 stay exactly as implemented, including their current titles (file 04 shows a different title for case 01; ignore it).

## 6. Approved copy items from file 03, section 6

- Case 03 closing statement, as written in file 01.
- The critic claim "I deliberately included a claim that would fail one of its checks", as written.
- The July scope decisions (confirmed lineups, detailed tables, composite metric), as written.

## 7. Captures of major changes (new standing rule)

From now on, every major visual change to the site or to PitchCraft leaves reference captures in the repository, so case studies can use them later without rebuilding old versions.

- Location: `docs/captures/<yyyy-mm-dd>-<topic>/` in the repository where the change happened.
- Content: the key pages at 1280 px and 390 px, in WebP, plus a short `README.md` with what each capture shows, the commit or tag, and the date.
- For this unit: save the rebuilt v1 captures and the final captures of both PitchCraft case pages there.
- Record the rule in `AGENTS.md`.

## 8. Link presentation follows the site (26 Nov)

Files 01 and 02 write the CTA as "Open PitchCraft ↗ · Read the ... ↗" and list sources as plain links. That is how the copy reads in markdown, not a layout instruction. On the site, the CTA row keeps the existing pattern of a primary button and a ghost link with no middle dot between them, and external links in the sources list keep the site's "↗" marker. The words of each link stay exactly as in files 01 and 02. Codex's Unit G verification flagged both points; Daniel accepted them as site conventions on 26 Nov.
