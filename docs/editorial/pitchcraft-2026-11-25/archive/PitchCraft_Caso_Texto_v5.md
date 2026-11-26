# PitchCraft case study: page text v5

Page: danielherdenez.com/work/pitchcraft · English · 25 Nov 2026
Status: for editor review (v5). Rewrite of v4 for narrative flow, like cases 01 and 02, with a new personal introduction written from Daniel's own draft. Same facts and numbers as v4 in the rest of the case. The last section changed on 25 Nov from "Still open" to "What's next": this case is the cut at v2.2.0, and a later article will cover the next stage.
Layout notes in square brackets are not copy. [label] = the mono chapter label in the right margin.

---

Eyebrow: PitchCraft · Since June 2026

# From a Kaggle capstone to a live baseball product

PitchCraft explains MLB starting-pitcher matchups in plain language. I started it as a Kaggle capstone and launched daily reports for the World Series. After testing a language model as the report writer, I kept the reports rules-based.

Written at v2.2.0 · November 2026 · Open PitchCraft ↗ · GitHub ↗

[Cover image]

## [label: The idea]

Baseball is an interesting game. It's played one pitch at a time, and it takes as long as it takes. Even after the recent rule changes to speed it up, plenty of people still see it as a long game, maybe even a slow one. That pace is part of what draws me to it.

People close to me often asked me about baseball, and when I tried to explain it, we kept hitting the same wall: the stats. Baseball has a number for almost everything, more than most sports, and those numbers explain a lot. To a new fan, though, they read like hieroglyphics. ERA? wRC+? FIP? What are you supposed to do with that?

After enough of those conversations, I started to wonder: why not explain the game itself, and help people train their eye to see how those numbers tell a story? Every game starts with two starting pitchers, so that's where I started: what each one throws, and how that mix might play against the lineup he's about to face. The data is public, but it lives in dashboards built for analysts. PitchCraft reads it and writes the answer in plain language. It never predicts who wins, and it has nothing to do with betting.

The idea sat in my head for a long time. When I signed up for Kaggle's AI Agents Intensive and its capstone competition, it finally had a reason to become something real.

## [label: Kaggle, July 2026]

I had seven days, from the first commit on June 28 to the submission on July 4. I planned each milestone in a chat with Claude, and Codex and Claude Code wrote the code. Five agents ran in sequence: the first fetched the data, the next ones turned it into findings and a report, and the last one, a critic, checked every claim before anything went out. None of them used a language model, so the same inputs always produced the same report, and every sentence could be traced back to the data.

The critic earned its place in the demo. The writer named a changeup as one pitcher's put-away pitch. The critic found he threw it on 12% of his pitches, under the 15% bar, and corrected the claim on the page with its evidence. That small moment holds the idea behind everything that came later: PitchCraft is only useful if what it says is true.

The look came from a single Claude Design mockup that gave each team its color and badge. For one daily view, that was all it needed.

## [label: Live for the World Series]

I came back to it in October with two goals. The first was to run PitchCraft every day for real fans during the postseason. The second was to find out, with a real evaluation behind the answer, whether a language model could write the reports.

Before any new code, I set up the process. The repository got a PRD, a decision log, an evaluation spec and written rules for the coding agents. One agent writes at a time, inside a plan I approve. A second agent reviews each change in a fresh session, against the task and the plan, without seeing how the first one reasoned. When the writer reaches a decision the plan doesn't cover, it stops and asks me.

The process paid off right away. The first QA review found six blockers, and the worst was that the app was showing demo values for live pitchers: numbers that looked real and weren't. So I wrote eight rules for the daily data file. One of them is "unknown is never zero": when a value is missing, the page says so instead of printing a zero that looks like a fact. The scouting stats also stop at the day before the game.

The postseason set a deadline, and the deadline forced a decision. I shipped the rules-based reports first and made the language model a separate release decision, to be taken only if the evaluation supported it. The daily job published its first report on October 23, for Game 1 of the World Series.

[Figure 1: daily pipeline. Caption: "A scheduled job fetches the data and the agents write the report. The critic checks its claims, and the job validates the file against the data contract before it publishes."]

## [label: Testing an AI writer]

> The guardrails that prevent invention are what flatten the voice. [pull quote]

With the reports live, I could run the experiment properly. I set the release threshold before running it: at least five of ten development reports had to pass the automated checks. Four passed.

Missing the bar could have been the end of it, or the start of tuning until something passed. I did neither. I wanted to know what was going wrong, so I labeled 348 sentences against their source facts: 113 from development and 235 from a test set that nothing had been tuned on.

The labels told a clearer story than the pass rate. In the test sample I found no incorrect numbers or names. The errors were claims the facts didn't support. One sentence said the two starters' main pitches were different, when the fact table listed a four-seam fastball for both.

That is exactly the kind of error my checks were meant to catch, so the next question was how well they caught it. In the test set, the checks flagged 40 sentences, and I found support for 36 of them. Three of the five test reports that passed the checks still had an unsupported sentence. The checks were rejecting good sentences and letting bad ones through.

[Figure 2: eval chart, two panels, test set. Caption: "Test set of the writer evaluation, labeled by me."]

I also tried a language model as the judge. It agreed with my labels on 79.6% of the test sentences, short of the 85% target and below the 94.5% a judge would reach by answering "supported" every time. It found 5 of my 12 errors.

The last measure was my own preference, and it turned out to be the least reliable. Sentence by sentence, I preferred the model's prose. When I compared 11 pairs of full reports, my choices went in opposite directions in development and test. I was the only reader, I could recognize the model's style, and the rules-based reports were about 25% longer.

> The LLM writes better sentences but says less. [serif beat]

So the rules-based reports stayed in production. The model wrote well; what I couldn't do yet was stop it from saying things the facts didn't support.

## [label: The off season, Nov 2026]

When the World Series ended, the question changed from what happens tonight to what happened this season. The home page became a season in review, and the archive became the center of the product. Each of the 40 postseason games has its final score, both starters' final lines and a matchup report. The game page also tells you where each report came from: whether it went live before first pitch, or was reconstructed later from data through the day before the game. Thirty of the 40 games qualify as notable under fixed rules (strikeout duels, veteran duels, series-ending games and World Series games), and those reasons work as filters, so a fan can go straight to the duels.

More pages meant more agents building them, and one mockup wasn't enough anymore. An agent first audited the interface I had. Then I worked out a new identity with Claude Design, based on a ballpark scoreboard, and approved it as a written design system before any new page was built, so every agent that added a page followed the same rules. Version 2.1.0 shipped it on November 17.

[Figure 3: before and after on a phone. Caption: "World Series Game 5 in the daily view and in the postseason archive. The left view was recreated in November from the file published on October 28."]

## [label: How it ships]

By then the way of working had become a routine. I approve the plan before a coding agent starts, and a separate reviewer checks each change in a fresh session, against the task and the plan. Codex runs the phase audits, Gemini in Antigravity checks the preview build, and I decide when a release gets merged. Every code merge into the main branch is a versioned release with its own notes. The daily data follows its own path: a GitHub Actions bot commits it, and its publish script refuses any change outside the data folders.

## [label: What I learned]

PitchCraft is where my interest in baseball met my work as a PM, and building it taught me CI/CD, agentic development and QA by doing them. The biggest change was in how I work. In July, one mockup was enough for one daily view. By November, I approved a design system before several agents added pages, because without it each of them would have built its own version. The independent reviews proved their worth too: they kept finding real problems, from six blockers in the first QA in October to 17 findings in the data audit before the November release.

## [label: What's next]

This case stops at version 2.2.0. The next stage starts in February, and it's about the fan more than the pipeline. I want the interface to do more of the explaining, with help right where a stat appears and a page for each pitcher. The reports need a closer, more natural voice, which brings the AI writer back: this time the code decides what each report should say, and the model only writes it from facts it can cite. I'm also exploring a chat-style way to ask PitchCraft questions about a matchup. When that stage ships, it will get its own write-up.

> I built PitchCraft because I like baseball and wanted to see how far a contest idea could go with AI at my side. [closing statement]

CTA: Open PitchCraft ↗ · Read the decision log ↗

## Project notes and sources

Unchanged from v4 (links pinned to pitchcraft-agent@fd96889): Kaggle write-up, decision log, rules for the coding agents, data contract, writer evaluation results, QA reports, design system, release notes. The intro line "The motivation and the July workflow come from my own notes" stays.
