# PASS

Independent Unit F round 2 verification of `17efcd5` on `dev`, 24 November 2026. Read the previous Codex FAIL and the round 2 design-fixes notes. Chromium captures, four PDFs and rendered PDF pages are in `%TEMP%\unit-f-round2-trTxrb`.

- **Production build and teardown — PASS.** Ran `npm run build` (exit 0), served with `next start` on `127.0.0.1:3177`, then stopped it and confirmed the port had no listener.
- **About at y≈817 — PASS.** Confirmed the chapter group was armed below the fold, then placed its layout top at y≈817. Manufacturing's heading and opening paragraph reached effective opacity 1 within 1.05 s at 390 × 844 and 1280 × 900 in both themes with standard motion.
- **About rapid scroll down and back — PASS.** Jumped from the armed chapter group to the document bottom and immediately back to y=0. No block was left armed, and all four chapter headings and their paragraphs reached effective opacity 1 at both widths in both themes.
- **PitchCraft fresh print — PASS.** Generated a PDF directly from each fresh load before scrolling at both widths in both themes. Visually confirmed the Before and After images on pages 10 and 11 of each 390 px PDF and together on page 7 of each 1280 px PDF.
- **Before alt text — PASS.** Compared the rendered image's alt attribute with the actual crop. The matchup headline and both starters' season stats are visible, and the alt no longer claims a list of games.
- **Short viewport — PASS.** At 1280 × 360 in both themes, armed the 1,504 px-tall About chapter group, stopped with its layout top at y≈333, and then centered each chapter heading in turn. The headings and paragraphs reached effective opacity 1 and stayed visible on return to the top.
- **Page regression — PASS.** Checked 28 Chromium views across Home, About, Work, Veflo Trace, Internal Platform, PitchCraft and 404 at 390 and 1280 px in both themes. Reviewed full-page captures and verified the expected HTTP status, one visible H1, no horizontal document overflow or page exceptions, decoded images, visible reveal content before and after scrolling, and the 404 recovery link.
