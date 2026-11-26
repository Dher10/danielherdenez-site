# PitchCraft — Cards, routes and metadata

**Date:** 25 November 2026. Canonical implementation specification.

## Published cards

Both home and Work should show these four cards, in the existing responsive layout. Keep the existing non-PitchCraft cards exactly as implemented; their titles are shown only to establish identity.

| Card | Product/name | Title | Canonical route |
|---|---|---|---|
| case · 01 | Veflo Trace | Building the path from workflow software to AI-assisted operations | `/work/veflo-trace` |
| case · 02 | Internal Platform | Designing product work beside an agentic build system | `/work/internal-platform` |
| case · 03 | PitchCraft v1 · Kaggle | Building a scouting product around verifiable claims | `/work/pitchcraft-v1-kaggle` |
| case · 04 | PitchCraft v2 · World Series | From a Kaggle capstone to a live baseball product | `/work/pitchcraft-v2-world-series` |

### Case 03

- **Name:** PitchCraft v1 · Kaggle
- **Eyebrow:** PitchCraft v1 · July 2026
- **Title:** Building a scouting product around verifiable claims
- **Description:** Turning a personal idea into a baseball scouting product in seven days, with a deterministic agent pipeline and a fact-checking mechanism.
- **Route:** `/work/pitchcraft-v1-kaggle`
- **Historical snapshot:** `v1.0.0-kaggle` (July 2026)
- **CTA:** use the existing case card link convention.
- **Metadata:** use title and description above with the site's existing title suffix and Open Graph conventions. Canonical URL: `https://danielherdenez.com/work/pitchcraft-v1-kaggle`.

### Case 04

- **Name:** PitchCraft v2 · World Series
- **Eyebrow:** PitchCraft v2 · November 2026
- **Title:** From a Kaggle capstone to a live baseball product
- **Description:** Taking PitchCraft into production, evaluating a language model as its writer and redesigning the experience for the off-season.
- **Route:** `/work/pitchcraft-v2-world-series`
- **Historical snapshot:** through `v2.2.0` (November 2026); documentation pinned to `fd96889`.
- **CTA:** use the existing case card link convention.
- **Metadata:** use title and description above with the site's existing title suffix and Open Graph conventions. Canonical URL: `https://danielherdenez.com/work/pitchcraft-v2-world-series`.

Use the existing typography rules for uppercase eyebrow rendering; do not change the display strings or use uppercase prose elsewhere.

## Cross-links

| From | Anchor text | Destination |
|---|---|---|
| Case 03, final body paragraph | From a Kaggle capstone to a live baseball product | `/work/pitchcraft-v2-world-series` |
| Case 04, first body paragraph | my capstone for Kaggle's AI Agents Intensive | `/work/pitchcraft-v1-kaggle` |

Both articles are standalone. Link styling follows existing prose links. The historical v1 link goes to the tagged repository; the product CTA goes to the current public app.

## Legacy and future routes

- `/work/pitchcraft`: if published or shared, permanent redirect to `/work/pitchcraft-v2-world-series`. Inspect existing routing; do not maintain duplicate content.
- No chapter routes, project hub or separate navigation level.
- Future naming convention: `/work/pitchcraft-v{version}-{context}`. A new software version is not by itself grounds for a new case study.
- Card rotation, dynamic selection and further homepage redesign are deferred; show all four now.
