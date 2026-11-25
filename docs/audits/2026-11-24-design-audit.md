# Unit E · Design and UX audit · 24 November 2026

Audit of `dev` at `a3c9593`, built with `npm run build` and served locally with `next start`. The live check covers the homepage theme toggle and both social-image URLs. PitchCraft is present in the local build and returned HTTP 404 on the live site at audit time.

## Top 10

| Rank | Finding | Severity | Recommended change |
| --- | --- | --- | --- |
| 1 | E01 · Scroll-gated content disappears from fresh full-page captures, print, and no-JS rendering | High | Render content visible by default and layer motion on top. |
| 2 | E02 · The live PitchCraft route and its share image return 404 | High | Check the case URL and image on the deployment that includes the PitchCraft case. |
| 3 | E03 · PitchCraft's desktop cover is unreadable at phone width | Medium | Use an art-directed mobile crop of the existing phone capture. |
| 4 | E04 · The facts strip delays the case and repeats context | Medium | Use Daniel's approved version/date/link line below the lead. |
| 5 | E05 · Inner pages start too low on mobile, with extra space on Work | Medium | Use one compact inner-page spacing token and reduce the second gap on Work. |
| 6 | E06 · The before/after screenshots are uneven and too narrow at 390 px | Medium | Compare equivalent crops and stack them on mobile. |
| 7 | E07 · Scrolled navigation picks up a distracting band from the image behind it | Medium | Raise the opacity of the existing themed nav surface. |
| 8 | E08 · The About-to-PitchCraft link blends into body copy | Medium | Give the link an underline and the existing sage link color. |
| 9 | E09 · Chapter labels line up with each row but sit far from their text | Medium | Preserve the right rail and tighten its relation to a consistent prose column. |
| 10 | E10 · Unmarked evaluation chart units have weak contrast in both themes | Medium | Add clearer outlines and a second visual distinction to the units. |

## Coverage and method

- Full-page PNGs in `C:\Dev\audits\site-2026-11-24\` use `{route}-{width}-{theme}.png`. Route stems are `home`, `about`, `work`, `veflo`, `internal`, `pitchcraft`, and `404`. Viewports are 390 × 844, 1280 × 900, and 1440 × 900 CSS px in Chromium. The 390 px context used touch and mobile emulation. Each of the 42 full-page views used normal motion, a top-to-bottom scroll, time for reveals to settle, and a return to the top. Some captures needed a brief pause over individual sections to trigger every reveal.
- PitchCraft also has fresh-load, fresh print-media, and JavaScript-disabled captures. Print evidence uses Chromium's CSS print media immediately after opening the page. The crawler check examines SSR and rendered visibility. Browser findings cannot establish how a specific search engine indexes the text.
- Checked document structure, keyboard interaction, tap bounds, text contrast, image metadata and decoded dimensions, theme persistence, and live HTTP responses. Evidence files `measurements.json`, `local-interaction.json`, `production-measurements.json`, and `prod-interaction.json` hold browser measurements. This was a browser inspection with targeted accessibility checks. [Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) · [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- Read the approved `C:\Dev\handoff-pitchcraft\PitchCraft_Caso_Texto_v4.md` against the rendered case. Backlog B supplies the later, approved replacement for the facts strip. Recommendations use the existing serif/sans/mono system, sage accent, hairlines, and spacing tokens from `DESIGN.md`.
- The local sandbox denied some Next.js image cache writes. Image responses decoded in the browser. Image observations cover sizing, loading priority and layout stability, with production performance timing outside this check.
- High indicates unavailable content or a release blocker. Medium indicates material reading, navigation, or accessibility friction. Low indicates a local improvement or maintenance issue.

## Findings

### E01 · Content depends on scroll to become visible

**High · Backlog D confirmed · All six normal pages · 390, 1280, 1440 px · both themes**

**Evidence** `pitchcraft-1440-dark-no-scroll.png`, `pitchcraft-1440-dark-print.png`, `pitchcraft-1440-dark-no-js.png`, `pitchcraft-1440-dark.png`, `home-1440-dark-no-js.png`, `internal-1440-dark-no-js.png`.

PitchCraft's headline, lead, and facts render on the fresh page. The cover, eight chapters, decision links, and related work occupy space but start at zero opacity. The print-media capture has the same large blank body. With JS disabled, the DOM still contains the prose, but it remains visually hidden. Home loses Proof, its case cards, the About teaser, and Writing. The case 02 body and related work are also absent visually. With reduced motion and JavaScript, offscreen opacity still waits for scroll. Inspect `src/components/shared/reveal.tsx` and the separate card variants in `src/components/sections/work.tsx`.

**Recommendation** render readable content in SSR and print. Make the entrance effect progressive enhancement, including the homepage card stagger. Keep reduced-motion content static. Assert computed visibility in fresh, print, reduced-motion and JS-disabled contexts, including focused controls, alongside ordinary animation tests.

### E02 · Live PitchCraft and its share image are unavailable

**High · Backlog D verified · /work/pitchcraft · 390 px light and HTTP metadata checks**

**Evidence** `prod-pitchcraft-390-light.png`, `production-measurements.json`, `prod-site-og.png`, `pitchcraft-og.png`.

Live GETs to `/work/pitchcraft` and `/work/pitchcraft/og.png` both returned HTTP 404. The live homepage still displays the older availability eyebrow and pre-PitchCraft work card. Its own image URL returned HTTP 200 and PNG. The local case has its dedicated image and correct absolute Open Graph URL. The dedicated image, the generic local image and the live generic image are all 1200 × 630 px. The result is consistent with production running an earlier revision. The live PitchCraft card preview remains pending deployment. [Live homepage](https://danielherdenez.com/) · [Live generic share image](https://danielherdenez.com/og-image.png)

**Recommendation** treat the case and image returning HTTP 200 with the expected Open Graph URL as release acceptance checks. Inspect the actual card in a supported sharing client after release. Use the existing case-specific image, with the local composition as the visual reference.

### E03 · The cover shrinks desktop UI to thumbnail text

**Medium · Backlog C confirmed · /work/pitchcraft · 390 px · both themes**

**Evidence** `pitchcraft-390-dark.png`, `pitchcraft-390-light.png`, `pitchcraft-1440-light.png`.

The 1441 × 900 desktop screenshot scales to about 326 × 204 CSS px on the phone. The scoreboard remains recognizable, while the rationale and starter rows are too small to read comfortably. Desktop has room for the wide view. The same mobile Game 5 after capture already exists in the before/after pair and can supply the requested mobile image.

**Recommendation** use the existing phone capture at full prose width on mobile. Crop to a useful first screen with the score and first supporting evidence, reserve an aspect ratio per breakpoint, and keep the caption and descriptive alternative. Use the wide image on desktop and load only the selected source.

### E04 · The facts strip adds bulk before the article

**Medium · Backlog B confirmed · /work/pitchcraft · 390, 1280, 1440 px · both themes**

**Evidence** `pitchcraft-390-light.png`, `pitchcraft-1440-dark-no-scroll.png`.

The strip faithfully implements the earlier approved v4 layout. It provides quick product and repo links, but the prose covers tooling and the rules-based choice. The four rows or cells give the tool list and `$0` the same prominence as the product link. On mobile, this delays the opening image and first chapter. The version reads like a current status, which increases maintenance.

**Recommendation** put the approved line directly below the lead, with its two links styled as visible, focusable links. Let the logical line wrap naturally on a phone.

> Written at v2.2.0 · November 2026 · Open PitchCraft ↗ · GitHub ↗

### E05 · The mobile inner-page entrance has an outsized gap

**Medium · Backlog C confirmed on mobile and qualified on desktop · /about, /work, all three case pages, compared with / · 390, 1280, 1440 px · both themes**

**Evidence** `home-390-light.png`, `about-390-light.png`, `work-390-dark.png`, `veflo-390-dark.png`, `home-1440-light.png`, `work-1440-light.png`.

Mobile home uses 48 px of top padding. All five standard inner pages share about 118 px at the 844 px test height. At 900 px desktop height, the inner pages use 126 px, while home uses 144 px. The top gap is therefore larger than home on mobile, while the inner pages are already tighter than home on desktop. Work also stacks the hero bottom padding and the grid section's top padding, so the first card starts unusually far from its heading. Alignment across the five pages is already consistent.

**Recommendation** use one shared compact inner-page hero token, starting at 48–64 px mobile and testing 80–96 px desktop against the current editorial spacing. On Work, reduce only the top padding of the first card section. Keep the x-axis container and reserve the centered layout for 404.

### E06 · Before/after compares unequal extents

**Medium · Backlog C confirmed · /work/pitchcraft · 390, 1280, 1440 px · both themes**

**Evidence** `pitchcraft-390-dark.png`, `pitchcraft-1280-dark.png`, `pitchcraft-1440-light.png`.

Equal-width columns give the pair a common starting line, but the 375 × 1390 Before and 750 × 1892 After occupy different heights. The After view ends far earlier, leaving a large blank area beside the Before. At 1440 px the two images are about 1,121 px and 764 px tall. At 390 px each image is about 155 px wide. Small labels, roster data and the actual product change are hard to compare. Captions and case prose already explain why the archive changed.

**Recommendation** select comparable regions around the game headline and supporting stats, with matched visual scale, a shared baseline at the top, and the same figure treatment. Stack full-width comparisons on mobile. Keep the current source and reconstruction context in the caption and optionally link the full originals.

### E07 · The sticky bar picks up the shape of underlying content

**Medium · Backlog C confirmed as visual noise · Shared nav, reproduced on /work/pitchcraft · 390 and 1440 px dark, 1440 px light**

**Evidence** `pitchcraft-1440-dark-nav-over-cover.png`, `pitchcraft-1440-light-nav-over-cover.png`, `pitchcraft-390-dark-eval-detail.png`, `about-390-light-menu.png`.

The scrolled bar matches the approved 14 px blur and 80% page-color mix. The white and green regions of the cover create a visible band behind desktop nav labels. At 390 px dark, two lines of article text are visible behind the menu controls. Navigation labels and icons remained readable in the sampled frames. The open mobile panel already uses a solid page surface, which gives it a cleaner edge.

**Recommendation** test a 94–96% mix or solid `--bg-0` in the scrolled state, keeping the hairline and current transparent top-of-page treatment. Check the result over the cover and card backgrounds in both themes.

### E08 · About's inline case link has no visual affordance

**Medium · Backlog C confirmed · /about · 390, 1280, 1440 px · both themes**

**Evidence** `about-390-light.png`, `about-1440-dark.png`, `measurements.json`.

“The case study” is a working link to PitchCraft. It inherits adjacent body text color and has no underline at rest. It reads like part of the sentence until keyboard focus or pointer discovery.

**Recommendation** use `--accent-fg` plus a persistent underline with enough offset to clear descenders. Preserve the visible focus ring and use a PitchCraft-specific link label when the copy is next approved.

### E09 · Labels align with rows, but the right rail feels detached

**Medium · Backlog C partially confirmed · /about, /work/veflo-trace, /work/pitchcraft · 1280 and 1440 px, plus 390 px comparison · both themes**

**Evidence** `about-1440-light.png`, `veflo-1280-dark.png`, `pitchcraft-1440-light.png`, `pitchcraft-390-light.png`, `local-interaction.json`.

The shared two-column `.stage` grid already puts labels beside the first content block, with a 7 px inset. No row was assigned the wrong label. Labels sit on the far right and align by their end, so their start drifts with label length. The gap to the prose makes short labels easy to miss. “The writer” sits beside a large pull quote, weakening its relationship to the first body paragraph. On mobile the labels appear above their blocks but remain right-justified, so the reading axis moves back and forth. Case 02 uses continuous prose without chapter labels.

**Recommendation** keep the right rail on desktop, start labels at a consistent edge within it, and set a shared first-line offset for regular text and pull-quote openings. Align labels to the body start on mobile. Keep the existing mono style and stage dot. Use chapter labels where they help orient the reader in a long case.

### E10 · Evaluation chart's unmarked units fade into the panel

**Medium · /work/pitchcraft · 390, 1280, 1440 px · both themes**

**Evidence** `pitchcraft-390-dark-eval-detail.png`, `pitchcraft-1440-light.png`.

The unmarked squares use `--fg-3` at 45% opacity over `--bg-2`. The composited contrast is approximately 1.84:1 dark and 1.79:1 light. Marked versus unmarked is roughly 3.24:1 dark and 2.91:1 light. The accompanying text and ARIA names convey both totals, so the information is still available. The low-contrast cells weaken the proportional comparison at a glance.

**Recommendation** give the unmarked units a stronger outline and use filled versus outlined shapes for the two states. Keep the text totals, explicit ARIA names and `--accent-fg` marks. Target at least 3:1 for the marks when used to read the chart. [WCAG 2.2 non-text contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast)

### E11 · The return link occupies an isolated row

**Medium · Backlog C confirmed as placement · All three cases · 390, 1280, 1440 px · both themes**

**Evidence** `veflo-390-light.png`, `internal-1280-dark.png`, `pitchcraft-1440-dark-no-scroll.png`.

“← Work” is in document flow, in a separate CTA row following the heading or the PitchCraft facts. It looks detached in the large gap before the article. PitchCraft delays it further by placing it after the lead and facts.

**Recommendation** use one compact back-to-work link above the eyebrow or title in all three case intros, aligned to the prose edge with the existing ghost treatment and a comfortable hit area.

### E12 · Case 03 is a centered second row

**Low · Backlog C confirmed on desktop · / and /work · 1280 and 1440 px, with 390 px comparison · both themes**

**Evidence** `home-1440-dark.png`, `work-1280-light.png`, `home-390-dark.png`.

PitchCraft is alone on the second row in both grids, spanning six of twelve columns from column four. This is a documented variation of the asymmetric layout. The result reads as a standalone item with empty flanks. On mobile, the three cards share the same width and reading axis.

**Recommendation** try the already documented eight-column centered span starting in column three. It keeps the intentional two-plus-one layout and gives the second row more visual weight without changing card styling.

### E13 · Case 03 is narrative prose with a denser middle

**Medium · Backlog B partially confirmed · All three cases, especially /work/pitchcraft · 390, 1280, 1440 px · both themes**

**Evidence** `pitchcraft-390-dark.png`, `pitchcraft-1440-light.png`, `veflo-1440-light.png`, `internal-1440-light.png`.

PitchCraft uses the same first-person paragraphs, serif pull quotes, reflective close and related cases. It differs in scale and pace. Four paragraphs precede the pipeline, and the evaluation asks the reader to distinguish flagged sentences, accepted reports, and model-judge agreement across successive paragraphs. The pipeline and evaluation figure sit by the right topics, but the key evaluation counts arrive well into the section. The mobile pipeline is five stacked cards, while desktop uses five narrow columns. The shorter rendered chapter labels are broadly faithful to v4's margin-label guidance, but “The writer, Oct–Nov” is less descriptive when encountered in a headings list than v4's section heading “Why I kept the rules-based reports.”

**Recommendation** keep the first-person prose. Bring the release decision forward in that chapter, make the three measures easier to distinguish in adjacent paragraphs, and place the chart near the first discussion of its denominators. Use the existing figure frame, caption, and emphasized validation steps. Fit the pipeline grid to the available figure width so intermediate widths get readable steps. Retain meaningful heading text for scanning and assistive navigation.

### E14 · Desktop prose runs long while mobile largely reads comfortably

**Medium · /about and all three cases · 1280 and 1440 px, with 390 px comparison · both themes**

**Evidence** `about-1440-light.png`, `veflo-1280-dark.png`, `internal-1440-light.png`, `pitchcraft-390-light.png`, `measurements.json`.

The 20 px Geist body and 1.62 line-height are comfortable at mobile widths. Long desktop paragraphs can fill 52 rem, producing roughly 87–96 characters on the longest sampled lines at 1440 px, compared with roughly 35–41 characters at 390 px. This makes it easier to lose the next line in the evaluation and case 02. The existing serif beats and pull quotes already provide good breaks.

**Recommendation** start with the design system's 48 rem prose measure and test a 65–75-character reading line on representative paragraphs. Keep wide figures and the chapter rail on their existing spans.

### E15 · Active and open navigation states need a clearer interaction cue

**Low · Shared navigation · 390, 1280, 1440 px · both themes**

**Evidence** `about-390-dark-menu.png`, `about-390-light-menu.png`, `about-390-light-focus.png`, `work-1440-light.png`, `home-390-dark-about-scroll-menu.png`, `measurements.json`, `local-interaction.json`.

About and Work expose current-page states, and case pages mark Work as the current location. The contrast step between an active label and its siblings is subtle in the mobile menu. A settled home scroll marked About active when its section occupied the middle of the mobile viewport. The menu opens with Enter, exposes `aria-expanded`, and closes after following a link. Escape leaves it open. Opening the in-flow panel pushes down the page, and the retained focus ring on the toggle makes the current control clear.

**Recommendation** add a slim sage underline or indicator for the active item and keep `aria-current`. On Escape, close the disclosure and return focus to the toggle. Keep normal Tab movement between the toggle and the links.

### E16 · Small controls and recovery actions have narrow hit areas

**Low · /404 and shared footer/mobile menu · 390 px · both themes**

**Evidence** `404-390-light.png`, `404-390-dark.png`, `work-390-dark.png`, `about-390-light-menu.png`, `measurements.json`.

The 404 shows one clear H1 and a visible return-home link. That link is a 13 px mono text target with no padding. Footer text links measured 19.5 px high and the header monogram measured 14 × 32 px. The mobile menu link rows also have smaller hit areas than the theme or hamburger buttons. The mobile theme/menu controls and footer social icons measure 44 × 44 px. Spacing and inline exceptions matter for WCAG 2.2 target size, so small visual bounds alone do not establish a failure.

**Recommendation** give the 404 recovery link the existing ghost-button padding, and add vertical padding or a larger minimum hit area to the mobile nav/footer text and monogram. Keep the visible shapes and type sizes. [WCAG 2.2 target size](https://www.w3.org/TR/WCAG22/#target-size-minimum)

### E17 · Theme choice persists while mobile browser chrome stays dark

**Low · Backlog D verified on the live homepage · / and shared metadata · 390 px · light**

**Evidence** `prod-home-390-light-toggle-reload.png`, `prod-interaction.json`, `home-390-light.png`.

On the live homepage, a clean context starts dark, the real toggle changes the body to cream, and reload retains light at 390 px with no horizontal overflow. The declared browser toolbar color stays `#0E0E0F` across both themes. Chromium screenshot emulation captures the page surface, while `theme-color` describes the browser chrome. Native iOS/Android chrome was outside the scope of the render check.

**Recommendation** retain the universal dark default and, if matching browser chrome is desired, synchronize the meta color with the stored selection in the same theme bootstrap and toggle path.

### E18 · The eager cover request competes with the intro

**Low · /work/pitchcraft · 390, 1280, 1440 px · both themes**

**Evidence** `pitchcraft-390-light.png`, `pitchcraft-1440-dark-no-scroll.png`, `measurements.json`.

The cover has explicit dimensions, a responsive source set and a high-priority request despite being below the opening viewport in the tested layout. The before/after photos load lazily and reserve their aspect ratios. The cover's mobile `sizes` value is 100vw although site gutters leave roughly 326 px. At device scale 1, the browser selected a 640 px rendition on mobile and 1080 px on desktop. All three images decoded after scrolling. The 42 full-page runs produced no horizontal overflow and no non-input layout-shift entries on the local browser. The screenshots describe their meaningful content via alt text and captions.

**Recommendation** after changing the intro and mobile cover, check whether the new cover contributes to LCP. If it stays below the fold, use normal or lazy loading and reflect the gutters in `sizes`. Keep explicit dimensions and text alternatives for each crop.

### E19 · Relative copy and live-status claims will age

**Low · Backlog B related · /, /about, /work/pitchcraft · 390, 1280, 1440 px · both themes**

**Evidence** `home-1440-dark.png`, `about-1440-light.png`, `pitchcraft-1440-light.png`, `prod-home-390-light-toggle-reload.png`.

The local homepage calls PitchCraft “New”; the live homepage still uses “available · summer 2026.” PitchCraft's “That work resumes in February” lacks a year, and the facts strip presents `v2.2.0` and `$0` without an as-of date. About and the case describe current practices in the present tense. The dated release milestones, captured game captions and commit-pinned sources already read as historical evidence.

**Recommendation** use the approved snapshot line, review or retire the hero's “New” label at the next content update, and attach a year to February if the commitment still stands. Review present-tense claims when Daniel updates the About narrative or case. Preserve historical dates and pinned links.

### E20 · Case 02 offers few heading landmarks within the narrative

**Low · /work/internal-platform, with cases 01 and 03 for comparison · 390, 1280, 1440 px · both themes**

**Evidence** `internal-390-light.png`, `internal-1440-dark.png`, `veflo-1440-dark.png`, `pitchcraft-1440-light.png`.

Case 02 is readable as a continuous essay and uses pull quotes for visual pacing. Its heading outline jumps from the case H1 to “More work,” so heading navigation skips the main narrative movements. Case 01 has three H2 stage labels, and case 03 has eight. The H1 and heading nesting itself is sound in all three.

**Recommendation** add a small number of descriptive H2s at the existing editorial breaks if Daniel wants the case easier to navigate. Reuse stage or eyebrow styles and retain the continuous prose.

### E21 · The evaluation figure crosses the intended gutter on narrow phones

**Low · /work/pitchcraft · 320 px dark, compared with 390 and 768 px dark**

**Evidence** `pitchcraft-320-dark-eval-detail.png`, `pitchcraft-390-dark-eval-detail.png`, `pitchcraft-768-dark-eval-detail.png`, `local-interaction.json`.

At 320 px, the fixed 234 px unit grid plus the figure padding needs about 284 px. The standard 32 px gutters leave 256 px for the figure, so its right edge moves to x=316 and leaves only 4 px. The document still measures 320 px wide. At 390 px the intended 32 px gutter is present.

**Recommendation** Let the chart columns and unit sizes shrink with the frame, or reduce the figure padding at narrow widths. Preserve the unit counts and text summary.

### E22 · The PitchCraft share card carries incidental interface copy

**Low · Backlog D related · /work/pitchcraft share image · 1200 × 630 px source, theme-independent**

**Evidence** `pitchcraft-og.png`, `site-og.png`, `production-measurements.json`.

The local case card clearly shows the scoreboard and the team names at full size. It also includes the app navigation and an offseason banner that refers to the start of the 2027 season. The neutral site-wide card remains readable as a standalone image. The PitchCraft crop will lose its smaller interface text in compact previews.

**Recommendation** Keep the scoreboard as the focal point. On the next share-image revision, crop the obsolete banner and navigation and retain the case-specific image metadata. Verify the currently approved image after release as described in E02.

## Page-by-page checks

| Page | Evidence at representative widths and themes | Result |
| --- | --- | --- |
| / | `home-390-dark.png`, `home-1280-light.png`, `home-1440-dark.png` | Hero, Work, About and Writing have a clear hierarchy. E01, E12 and E19 cover changes to content visibility, card placement and the eyebrow. |
| /about | `about-390-light.png`, `about-1280-dark.png`, `about-1440-light.png` | One H1 and four correctly nested chapters. E05, E08, E09 and E14 cover the entry, prose and case-link path. |
| /work | `work-390-dark.png`, `work-1280-light.png`, `work-1440-light.png` | Three links have distinct titles and H2s. E05 and E12 cover spacing and layout. The list also uses the E01 reveal behavior. |
| /work/veflo-trace | `veflo-390-light.png`, `veflo-1280-dark.png`, `veflo-1440-light.png` | The pull quote and three chapter labels support a continuous prose case. E05, E09, E11 and E14 apply. |
| /work/internal-platform | `internal-390-dark.png`, `internal-1280-light.png`, `internal-1440-dark.png` | The opening explains the product context, and serif beats break up the body. E05, E11, E14 and E20 apply. |
| /work/pitchcraft | `pitchcraft-390-light.png`, `pitchcraft-1280-dark.png`, `pitchcraft-1440-light.png` | The most substantial case still shares the portfolio's prose, typographic and figure vocabulary. Its most consequential local issues are E01, E03, E04, E06, E10 and E13. |
| 404 | `404-390-light.png`, `404-1280-dark.png`, `404-1440-light.png` | Unknown URL returned 404. The screen preserves typography and the saved theme with an explicit recovery link. E16 covers the target. |

Visible text contrast held up across the sampled surfaces. The global skip link was first in the tab order, showed a focus outline, and moved focus to `#main`. Core text token contrast on the page surface was 11.41:1 dark and 9.68:1 light for body copy, 5.81:1 and 5.62:1 for metadata, 6.63:1 and 5.33:1 for accent text, and 4.61:1 and 4.62:1 for footer text. These are sampled token pairings. Image-embedded text and the translucent header were inspected separately.

## Backlog disposition

- **B** · Confirmed the facts-strip friction and used the approved replacement in E04. Case 03 remains narrative prose, with a denser evaluation chapter and additional figure markup. E13 and E19 cover the reading and dated-content issues.
- **C** · Confirmed the mobile hero gap (qualified on desktop), sticky-bar show-through, before/after imbalance, indistinct About link, isolated return link, mobile cover legibility, and centered third card. Chapter labels share their rows with the right text. Their optical relationship and mobile alignment merit adjustment. See E03 and E05–E09, E11–E12.
- **D** · Confirmed the reveal visibility defect. Live mobile homepage light mode passed toggle and persistence. The generic share image resolved. The PitchCraft page and share image passed locally and returned 404 in production. See E01, E02 and E17.
