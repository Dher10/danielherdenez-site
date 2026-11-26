# Handoff: danielherdenez.com — Home Page (V1)

## Overview

This bundle contains the **approved home page design** for `danielherdenez.com` — a personal site for Daniel Herdenez, Product Manager. The design is dark-default with a light-mode toggle, anchored on Instrument Serif display type, Geist Sans for UI, and Geist Mono for metadata. A single sage accent (`#7B9F92` dark / `#4A6B5F` light) carries through both modes.

The home page is the first of several screens. Other routes (case studies, about, writing) will follow in subsequent handoffs; for now, internal links in the prototype use `#` anchors.

> **Revision — 2026-05-29 (post-launch):** Two changes were made after the V1 launch:
> 1. **Light-mode palette.** The page background moved to a warm cream and work/artifact cards moved to a sage tint with a desaturated-sage hairline plus a soft shadow. Sage remains the single accent; cream and sage now define the light-mode surfaces, with separation carried by warm/cool temperature contrast rather than heavier borders. Dark mode is unchanged. Updated values live in **Design Tokens → Colors — Light** and in the **Card hover** interaction note below.
> 2. **Theme default.** Dark mode is now the universal default for all new visitors. `prefers-color-scheme` is no longer used as a fallback — the bootstrap script ignores the OS preference and applies light only if the user has previously toggled it. Updated references are in **Conventions**, **layout.tsx requirements**, and **Theme toggle** below.

> **Revision — 2026-09-05 (post-launch):** `components/ui/button.tsx` was deleted. The shipped site renders its buttons with the `.btn` / `.btn-primary` / `.btn-ghost` CSS classes documented under **Hero → CTAs**; the shadcn Button was created by the scaffold and never imported anywhere. It still appears in the **Files to Generate** tree below, which is kept as the original handoff record. No shadcn primitives are in use today. `src/lib/utils.ts` and the `class-variance-authority` / `radix-ui` dependencies were left in place so a future `shadcn add` still works.

---

## About the Design Files

The files in this bundle are **design references created in HTML** — a working prototype showing intended look, behavior, theming, and animation. They are **not** production code to copy directly.

Your task is to **recreate this design in the target Next.js codebase** using its established patterns and libraries (see Stack below). Lift values — colors, spacing, type, motion — from the prototype precisely. Reproduce structure faithfully. But the runtime should be idiomatic Next.js, not a port of the HTML scaffolding.

---

## Fidelity

**High-fidelity.** The prototype is pixel-targeted:
- Final colors, typography, spacing, radii, and motion are locked.
- Both dark and light themes are designed and approved.
- Hover/active states, sticky-nav blur, scroll-spy, reveal-on-scroll, and the hero mesh animation are all defined in the prototype — reproduce them.

When recreating in Next.js, match values exactly. Where the prototype uses CSS variables, Tailwind v4 should expose them as `@theme` tokens (see Design Tokens below).

---

## Known Deviations

The shipped site has moved away from this spec in the places below. They are recorded here rather than rewritten in place, so the sections below still read as what was originally approved.

| # | This spec says | Shipped today | Origin |
|---|---|---|---|
| 1 | Stack is Next.js 15 | Next.js 16.2.6 | Pre-existing |
| 2 | Monogram links to `#top` | Links to `/`. The `#top` anchor was removed when the pages gained a `<main>` landmark | Pre-existing |
| 3 | Work grid card 3 is `col-start-3 col-span-8` | **Resolved 2026-11-24:** back to the spec, `grid-column: 3 / span 8` (it had shipped as `4 / span 6`, which left the lone card floating; audit E12) | Pre-existing, resolved in Unit F |
| 4 | Reduced motion clamps every animation and transition to `0.001ms` through a global rule in `globals.css` | A scoped block disables the hero mesh drift, smooth scrolling and the hover lifts, and leaves colour transitions alone. Framer Motion is covered by `MotionConfig reducedMotion="user"` in the root layout instead of per-component `useReducedMotion()` | Changed 2026-09-05 |
| 5 | Scrolled nav: `blur(14px)` and an 80% mix of `--bg-0` | `blur(20px)` and a **95%** mix of `--bg-0`, same hairline. At 80% the shapes and colors of screenshots and text scrolling underneath showed through as a band (audit E07) | Changed 2026-11-24 (Unit F) |
| 6 | Reveal-on-scroll: Framer `whileInView` from `{opacity: 0, y: 16}` | Content is **visible by default**. `Reveal` is a plain `div` plus a scroll-frame layout check: nothing is hidden until the reader scrolls, then a block still below the viewport is armed (`.is-armed`) and fades up 16px over 700ms when it enters (`.is-playing`). The hidden state is CSS inside `@media screen and (prefers-reduced-motion: no-preference)`, so no-JS, print, crawlers, full-page captures and reduced motion never hide content. The home card stagger (`<Reveal stagger>`) uses the same mechanism with 80ms steps. Framer's SSR `opacity: 0` hid content without JavaScript (audit E01) | Changed 2026-11-24 (Unit F) |

Deviation 4 needs context: the `0.001ms` rule was never actually implemented. The accessibility pass on 2026-09-05 found no `prefers-reduced-motion` CSS at all and added the scoped version, which keeps hover and focus feedback readable instead of freezing colour changes along with movement.

Card copy in **Section 01 — Work** and the hero sub copy have also drifted as the content evolved. `src/lib/cases.ts` is the source of truth for case copy; the tables below are the original handoff text.

---

## Stack & Hosting

| | |
|---|---|
| **Framework** | Next.js 15, App Router |
| **Language** | TypeScript, `strict: true` |
| **Styling** | Tailwind CSS v4 (CSS-first config via `@theme`) |
| **Components** | shadcn/ui (where applicable — Button, etc.) |
| **Motion** | Framer Motion |
| **Hosting** | Vercel |
| **Repo** | GitHub at `danielherdenez-site` (to be created) |

### Conventions

- **Mobile-first responsive.** Build mobile breakpoints first; layer up via Tailwind's `md:` / `lg:` modifiers. The prototype's primary breakpoints are at `768px` and `1024px`.
- **Dark mode is the universal default.** Every new visitor lands in dark mode regardless of OS preference. Light mode is available via the toggle and persisted in `localStorage` under key `dh-theme`. The toggle flips a `data-theme` attribute on `<html>` — never use a class. `prefers-color-scheme` is intentionally ignored.
- **WCAG AA minimum.** All text/background pairings in the token table below meet 4.5:1 (body) or 3:1 (large text ≥ 18.66px bold / 24px regular). Don't introduce new colors without checking.
- **Reduced motion.** Honor `prefers-reduced-motion: reduce`. The prototype already disables animations and transitions globally under this query — match that behavior in Framer Motion via `useReducedMotion()`.

---

## Files to Generate

Mirror this structure in the Next.js app:

```
app/
├── layout.tsx              # <html data-theme> wrapper, fonts, theme bootstrap script
├── page.tsx                # Home — composes the section components in order
└── globals.css             # @import "tailwindcss"; @theme tokens; base styles

components/
├── ui/                     # shadcn primitives
│   └── button.tsx          # Primary + ghost button variants
├── sections/               # Page sections — each maps to one prototype section
│   ├── nav.tsx             # Sticky header with monogram, links, theme toggle
│   ├── hero.tsx            # Headline, sub, CTAs, drifting mesh background
│   ├── proof.tsx           # 3-tile hairline-divided row (Current / Focus / Background)
│   ├── work.tsx            # Section 01 — 3 case cards in offset grid
│   ├── about.tsx           # Section — narrow prose + ghost link
│   ├── writing.tsx         # Section 02 — 2 artifact cards
│   └── footer.tsx          # Monogram, nav, socials, mono copyright
└── shared/
    ├── theme-toggle.tsx    # Client component — toggles data-theme, persists to localStorage
    ├── monogram.tsx        # Lowercase "d" in Instrument Serif
    ├── eyebrow.tsx         # Mono label with optional accent dot
    ├── section-head.tsx    # Index ("01 — Work") + serif h2
    ├── reveal.tsx          # scroll-checked fade-up wrapper (CSS classes, no Framer)
    └── hero-mesh.tsx       # Animated radial gradients
```

### `app/layout.tsx` requirements

- Load Geist Sans, Geist Mono, and Instrument Serif via `next/font/local` (font files are in `/fonts` of this bundle — copy to `/public/fonts/` or use `next/font` import paths).
- Expose font families as CSS variables (`--font-sans`, `--font-serif`, `--font-mono`) on `<html>`.
- Render an **inline `<script>` before hydration** that reads `localStorage.getItem('dh-theme')` and applies `data-theme="light"` only if the user has previously chosen light. Dark is the default for all new visitors; `prefers-color-scheme` is intentionally ignored. This prevents a flash of wrong theme.
- Add `suppressHydrationWarning` to the `<html>` element, since the bootstrap script sets `data-theme` before React hydrates and intentionally differs from the server-rendered markup.
- `<meta name="color-scheme" content="dark light">` so form controls, scrollbars, etc. adapt.

### `app/globals.css` requirements

Use Tailwind v4's `@theme` to expose every token from `tokens/colors_and_type.css` as a Tailwind utility:

```css
@import "tailwindcss";

@theme {
  --color-bg-0: #0E0E0F;
  --color-fg-0: #F5F4F0;
  /* ...etc */
  --font-sans: 'Geist', ui-sans-serif, system-ui, sans-serif;
  --font-serif: 'Instrument Serif', ui-serif, Georgia, serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;
  --radius-md: 8px;
  /* ...etc */
}

/* Override tokens under light mode */
[data-theme="light"] {
  --color-bg-0: #F7F3EC;
  /* ...etc */
}
```

The complete token set is in `tokens/colors_and_type.css` — port every variable.

### Brand mark

The brand mark is a **lowercase "d" in Instrument Serif Regular**, used at:
- 32px in the sticky nav (`components/shared/monogram.tsx`)
- 32px in the footer left column
- Color: `var(--fg-0)` on hover transitioning to `var(--accent-fg)` (`120ms ease-out`)
- Letter-spacing: `-0.02em`

There is **no other logo lockup or icon**. Do not generate one.

---

## Screens / Views

### 0. Sticky Navigation

- **Position**: `sticky top-0 z-50`, full width, transparent on load.
- **Scroll behavior**: When `window.scrollY > 12`, applies a backdrop blur (`14px`), an 80%-opacity background mixed in OKLab from `--bg-0`, and a hairline border-bottom. Transitions `200ms ease-out`.
- **Layout**: `max-w-6xl` centered, padding `18px 48px` desktop / `16px 32px` mobile, flex row `space-between`.
- **Contents**:
  - **Left**: Lowercase "d" monogram (Instrument Serif, 32px, `var(--fg-0)`), links to `#top`.
  - **Center (desktop ≥720px only)**: `Work · About · Writing & Artifacts` — Geist Mono 13px, `var(--fg-2)`, with `gap-8`. Active link (scroll-spied via IntersectionObserver, `rootMargin: -45% 0px -45% 0px`) → `var(--fg-0)`.
  - **Right**: Theme toggle — 34×34px button, 1px `var(--hairline)` border, `var(--radius-md)` (8px). Sun (light mode) / Moon (dark mode) Lucide-style icons, 15×15px stroke 1.6. Hover: `var(--bg-2)` fill, `var(--hairline-strong)` border, `var(--fg-0)` icon.

### 1. Hero

- **Padding**: `clamp(96px, 16vh, 168px)` top / `clamp(96px, 14vh, 144px)` bottom.
- **Border-bottom**: 1px `var(--hairline)`.
- **Background**: Two slow-drifting radial gradients (sage accent at low opacity, blurred 60px). Animate via Framer Motion or pure CSS keyframes — durations 18s and 22s, both `cubic-bezier(0.65, 0, 0.35, 1)` infinite alternate. Disable under `prefers-reduced-motion`.
- **Eyebrow**: `available · summer 2026` — Geist Mono 12px, `var(--fg-2)`, with a 6×6px sage dot (4px sage-soft ring via `box-shadow`).
  > **Updated 2026-11-20.** The shipped eyebrow reads `New case studies · PitchCraft` and links to `/work` (updated 2026-11-25, Unit G; it read `New case study · PitchCraft` with a link to the single case before). The link inherits the eyebrow color and turns `var(--fg-0)` on hover; the dot and type are unchanged.
- **Headline (h1)**: Instrument Serif 400, `clamp(2.5rem, 5vw + 1rem, 5rem)`, line-height 1.02, letter-spacing -0.025em. `max-width: 22ch`. Exact copy:
  > **Product Manager. I turn complex problems into *shipped products*.**

  *"shipped products"* is wrapped in a `<span class="em">` with `font-style: italic` and `color: var(--accent-fg)`. The italic + sage treatment is approved — preserve it.
- **Sub**: Geist Sans 18px, line-height 1.65, `var(--fg-1)`, `max-width: 56ch`, margin-top `var(--space-8)`. Copy:
  > Currently at MindTechSourcing, building the foundation for AI agents on a traceability and workflow SaaS.
- **CTAs**: Margin-top `var(--space-10)` (40px), flex gap `var(--space-3)` (12px).
  - Primary: "Let's talk →" — `var(--accent-bg)` fill, `var(--accent-ink)` text, 12×18px padding, `var(--radius-md)`, Geist Sans 14px/500. Hover lifts `-1px` and shifts to `var(--accent-hover)`. Arrow translates `+2px` on hover.
  - Ghost: "LinkedIn ↗" / "GitHub ↗" — transparent, `var(--fg-1)`, Geist Mono 13px, padding 12×6px. Hover → `var(--fg-0)`. Arrow translates `+2px / -2px` on hover.

### 2. Proof tiles

- **Padding**: `var(--space-16)` top/bottom.
- **Border-bottom**: 1px `var(--hairline)`.
- **Grid**: 3 columns desktop (`md:`), 1 column mobile. **Not cards.** Tiles separated by `1px var(--hairline)` left-borders, padded `0 var(--space-8)`. First tile has no left padding, last no right.
- **Each tile**:
  - Label: Geist Mono 12px, `var(--fg-2)`, letter-spacing 0.08em, all-caps. Margin-bottom 12px. Values: `CURRENT`, `FOCUS`, `BACKGROUND`.
  - Value: Geist Sans 16px, line-height 1.2, `var(--fg-0)`, max 2 lines.
  - Copy:
    1. `CURRENT` → "Product Manager at MindTechSourcing"
    2. `FOCUS` → "Workflow platforms with native AI"
    3. `BACKGROUND` → "Industrial engineering, operations, lean"

### 3. Section 01 — Work

- **Section padding**: `var(--space-24)` / `var(--space-32)` desktop.
- **Section head**: Flex baseline-aligned row, gap `var(--space-8)`.
  - Index: `01 — Work` — Geist Mono 12px, `var(--fg-2)`, `min-width: 10ch`.
  - Heading: Instrument Serif 400, `clamp(1.75rem, 2.5vw + 1rem, 2.5rem)`, line-height 1.1, max `24ch`. Copy: **"What I'm building right now."**
- **Grid**: 12-col CSS grid on desktop.
  - Two cards per row: odd cards `col-start-1 col-span-6`, even cards `col-start-7 col-span-6`. Home and `/work` show the four cases as two rows of two (since 2026-11-25, Unit G).
  - Centered third card, `col-start-3 col-span-8` (offset on row 2): **only in a grid of exactly three cards**, which today is each case's "More work" (the other three cases). CSS: `.work-grid .case:nth-child(3):last-child`. A grid of four never centers its third card.
  - Gap: `var(--space-4)` (16px). Mobile: single column.
- **Each card**: `<a>` link, `var(--bg-2)` background, 1px `var(--hairline)` border, `var(--radius-lg)` (12px), padding `var(--space-8)` / `var(--space-10)` desktop. Flex column gap `var(--space-5)`, min-height 280px. (In light mode the border and shadow are overridden — see **Card hover** and **Colors — Light**.)
  - Hover: lifts `-2px`, background → `var(--bg-3)`, border → `var(--hairline-strong)`.
  - Stagger reveal-on-scroll with 0ms / 80ms / 160ms delays (Framer Motion `motion.a` with `whileInView`).
  - Meta line: `case · 01` — Geist Mono 12px, `var(--fg-2)`, letter-spacing 0.08em.
  - Title: Instrument Serif 400, `clamp(1.5rem, 1.4vw + 1rem, 2rem)`, line-height 1.12, `var(--fg-0)`, max `22ch`.
  - Description: Geist Sans 15px, line-height 1.65, `var(--fg-1)`, max `52ch`.
  - Foot: flex `space-between`, margin-top auto.
    - Tags: Geist Mono 12px `var(--fg-2)` separated by middot bullets `·` in `var(--fg-3)`.
    - "read →" / "view →": Geist Mono 12px `var(--accent-fg)`, gap expands `6 → 10px` on hover.

#### Card copy (exact)

| # | Meta | Title | Description | Tags |
|---|---|---|---|---|
| 1 | `case · 01` | "From workflow tool to AI agent platform" | "Leading the product evolution from a workflow management SaaS into the foundation for AI agent orchestration. Defining roadmap, metrics, and GTM." | Product strategy · AI agents · Since 2025 |
| 2 | `case · 02` | "Designing governance for a multi-product platform" | "Shaping the admin layer for a SaaS suite where multiple products share users, billing, and access. Evolving the early mockup into a coherent model for organization-level configuration and cross-product interactions that reduce friction across tools." | Platform · Governance · Since 2026 |
| 3 | `case · 03` | "How I use AI to do product work" | "A public library documenting the prompts, workflows, and frameworks I use to do PM work faster and better. Built in production, not theory." | Open source · GitHub · Since 2026 |

> **Note**: Card 3 meta is `case · 03` only — no "side project" descriptor. This was a deliberate edit.

### 4. About teaser

- **Border-top**: 1px `var(--hairline)`.
- **Section head**: Index `— About`, heading **"How I got here."** (Instrument Serif).
- **Body container**: `max-width: 42rem` (`max-w-2xl`).
- **About body**: Geist Sans 20px, line-height 1.55, `var(--fg-1)`. `<strong>` lifts to `var(--fg-0)` weight 500. Exact copy:
  > Industrial engineer by training. The first half of my career was about making complex operations work better. The second half is about building software products that do the same thing for other teams. Now I run product at **MindTechSourcing**, shipping workflow platforms with native AI.
- **Ghost link**: "More about me →" — Geist Mono 13px, `var(--accent-fg)`, hover → `var(--accent-hover)`, gap expands on hover.

### 5. Section 02 — Writing & Artifacts

- **Border-top**: 1px `var(--hairline)`.
- **Section head**: Index `02 — Writing & Artifacts`, heading **"Notes, frameworks, and works in progress."**
- **Grid**: 2 equal columns desktop, 1 column mobile, gap `var(--space-4)`.
- **Artifact cards**: Same styling as work cards (bg-2, hairline border, radius-lg, padding `var(--space-10)`, min-height 240px, same hover behavior). The same light-mode border/shadow override applies (see **Colors — Light**).
- **Cards**:
  1. Meta `repository · github` → "pm-ai-playbook" → "A public library documenting prompts, workflows, and frameworks for AI-assisted product management." → "View on GitHub ↗"
  2. Meta `essays · coming soon` → "Essays coming soon" → "Notes on AI product management, operations discipline, and how to ship software that earns trust." → "Reach out →"

### 6. Footer

- **Border-top**: 1px `var(--hairline)`. Padding `var(--space-16)` top, `var(--space-8)` bottom.
- **Grid**: 3 columns desktop (`1fr auto 1fr`), 1 column mobile.
  - Left: Lowercase "d" monogram (same as nav).
  - Center: `Work · About · Writing & Artifacts` — Geist Mono 13px, `var(--fg-2)`.
  - Right: 3 social icons (Email, LinkedIn, GitHub) — Lucide-style stroke icons, 20×20px, `var(--fg-2)`, 36×36px hit area, `var(--radius-md)`. Hover → `var(--fg-0)` + `var(--bg-2)` fill.
- **Bottom strip**: 1px hairline border-top, padding-top `var(--space-6)`, centered Geist Mono 12px `var(--fg-3)`. Copy:
  > © 2026 Daniel Herdenez · Built with Next.js · Deployed on Vercel

### 7. Case study pieces

Added 2026-11-20 with the PitchCraft case (split on 2026-11-25 into `/work/pitchcraft-v1-kaggle` and `/work/pitchcraft-v2-world-series`; both use these pieces). Tokens only, no new colors. Styles live in the "Case study pieces" block of `globals.css`.

Revised 2026-11-24 (Unit F, from the Unit E audit).

- **Facts line** (`.case-facts`): one line directly under the lead, Geist Mono 13px, `--fg-2`, wrapping naturally on a phone; its links follow the inline-link rule (section 8) and never break inside a link. Case 03's line is "Based on v1.0.0-kaggle · July 2026 · Open PitchCraft ↗ · GitHub ↗" and case 04's "Written at v2.2.0 · November 2026 · Open PitchCraft ↗ · GitHub ↗", both links in a new tab. It replaced the facts strip (`FactsStrip`, removed).
- **Back to Work** (`.ghost-link.back-link`): "← Work" sits above the eyebrow on every case, on the prose edge, with a 44px-high hit area. No separate CTA row after the title.
- **Cover** (art direction): on both PitchCraft cases (`CaseCover`, `src/components/shared/case-cover.tsx`), below `768px` the cover is a crop of the phone capture at full prose width (case 04 `pitchcraft-game5-cover-phone.webp`, case 03 `pitchcraft-v1-cover-phone.webp`, both 750×1612); from `768px` the desktop capture. A `<picture>` built with `getImageProps`, so only the selected source downloads; each `<source>` carries its own width/height. The cover wrapper is `.prose-wide` (52rem) and has no top margin.
- **Framed figure** (`CaseFigure`): `figure` with a mono caption (12px, `--fg-2`, max `64ch`). Default body is a card: `--bg-2`, 1px `--hairline`, `--radius-lg`, padding `--space-6` (`--space-8` from `768px`). `bare` drops the frame for screenshots, which get a hairline and `--radius-md`. Light mode border uses the same sage `#DDE7E2` as the cards.
- **Before/after pair** (`.before-after`): two phone captures cut to the **same height and scale** (946 CSS px at 375px wide: `pitchcraft-game5-before-crop.webp` 375×946 at 1×, and the 750×1892 after capture at 2×), so they end on one line. Side by side from `768px` (max `40rem`), stacked full width below. Mono uppercase labels "Before" / "After". Originals stay in `public/work/pitchcraft-v2-world-series/`.
- **Pipeline figure** (`PitchcraftPipeline`): ordered list of steps sized by its figure, not the viewport (container query): a stacked card per step when the frame is under `30rem`, one row per step from `30rem` (index `2rem`, name `8.5rem`, text). Step: `--bg-1` (light: `--bg-0`), 1px `--hairline`, `--radius-md`. Steps 3 and 4 ("Write and check", "Validate") use an `--accent-fg` border to mark where claims are checked.
- **Unit-chart figures** (`PitchcraftEval`): two panels (3fr / 2fr from `768px`). The two states differ in **shape as well as color**: an unmarked unit is an outlined square (transparent, 2px `--fg-2` outline, well over 3:1 on `--bg-2`); a marked unit (error / unsupported) is a filled `--accent-fg` circle (a filled pill for the 36×48 report units). Sentence units 18px. The legend repeats both shapes at 10px. The ARIA labels carry the totals. The big number is Instrument Serif 28px; the legend is mono 12px.

### 8. Inner pages (About, Work, cases)

Added 2026-11-24 (Unit F).

- **Top spacing** (`.page-hero`): one shared top padding so the first line sits close under the bar and every inner page starts at the same height: `--space-12` (48px, same as the mobile home hero) below `768px`, `--space-20` from `768px`, `--space-24` from `1024px`. Bottom padding unchanged.
- **/work**: the card section has no top padding after the hero (`.page-hero + .work`), so the hero's bottom padding is the only gap before the first card.
- **Prose measure**: narrative prose uses the site measure `.prose-narrow` (42rem at 20px: longest measured lines 76–79 characters, down from 87–96 at 52rem) on About and all cases, including the chapter column. Wide screenshots opt into `.prose-wide` (52rem).
- **Chapter labels** (`.stage-label`): desktop keeps the right rail, but labels start at one shared left edge `--space-12` past the prose column instead of hugging the far right. A chapter that opens on a pull quote centres its label on the quote's first line. Below `768px` the label sits on the prose's left edge, directly above its block (`--space-3`).
- **Inline links in prose** (`.about-prose`, `.about-body`, `.case-facts`, `.case-sources`, unclassed `<a>`): `--accent-fg`, persistent 1px underline at `0.22em` offset, `--accent-hover` on hover. Buttons and ghost links keep their own treatment.

---

## Interactions & Behavior

### Theme toggle
- Reads `localStorage.dh-theme`. Dark is the universal default; light activates only if the user has previously toggled it. `prefers-color-scheme` is not used.
- Sets/removes `data-theme="light"` on `<html>`.
- Persists choice immediately on click.
- **No-flash bootstrap**: Inline script in `<head>` before any rendering. `<html>` carries `suppressHydrationWarning` so React ignores the intentional server/client `data-theme` mismatch.
- Background and color transitions: `200ms ease-out` (handled globally on `html, body` in `globals.css`).

### Sticky nav
- Plain transparent on load.
- Adds class `.scrolled` when `window.scrollY > 12`.
- `.scrolled` applies `backdrop-filter: blur(14px)`, `background: color-mix(in oklab, var(--bg-0) 80%, transparent)`, and a `1px var(--hairline)` bottom border.

### Scroll-spy
- IntersectionObserver on `#work`, `#about`, `#writing` with `rootMargin: '-45% 0px -45% 0px'`. Whichever section's bounds intersect the middle 10% of the viewport gets `.active` applied to its matching nav link.

### Reveal-on-scroll
- All `<section>` elements except `.hero` fade-up on enter.
- From `{opacity: 0, y: 16}` to `{opacity: 1, y: 0}`, duration 700ms, `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Updated 2026-11-25:** the original 0.05 threshold and `-10%` bottom margin (Framer `whileInView`) are gone since Unit F. `Reveal` (`src/components/shared/reveal.tsx`) checks the live layout on each scroll frame: after the reader first scrolls, a block whose top is still below the viewport, within a quarter of a viewport (`ARM_BAND = 0.25`), is armed (hidden); it plays as soon as its top crosses the bottom edge, with no margin, or after a 1200ms failsafe. Blocks already seen are never armed. Trigger once.
- Under `prefers-reduced-motion: reduce` (or OS animation settings disabled), content renders in its final state with no fade. This is intended behavior, not a bug.

### Card hover
- `transform: translateY(-2px)`, transition `200ms ease-out`.
- Background fades `bg-2 → bg-3`.
- Border fades `hairline → hairline-strong`.
- **Light mode override**: cards use a desaturated-sage border instead of the hairline, plus a soft shadow. Border fades `#DDE7E2 → #CFE0D8` on hover; shadow is `0 1px 3px rgba(74, 107, 95, 0.06)`. Scoped to `[data-theme="light"] .case` and `[data-theme="light"] .artifact` (and their `:hover`) so dark-mode card styling is untouched. See **Colors — Light**.
- "read →" arrow gap expands from `6px → 10px`.

### Hero mesh animation
- Two pseudo-elements, blurred `60px`, sage-accent radial gradients.
- Pseudo `::before`: 18s alternate, `translate(-6%, -4%) scale(1) → translate(6%, 6%) scale(1.1)`.
- Pseudo `::after`: 22s alternate-reverse, `translate(4%, 6%) scale(1.05) → translate(-6%, -4%) scale(0.95)`.
- Easing: `cubic-bezier(0.65, 0, 0.35, 1)`.
- Disable under `prefers-reduced-motion`.

### Reduced motion
- All animations and transitions clamp to `0.001ms` under `(prefers-reduced-motion: reduce)`. Global rule lives in `globals.css`.

---

## State Management

The home page is **stateless on the server**. The only client state is:

- **Theme** — `data-theme` attribute on `<html>`, mirrored to `localStorage.dh-theme`. Read once on mount.
- **Scrolled** — boolean flag in the nav component, derived from `window.scrollY`.
- **Active section** — derived from IntersectionObserver in the nav.

No data fetching. No server state. Render the page as static (`export const dynamic = 'force-static'` is fine).

---

## Design Tokens

The complete source of truth is `tokens/colors_and_type.css` in this bundle. Highlights:

### Colors — Dark (default)

| Token | Value | Use |
|---|---|---|
| `--bg-0` | `#0E0E0F` | Page background |
| `--bg-1` | `#131315` | Raised surface |
| `--bg-2` | `#1A1A1C` | Card background |
| `--bg-3` | `#232326` | Hover / inset |
| `--fg-0` | `#F5F4F0` | Primary text (warm off-white) |
| `--fg-1` | `#C9C7C0` | Secondary text |
| `--fg-2` | `#8F8D86` | Tertiary / meta |
| `--fg-3` | `#7D7C77` | Disabled / placeholder |
| `--hairline` | `rgba(245, 244, 240, 0.08)` | Dividers, borders |
| `--hairline-strong` | `rgba(245, 244, 240, 0.14)` | Hover borders |
| `--accent-fg` | `#7B9F92` | Sage accent text/link |
| `--accent-bg` | `#7B9F92` | Sage accent fill |
| `--accent-ink` | `#0E0E0F` | Text on accent fill |
| `--accent-soft` | `rgba(123, 159, 146, 0.12)` | Soft sage tint |
| `--accent-hover` | `#8FB0A4` | Accent hover state |

> **Updated 2026-09-05.** `--fg-3` was raised from `#5C5B56` to `#7D7C77`. At the original value it scored 2.84:1 against `--bg-0`, below the 4.5:1 this document requires for body text. It is used by `.foot-bottom` and by the middot separators in card tags.

### Colors — Light

> **Updated 2026-05-29.** Surfaces moved from a neutral warm-white/sand palette to a warm cream background with sage-tinted cards. Separation is carried by warm/cool temperature contrast (cream background vs. cool sage cards), a desaturated-sage card hairline, and a soft shadow — not by darker surfaces or heavy borders.

| Token | Value | Use |
|---|---|---|
| `--bg-0` | `#F7F3EC` | Page background (warm cream) |
| `--bg-1` | `#FBF8F3` | Raised surface (warm off-white) |
| `--bg-2` | `#EDF2F0` | Card background (sage tint) |
| `--bg-3` | `#E2EDE8` | Card hover (deeper sage tint) |
| `--fg-0` | `#1A1A1C` | Primary text |
| `--fg-1` | `#3F3E3A` | Secondary text |
| `--fg-2` | `#62615B` | Tertiary / meta |
| `--fg-3` | `#706E66` | Disabled / placeholder |
| `--hairline` | `rgba(26, 26, 28, 0.08)` | Dividers, borders (nav, hero, proof, sections) |
| `--hairline-strong` | `rgba(26, 26, 28, 0.14)` | Hover borders (non-card) |
| `--accent-fg` | `#4A6B5F` | Sage accent text/link |
| `--accent-bg` | `#4A6B5F` | Sage accent fill |
| `--accent-ink` | `#FAFAF7` | Text on accent fill |
| `--accent-soft` | `rgba(74, 107, 95, 0.10)` | Soft sage tint |
| `--accent-hover` | `#3E5A50` | Accent hover state |

> **Updated 2026-09-05.** `--fg-3` was darkened from `#A3A199` to `#706E66` (it scored 2.34:1 against `--bg-0`), and `--fg-2` from `#6F6E68` to `#62615B` so the text ramp stays ordered once `--fg-3` moved up. Both now clear 4.5:1 on `--bg-0` and on the card surfaces.

**Light-mode card treatment (cards only).** Work cards (`.case`) and artifact cards (`.artifact`) override the default hairline border in light mode and add a soft shadow. Dark mode is unchanged.

| Property | Value |
|---|---|
| Card border | `#DDE7E2` (1px, desaturated sage) |
| Card border (hover) | `#CFE0D8` |
| Card shadow | `0 1px 3px rgba(74, 107, 95, 0.06)` |

Implemented as light-only overrides scoped to `[data-theme="light"] .case` / `[data-theme="light"] .artifact` (plus `:hover`):

```css
[data-theme="light"] .case,
[data-theme="light"] .artifact {
  border-color: #DDE7E2;
  box-shadow: 0 1px 3px rgba(74, 107, 95, 0.06);
}
[data-theme="light"] .case:hover,
[data-theme="light"] .artifact:hover {
  border-color: #CFE0D8;
}
```

### Typography

| Family | Use |
|---|---|
| Instrument Serif (400) | Display: `h1`, section `h2`, card titles, monogram |
| Geist Sans (400 / 500 / 600 fallback to 500) | UI, body, buttons |
| Geist Mono (400 / 500) | Meta, labels, index numbers, footer copyright |

Type scale (rem-based on 16px root):

```
--fs-12: 0.75rem   /* 12px */
--fs-13: 0.8125rem /* 13px */
--fs-14: 0.875rem  /* 14px */
--fs-15: 0.9375rem /* 15px */
--fs-16: 1rem      /* 16px */
--fs-18: 1.125rem  /* 18px */
--fs-20: 1.25rem   /* 20px */
--fs-24: 1.5rem    /* 24px */
--fs-32: 2rem      /* 32px */
--fs-48: 3rem      /* 48px */
--fs-72: 4.5rem    /* 72px */
```

### Spacing (4px base, Tailwind-compatible)

```
--space-1: 4px      --space-10: 40px
--space-2: 8px      --space-12: 48px
--space-3: 12px     --space-16: 64px
--space-4: 16px     --space-20: 80px
--space-5: 20px     --space-24: 96px
--space-6: 24px     --space-32: 128px
--space-8: 32px
```

### Radii

```
--radius-xs: 4px    --radius-lg: 12px
--radius-sm: 6px    --radius-xl: 16px
--radius-md: 8px    --radius-full: 999px
```

### Motion

```
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1)
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)
--dur-fast:    120ms
--dur-base:    200ms
--dur-slow:    400ms
--dur-mesh:    18s
```

### Containers

```
--container-prose:   48rem  (max-w-3xl)  /* body prose */
--container-default: 72rem  (max-w-6xl)  /* page max width */
--nav-height:        68px                 /* sticky nav; anchors offset by this */
```

---

## Assets

This bundle includes:

- `fonts/Geist-Regular.woff2`
- `fonts/Geist-Medium.woff2`
- `fonts/GeistMono-Regular.woff2`
- `fonts/GeistMono-Medium.woff2`
- `fonts/InstrumentSerif-Regular.ttf`

Load via `next/font/local` in `app/layout.tsx`:

```ts
import localFont from 'next/font/local';

const geistSans = localFont({
  src: [
    { path: '../public/fonts/Geist-Regular.woff2', weight: '400' },
    { path: '../public/fonts/Geist-Medium.woff2', weight: '500' },
  ],
  variable: '--font-sans',
  display: 'swap',
});
// ...etc for Geist Mono and Instrument Serif
```

> Note: there is no Geist SemiBold (600) in the bundle. The prototype substitutes Medium (500) for 600 with `font-weight: 600` (synthesized). If you want a true 600, source `Geist-SemiBold.woff2` separately.

**No image assets, icons, or logos are required for the home page.** The "d" monogram is text-rendered. Social icons are inline SVG (Lucide-style). The hero mesh is pure CSS radial gradients.

---

## Screenshots

In `/screenshots/`:

- `home-dark-01-hero.png` through `home-dark-05-footer.png` — five section captures of dark mode (default).
- `home-light-01-hero.png` through `home-light-05-footer.png` — five section captures of light mode.

These are captured at 909×540 each from the prototype iframe. Use them for visual reference; the source of truth for the home page is the shipped site itself (`src/app/page.tsx` and `src/app/globals.css`). `Home.html` at the repo root is the original prototype, kept for reference; the `design_references/` folder named in the original handoff does not exist in this repo.

> Note: the light-mode screenshots in this bundle predate the 2026-05-29 palette revision and show the original warm-white/sand surfaces. The current live light mode uses the cream + sage palette documented in **Colors — Light**.

---

## Files in this bundle

```
design_handoff_home/
├── README.md                          # This file
├── design_references/
│   ├── Home.html                      # Full prototype, dark default, theme toggle
│   └── design/
│       ├── colors_and_type.css        # Token source
│       └── fonts/                     # Bundled font files (referenced by CSS)
├── tokens/
│   └── colors_and_type.css            # Same file, standalone — port to globals.css
├── fonts/                             # Same font files, top-level for easy import
│   ├── Geist-Regular.woff2
│   ├── Geist-Medium.woff2
│   ├── GeistMono-Regular.woff2
│   ├── GeistMono-Medium.woff2
│   └── InstrumentSerif-Regular.ttf
└── screenshots/                       # 10 section captures, dark + light
    ├── home-dark-01-hero.png
    ├── home-dark-02-work.png
    ├── home-dark-03-about.png
    ├── home-dark-04-writing.png
    ├── home-dark-05-footer.png
    ├── home-light-01-hero.png
    ├── home-light-02-work.png
    ├── home-light-03-about.png
    ├── home-light-04-writing.png
    └── home-light-05-footer.png
```

---

## Open questions for next handoff

These are intentionally left for follow-up — do not invent them:

- Case study detail page (`/work/[slug]`) — design TBD.
- About page (`/about`) — design TBD.
- Writing index + post template (`/writing`, `/writing/[slug]`) — design TBD.
- Email collection (newsletter / contact form) — not in scope for V1.
- Analytics provider — to be specified.

Ship the home page first, deploy to Vercel, then iterate.
