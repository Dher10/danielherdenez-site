# PitchCraft v1 · Kaggle — Case 03

**Editorial baseline:** 25 November 2026 · **Language:** English

**Route:** `/work/pitchcraft-v1-kaggle`  
**Historical cut:** `v1.0.0-kaggle`  
**Card label:** `case · 03`  
**Card name:** PitchCraft v1 · Kaggle

The content below is the page copy. Square brackets indicate implementation notes, not visible text. Markdown links identify the intended destinations; use the existing site link styling.

---

Eyebrow: PitchCraft v1 · July 2026

# Building a scouting product around verifiable claims

PitchCraft started as an idea to help baseball fans understand the game through its statistics. I turned it into a working scouting product in seven days for Kaggle's AI Agents Intensive.

Based on v1.0.0-kaggle · July 2026 · [Open PitchCraft](https://pitchcraft-agent.vercel.app/) ↗ · [GitHub](https://github.com/Dher10/pitchcraft-agent/tree/v1.0.0-kaggle) ↗

[Cover image: see handoff; historical v1 assets only, or use an explicitly labeled illustration of the current product. Do not reuse the October screenshot as a July screenshot.]

## [label: The idea]

Baseball is played one pitch at a time, and even with the recent rule changes to speed up the game, it can still feel slow. That pace is part of what draws me to it.

When people close to me asked about baseball, I often found myself explaining the statistics before I could explain the game. Baseball has a number for almost everything, and those numbers can tell you a great deal about what's happening on the field. For someone new to the sport, though, they can be difficult to make sense of. ERA, wRC+, FIP. What do any of those numbers tell you about the game you're about to watch?

After enough of those conversations, I began thinking about a way to help people learn to watch baseball, to train their eye for what's happening on the field. Starting pitchers gave me a place to begin: what each one throws, how he uses those pitches, and how the opposing lineup has performed against left- or right-handed pitching.

Much of that information is publicly available, but it lives in dashboards built for analysts. I wanted to bring it together in a report that a fan could read before a game. Something that explains the matchup without predicting the outcome or getting into betting.

The idea had been on my mind for a while. When I signed up for Kaggle's AI Agents Intensive, the capstone competition gave me a reason to build it.

## [label: Seven days]

The first commit went in on June 28, and I finished the submission on July 4. I planned each milestone with Claude, while Codex and Claude Code wrote the code.

With seven calendar days to build it, I had to decide how much information the product actually needed. An analysis of confirmed lineups would have made each report more specific, but team performance against left- and right-handed pitching was enough to explain the matchup. Detailed statistical tables would have added information at the cost of bringing the experience closer to the dashboards I was trying to simplify.

I also kept the data refresh manual and prepared a cached snapshot for the submission. The demonstration could then run without depending on a live request.

## [label: Verifiable claims]

One of the early ideas was a composite metric for pitching quality. A single number would have made it easier to compare two starters, but anyone who wanted to understand that number would have had to rely on my own definition of it. I dropped the composite metric and used labeled Statcast figures instead.

For grading a pitcher's performance after a game, I adopted Bill James's Game Score. The formula was already public, and I documented the letter grade on top of it as a way to make the result easier to read.

The same concern shaped the reporting pipeline. Five agents gathered the data, analyzed the matchup, assembled the report, checked its claims and graded completed games. None used a language model at runtime. Given the same inputs, they produced the same outputs.

The critic was the part I most wanted to demonstrate. In the worked demo, I deliberately included a claim that would fail one of its checks. The report identified a changeup as a pitcher's put-away pitch, even though he threw it only 12% of the time, below the 15% threshold defined in the critic's rules.

The critic flagged the claim for revision and showed the evidence on the page. A reader could see why it had been challenged without having to take the report at face value.

## [label: The first version]

The visual design came from a mockup I developed with Claude Design. Team colors and badges gave each matchup its own identity within a consistent interface. For a product built around a single daily view, that was enough.

By the submission deadline, I had a public application that could fetch matchup data, turn it into a readable scouting report and show how its claims were checked. The original version remains available in the repository under the Kaggle release tag.

I came back to PitchCraft in October to see whether it could run every day during the postseason and whether a language model could improve the reports. That work is documented in [From a Kaggle capstone to a live baseball product](/work/pitchcraft-v2-world-series).

> I wanted a report that a fan could read before a game and check against the numbers behind it. [closing statement]

CTA: [Open PitchCraft](https://pitchcraft-agent.vercel.app/) ↗ · [Read the Kaggle write-up](https://github.com/Dher10/pitchcraft-agent/blob/v1.0.0-kaggle/docs/KAGGLE_WRITEUP.md) ↗

## Project notes and sources

The motivation, early product decisions and July workflow come from my own notes.

- [Kaggle write-up](https://github.com/Dher10/pitchcraft-agent/blob/v1.0.0-kaggle/docs/KAGGLE_WRITEUP.md)
- [Original Kaggle version](https://github.com/Dher10/pitchcraft-agent/tree/v1.0.0-kaggle)
- [Original reporting pipeline](https://github.com/Dher10/pitchcraft-agent/tree/v1.0.0-kaggle/agents)

---

## Card copy (not page body)

**Name:** PitchCraft v1 · Kaggle  
**Title:** Building a scouting product around verifiable claims  
**Description:** Turning a personal idea into a baseball scouting product in seven days, with a deterministic agent pipeline and a fact-checking mechanism.  
**Link:** `/work/pitchcraft-v1-kaggle`
