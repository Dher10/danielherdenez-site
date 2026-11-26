# PitchCraft — Editorial and implementation handoff

**Date:** 25 November 2026  
**Portfolio:** danielherdenez.com  
**Repository:** https://github.com/Dher10/danielherdenez-site  
**Status:** consolidated editorial baseline for implementation, subject to owner review before publication.

## 1. Decision and scope

Split the former single PitchCraft case into two standalone case studies in Work. Both appear as independent cards on the homepage and Work page, alongside the two existing case studies. The distinction is historical: the July Kaggle capstone and the October–November product evolution through v2.2.0.

Do not add a chapter system, intermediate project page, mandatory reading order or new navigation layer. Connect the two pages through natural links in their body copy. Do not implement card rotation or dynamic selection now; the owner will decide that separately.

This package supersedes the single-case text v5 and its earlier editorial and routing proposals. The archived files are evidence and history only; they are not alternative copy to implement.

## 2. Files and reading order

| File | Purpose |
|---|---|
| `00_README_Handoff_Claude.md` | This implementation brief and acceptance checklist. |
| `01_PitchCraft_v1_Kaggle_Copy.md` | Complete English Case 03 page, links and card copy. |
| `02_PitchCraft_v2_World_Series_Copy.md` | Complete English Case 04 page, figures, links and card copy. |
| `03_PitchCraft_Editorial_Context_and_Sources.md` | Consolidated editorial constraints, source matrix and verification caveats. |
| `04_PitchCraft_Cards_and_Routes.md` | Canonical route, card, cross-link and metadata specification. |
| `archive/` | Original context v2.1 and v5 and single-case text v5. Read only when tracing prior decisions. |

For implementation, the two Copy files are the source of truth for visible PitchCraft text. File 04 governs IDs, routes and cards. File 03 governs factual and editorial constraints. If an actual repository constraint conflicts with this brief, report it to Daniel before changing the intended copy or scope.

## 3. Information architecture

| Order | Case | Name | Route |
|---|---|---|---|
| 01 | Existing | Veflo Trace | `/work/veflo-trace` |
| 02 | Existing | Internal Platform | `/work/internal-platform` |
| 03 | New | PitchCraft v1 · Kaggle | `/work/pitchcraft-v1-kaggle` |
| 04 | New | PitchCraft v2 · World Series | `/work/pitchcraft-v2-world-series` |

Retain the existing titles, descriptions, routes and assets of Cases 01 and 02. Do not accidentally retain an obsolete Case 03 playbook placeholder as one of the four published cards. If the playbook exists as a separate draft, preserve its underlying content, but do not present it as one of the four published cases.

If `/work/pitchcraft` was previously published or shared, add a permanent redirect to `/work/pitchcraft-v2-world-series` rather than exposing a duplicate page. Inspect the current repository and deployment before choosing the mechanism. Preserve any other existing shared URLs if found; do not invent legacy redirects for draft-only proposals.

## 4. Implementation directions

- Read the current portfolio `AGENTS.md` and its existing conventions before implementation. Inspect the actual case registry, page components, home and Work components, metadata and related-work sections; use existing abstractions rather than creating parallel registries. `src/lib/cases.ts` was previously documented as the single source of truth; confirm that it still is.
- Publish both new PitchCraft pages using the same editorial system as Cases 01 and 02. Render labels, eyebrow, body, figures, pull quote, serif beat, closing statement and CTA using the existing components. Square-bracket markers in the copy are implementation notes; never render them literally.
- Show four case cards on the home page and Work page using the existing responsive grid. Keep existing spacing and responsive behavior; no redesign or carousel in this task.
- Update related-work navigation on all affected pages. Follow the current component's established behavior and ensure no self-links, duplicate cards or obsolete routes. Both new PitchCraft pages must be discoverable independently.
- Update page titles, descriptions, canonical URLs and Open Graph metadata using the site's existing pattern, plus sitemap or other route inventory if present. Keep the existing portfolio language and naming conventions.
- Preserve all source links pinned to `v1.0.0-kaggle` or `fd96889` as specified. The live product link always points to the current application; do not label it as the original July build.
- Use the exact cross-links in the Copy files. Do not add a 'read first' prompt or require an earlier article to understand the later one.
- No AI-generated expansion of the copy during implementation. Report inconsistencies before changing text. The next PitchCraft stage is outside scope.

## 5. Figures and visual evidence

### Case 03

No historical July screenshot has been supplied in this package. Do not depict a November screenshot as the July Kaggle version. If the original tag can be built locally, a screenshot of that exact version may be used, labeled as a reconstruction of the Kaggle version if captured now. Otherwise ask Daniel to approve a historical asset, a clearly labeled current-product illustration, or a text-first cover. Do not fabricate evidence or block the entire copy implementation on an unapproved image.

### Case 04

Retain the existing v5 cover if accurate and the three figures from the current preview. Their order and captions are specified in File 02.

1. Daily pipeline: scheduled fetch, report generation, critic, data contract and publication. No production LLM step. Use the existing artwork or verify any replacement against the actual daily job.
2. Writer evaluation: keep immediately after the paragraph it illustrates. Two panels should distinguish 36 supported / 4 unsupported among the 40 flagged test sentences, and 3 reports with an unsupported sentence / 2 without among the 5 accepted test reports. These are sample counts, not general rates. Use existing chart if it expresses these same measures. Do not imply that all reports were evaluated by an independent human panel.
3. World Series Game 5: before/after mobile comparison of the same game (`849799`). The left view was recreated in November from the October 28 published file; the right view is the archive page. Preserve that disclosure. Reference: https://pitchcraft-agent.vercel.app/game/849799.

Keep figure captions as captions, not duplicate body paragraphs. Verify the figures on mobile. The public archive combines reports published before games and reports reconstructed later, so preserve source labeling.

## 6. Editorial boundaries

The English prose is a proposed publication baseline approved in direction, not a request for further autonomous rewriting. Daniel decides final changes and publication. No em dashes in running prose; no artificial contrasts; no promotional AI language; no fabricated numbers, adoption claims or model superiority claims. Agents wrote the code; Daniel directed the product, reviewed work, labeled the evaluation and approved releases. The two recorded evaluation quotations must remain verbatim.

Before release, flag the remaining first-person claims sourced only from Daniel's earlier brief or notes, and the proposed Case 03 closing line, if they need final approval. See File 03. Do not silently change a claim or add a metric to compensate for an uncertain source.

## 7. Implementation acceptance checklist

- [ ] Four distinct published cards on home and Work, in order 01–04, with correct names, titles and destinations.
- [ ] Both new routes load independently and match the two Copy files; no visible layout markers or accidental duplicate headings.
- [ ] The contextual links resolve in both directions; no reading-order requirement or chapter navigation.
- [ ] Cases 01 and 02 retain existing copy and design; related-work navigation has no broken, obsolete or self-links.
- [ ] Legacy `/work/pitchcraft` redirect handled if needed; canonical and metadata reflect the final routes.
- [ ] Source links, historical tags and live product links resolve and are correctly distinguished.
- [ ] Figures and captions are accurate, positioned correctly and readable on desktop and mobile; no invented July screenshot.
- [ ] LLM remains described as an experiment, not as a published feature; evaluation limitations and literal quotes are preserved.
- [ ] No new metrics, production/adoption claims or roadmap commitments.
- [ ] Run the repository's prescribed build, lint, type checks and relevant tests; report actual results and any pre-existing or new failures. Inspect responsive preview and relevant link/route behavior before recommending publication.
- [ ] Return an implementation summary, changed files, test results, visual or asset blockers and any deviations requiring Daniel's approval. Do not merge or publish without the owner's authorization.

## 8. Short prompt for Claude

Read this handoff and Files 01–04 in order. Implement the two PitchCraft case studies as independent pages and cards in the existing portfolio. Preserve the supplied English copy and the current editorial system. Treat the archive as historical evidence only. Inspect the repository first, plan the changes, verify the results and report blockers or deviations before publication. Do not introduce chapters, card rotation, extra metrics or new copy.
