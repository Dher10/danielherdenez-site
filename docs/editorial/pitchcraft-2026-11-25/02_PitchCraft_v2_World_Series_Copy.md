# PitchCraft v2 · World Series — Case 04

**Editorial baseline:** 25 November 2026 · **Language:** English

**Route:** `/work/pitchcraft-v2-world-series`  
**Historical cut:** `v2.2.0` · November 2026  
**Card label:** `case · 04`  
**Card name:** PitchCraft v2 · World Series

The content below is the page copy. Square brackets indicate implementation notes, not visible text. Markdown links identify the intended destinations; use the existing site link styling.

---

Eyebrow: PitchCraft v2 · November 2026

# From a Kaggle capstone to a live baseball product

After building PitchCraft for a Kaggle competition, I returned to the project to publish daily scouting reports, evaluate a language model as the report writer and develop a product that would remain useful beyond the baseball season.

Written at v2.2.0 · November 2026 · [Open PitchCraft](https://pitchcraft-agent.vercel.app/) ↗ · [GitHub](https://github.com/Dher10/pitchcraft-agent/tree/fd96889) ↗

[Cover image: retain the existing v5 cover, if it accurately represents this stage.]

## [label: Coming back to PitchCraft]

PitchCraft started as [my capstone for Kaggle's AI Agents Intensive](/work/pitchcraft-v1-kaggle). The idea was to help baseball fans understand starting-pitcher matchups through readable scouting reports backed by public data. I built the first version in seven days with AI coding agents, using a deterministic pipeline and a critic that checked its claims against the data.

The capstone worked, but refreshing its data required a manual command. I wanted the reports to be available every day during the postseason. I also wanted to put something I had been learning about AI products into practice: how to evaluate whether a language model could improve an existing product.

Those two goals brought me back to PitchCraft in October.

## [label: Live for the World Series]

Before starting on new features, I defined how the development work would happen. The repository got a PRD, a decision log, an evaluation spec and written instructions for the coding agents. One agent writes at a time, following a plan I approve. Another reviews the changes in a fresh session, without access to the first agent's reasoning. Decisions outside the agreed scope come back to me.

The first independent QA review found six blockers. Among them was a problem that went directly against the original idea behind PitchCraft: some real pitchers were still being shown with demo data.

That led me to define eight rules that the daily data file had to satisfy before publication. One of them is "unknown is never zero." When a value is missing, the page says so. The scouting statistics also stop at the day before the game, so a preview cannot draw on information that became available afterward.

The postseason was coming to an end, and waiting for the language model evaluation would have meant missing the chance to publish during the season. I decided to release the rules-based reports first and make the new writer a separate release decision, subject to its evaluation results.

The daily job published its first update on October 23, for Game 1 of the World Series.

[Figure 1: daily pipeline]

Caption: A scheduled job fetches the data and the agents write the report. The critic checks its claims, and the job validates the file against the data contract before it publishes.

## [label: Testing an AI writer]

The rules-based reports were doing their job, but their sentences could feel repetitive. I wanted to see whether a language model could make the report read more like someone explaining a game.

To keep the analysis grounded, I separated the facts from the writing. Gemini received a structured table of facts and had to cite them in each sentence. Automated checks verified those references and assessed the resulting claims.

Before the development run, I had set a threshold for continuing with the original evaluation plan: at least five of ten reports had to pass the checks.

Four passed.

Continuing to adjust the writer might have improved that number, but the pass rate alone could not tell me whether the problem was in the writing or in the checks themselves. To understand that, I manually labeled 348 sentences against their source facts, 113 from development and 235 from a separate test set that had not been used for tuning.

In the test set, I found no incorrect numbers or names. The errors came from what the model inferred from the data. One sentence described the two starting pitchers as having different primary pitches, even though the fact table listed a four-seam fastball for both.

The automated checks struggled with those distinctions. They flagged 40 test sentences, of which 36 had support in the data. Three of the five test reports that passed the checks still contained an unsupported sentence.

[Figure 2: writer evaluation, two panels]

Caption: Test set of the writer evaluation, labeled by me.

> The guardrails that prevent invention are what flatten the voice. [pull quote]

I also evaluated a language model as a judge. It agreed with my labels on 79.6% of the test sentences, below the 85% target. Because most sentences were supported, a judge that answered "supported" every time would have reached 94.5%. The model identified five of the 12 errors I had labeled.

There was still a question about the reading experience itself. While working through individual sentences, I had come to prefer the model's prose. When I compared 11 pairs of complete reports, however, my choices went in opposite directions across the development and test sets. I was the only reader, I could recognize the model's style, and the rules-based reports were about 25% longer.

> The LLM writes better sentences but says less. [serif beat]

I kept the rules-based writer in production. I liked the model's writing, but I had no reliable way to catch its remaining errors, and the comparison of complete reports had given me little evidence that it would make PitchCraft better for a fan.

## [label: A product between seasons]

When the World Series ended, PitchCraft had nothing left to preview. I wanted the product to remain useful between seasons, so the home page became a season in review and the archive became the center of the experience.

Each of the 40 postseason games has its own page with the final score, both starters' final lines and a matchup report. The page identifies whether the report was published before the game or reconstructed afterward using data through the day before it was played.

Thirty of those games qualify as notable under defined rules covering strikeout duels, veteran matchups, series-ending games and World Series games. Those reasons also work as filters, giving fans a way to find the games they are interested in revisiting.

The mockup from July was no longer enough for a product with several pages. After an agent audited the existing interface, I worked with Claude Design on a new identity inspired by a ballpark scoreboard. This time, I approved a written design system before any new page was built, so the coding agents had a shared reference for components, layouts and content.

Version 2.1.0 shipped the new experience on November 17.

[Figure 3: before and after on a phone]

Caption: World Series Game 5 in the daily view and in the postseason archive. The left view was recreated in November from the file published on October 28.

## [label: How it ships]

The development process I established in October now extends to each release. Claude Code writes the code, Codex audits each phase against a written QA protocol, and Gemini in Antigravity checks the preview build. I decide when a release is ready to merge. The data audit before the November release alone found 17 issues.

Every code merge into the main branch is a versioned release with its own notes. Daily data updates follow a separate path through GitHub Actions, with a publication script that rejects changes outside the allowed data directories.

## [label: What I learned]

PitchCraft gave me a practical understanding of CI/CD, agentic development and QA, and of how those disciplines affect the decisions I make as a product manager.

The evaluation was particularly useful to me. By the time it was over, I had grown to like the model's writing. Having defined the conditions for release before seeing the results gave me a way to make that decision without relying on my own preference.

## [label: What's next]

This case stops at version 2.2.0. The next stage is planned for February, with more attention to how a fan learns about the game through PitchCraft. I want to provide explanations alongside individual statistics and give each pitcher a page of his own.

I also want to revisit how the reports are written. The approach I intend to test is to have the code identify the important aspects of a matchup and give them to the language model as facts it can cite. That would give the writer more to work with while keeping the analysis grounded in the data.

I'm also exploring a chat-style way for fans to ask PitchCraft questions about a matchup.

When that stage ships, it will have its own write-up.

> I built PitchCraft because I like baseball and wanted to see how far a contest idea could go with AI at my side. [closing statement]

CTA: [Open PitchCraft](https://pitchcraft-agent.vercel.app/) ↗ · [Read the decision log](https://github.com/Dher10/pitchcraft-agent/blob/fd96889/docs/DECISIONS.md) ↗

## Project notes and sources

The motivation and the July workflow come from my own notes.

- [Kaggle write-up](https://github.com/Dher10/pitchcraft-agent/blob/v1.0.0-kaggle/docs/KAGGLE_WRITEUP.md)
- [Product requirements](https://github.com/Dher10/pitchcraft-agent/blob/fd96889/docs/PRD_v2.md)
- [Decision log](https://github.com/Dher10/pitchcraft-agent/blob/fd96889/docs/DECISIONS.md)
- [Rules for the coding agents](https://github.com/Dher10/pitchcraft-agent/blob/fd96889/AGENTS.md)
- [Data contract](https://github.com/Dher10/pitchcraft-agent/blob/fd96889/docs/DATA_CONTRACT.md)
- [Writer evaluation results](https://github.com/Dher10/pitchcraft-agent/blob/fd96889/docs/results-planB.md)
- [Case-study notes](https://github.com/Dher10/pitchcraft-agent/blob/fd96889/docs/case-study-notes.md)
- [QA reports](https://github.com/Dher10/pitchcraft-agent/tree/fd96889/docs/qa)
- [Design system](https://github.com/Dher10/pitchcraft-agent/tree/fd96889/docs/design)
- [Release notes](https://github.com/Dher10/pitchcraft-agent/tree/fd96889/docs/releases)

---

## Card copy (not page body)

**Name:** PitchCraft v2 · World Series  
**Title:** From a Kaggle capstone to a live baseball product  
**Description:** Taking PitchCraft into production, evaluating a language model as its writer and redesigning the experience for the off-season.  
**Link:** `/work/pitchcraft-v2-world-series`
