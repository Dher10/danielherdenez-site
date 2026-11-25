# Backlog

One line of intent per item. Status is `open`, `in progress`, `done` or `dropped`. Each unit of work gets a run report in `docs/runs/`.

Note on naming: the design-fixes run of 2026-11-24 was called "Unit F" in its brief. It is not item F below (CI runner). It closed C, the facts line of B and the `Reveal` part of D. Report: `docs/runs/2026-11-24-F-design-fixes.md`.

| Id | Item | Status |
|----|------|--------|
| A | **Git guardrails and CI.** Versioned git hooks, Claude Code guard and deny rules, CI job `ci` on PRs to `main` and pushes to `dev`. Report: `docs/runs/2026-11-21-A-git-guardrails.md`. | done |
| B | **PitchCraft case content.** ~~Remove the facts strip and put one line under the lead~~ (done 2026-11-24 in the design-fixes run). Still open: review the whole text for readability, keeping the narrative prose style of cases 01 and 02. Audit E13 adds the specifics: bring the release decision forward in "The writer", make the three measures (flagged sentences, accepted reports, judge agreement) easier to tell apart, place the eval chart near the first mention of its denominators, and give the chapter headings descriptive text (v4's "Why I kept the rules-based reports"). Copy changes, so they need Daniel's approval. The layout part of E13 (pipeline fitted to its figure) is done. | open |
| C | **Design fixes.** Top spacing on inner pages, top bar show-through, before/after balance, chapter labels, About link, floating "← Work", mobile cover, case 03 card. All fixed 2026-11-24 (audit E03, E05–E12, E14). Report: `docs/runs/2026-11-24-F-design-fixes.md`. | done |
| D | **Technical.** ~~`Reveal` leaves content invisible until it enters the viewport~~ (fixed 2026-11-24, audit E01). Still open: verify the OG image and mobile light mode in production. | open |
| E | **Design/UX audit.** Full audit of the site with the available UI/UX skills. Report only, no changes. Report: `docs/audits/2026-11-24-design-audit.md`. | done |
| F | **CI runner.** Upgrade Playwright and return to ubuntu-latest once Playwright supports Ubuntu 26.04. | open |
| G | **After merge: verify `/work/pitchcraft` and its share image in production.** Both returned 404 live at audit time because the case is only on `dev` (audit E02). Check HTTP 200, the absolute `og:image` URL, and the card in a real sharing client. | open |
| H | **Nav states (audit E15, low).** Clearer active item in the mobile menu (slim sage underline or indicator, keep `aria-current`); Escape closes the mobile menu and returns focus to the toggle. | open |
| I | **Small hit areas (audit E16, low).** 404 recovery link gets ghost-button padding; mobile menu rows, footer text links and the header monogram get a larger hit area without changing type size. | open |
| J | **Browser chrome color (audit E17, low).** Optionally sync `theme-color` with the stored theme in the bootstrap script and the toggle. | open |
| K | **Cover loading (audit E18, low).** Measure whether the PitchCraft cover is the LCP after the new intro; if it stays below the fold, drop the high fetch priority. | open |
| L | **Aging copy (audit E19, low).** Retire the hero's "New case study" eyebrow at the next content update; add a year to "That work resumes in February" if it still stands; review present-tense claims when About is updated. | open |
| M | **Case 02 headings (audit E20, low).** Optionally add a few descriptive H2s at the existing editorial breaks so heading navigation covers the narrative. Copy change. | open |
| N | **Eval chart at 320px (audit E21, low).** At 320px the fixed unit grid plus frame padding crowds the right gutter; let units shrink with the frame or reduce padding at narrow widths. | open |
| O | **PitchCraft share card (audit E22, low).** On the next share-image revision, crop the app navigation and the obsolete off-season banner and keep the scoreboard as the focal point. | open |
