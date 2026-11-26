# PitchCraft cases: reference captures (2026-11-25)

Captured for Unit G, which split PitchCraft into two case studies. Rule: `AGENTS.md`, "Capturas de cambios mayores".

## PitchCraft v1.0.0-kaggle, rebuilt

| File | What it shows |
|---|---|
| `pitchcraft-v1.0.0-kaggle-rebuild-1280.webp` | The Kaggle version's home page (cached demo: games strip, PIT @ WSH matchup report, critic review, agent steps, archive), full page at 1280 px. |
| `pitchcraft-v1.0.0-kaggle-rebuild-390.webp` | The same page at 390 px. |

- Source: tag `v1.0.0-kaggle` of `Dher10/pitchcraft-agent`, commit `e32744a82defb41abb7c4675d3712695c00ba7da` (4 July 2026).
- Exported with `git -C C:\Dev\pitchcraft-agent archive v1.0.0-kaggle` into `C:\Dev\audits\pitchcraft-v1-build\`, outside both repositories; nothing was checked out in pitchcraft-agent, and its working tree was clean afterwards. Built with `npm install` and `npm run build` (Next.js 16.2.9, exit 0), served locally and captured on 25 November 2026.
- The data is the tag's own cached demo snapshot, as submitted in July.
- The case 03 cover (`public/work/pitchcraft-v1-kaggle/pitchcraft-v1-desktop.webp`, `pitchcraft-v1-cover-phone.webp`) and share image (`og.png`) come from this rebuild.

## Final case pages on danielherdenez.com

| File | What it shows |
|---|---|
| `pitchcraft-v1-kaggle-1280.webp` | `/work/pitchcraft-v1-kaggle`, full page at 1280 px, dark theme. |
| `pitchcraft-v1-kaggle-390.webp` | The same page at 390 px. |
| `pitchcraft-v2-world-series-1280.webp` | `/work/pitchcraft-v2-world-series`, full page at 1280 px, dark theme. |
| `pitchcraft-v2-world-series-390-part1.webp`, `-part2.webp` | The same page at 390 px, split in two halves: the full page (16,626 px) exceeds WebP's 16,383 px limit. |

- Source: branch `dev`, the Unit G commits that add this folder (production build, `next start`), captured on 25 November 2026 with reduced motion.
