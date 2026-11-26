import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/sections/nav';
import Footer from '@/components/sections/footer';
import CaseCard from '@/components/shared/case-card';
import CaseCover from '@/components/shared/case-cover';
import CaseFigure from '@/components/shared/case-figure';
import Eyebrow from '@/components/shared/eyebrow';
import Reveal from '@/components/shared/reveal';
import PitchcraftEval from '@/components/figures/pitchcraft-eval';
import PitchcraftPipeline from '@/components/figures/pitchcraft-pipeline';
import { otherCases, pitchcraftV2 } from '@/lib/cases';
import { createPageMetadata } from '@/lib/metadata';

/*
 * Case 04. Visible copy is docs/editorial/pitchcraft-2026-11-25/02_PitchCraft_v2_World_Series_Copy.md,
 * word for word; tests/pitchcraft-v2.spec.ts compares the page against that file.
 */

const ROUTE = '/work/pitchcraft-v2-world-series';
const ASSETS = '/work/pitchcraft-v2-world-series';
const title = pitchcraftV2.title;
const description = pitchcraftV2.desc;

const PRODUCT_URL = 'https://pitchcraft-agent.vercel.app/';
const REPO = 'https://github.com/Dher10/pitchcraft-agent';
/** Source links are pinned to the commit the case was written against (v2.2.0 era). */
const AT = `${REPO}/blob/fd96889`;
const TREE = `${REPO}/tree/fd96889`;

export const metadata: Metadata = createPageMetadata({
  path: ROUTE,
  title: `${title} — Daniel Herdenez`,
  description,
  image: { path: `${ASSETS}/og.png`, alt: 'PitchCraft: World Series Game 5 in the postseason archive' },
});

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  url: `https://danielherdenez.com${ROUTE}`,
  image: `https://danielherdenez.com${ASSETS}/og.png`,
  author: { '@type': 'Person', name: 'Daniel Herdenez', url: 'https://danielherdenez.com' },
};

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function StageLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="stage-label">
      <span className="stage-dot" aria-hidden="true"></span>
      {children}
    </h2>
  );
}

const sources = [
  { label: 'Kaggle write-up', href: `${REPO}/blob/v1.0.0-kaggle/docs/KAGGLE_WRITEUP.md` },
  { label: 'Product requirements', href: `${AT}/docs/PRD_v2.md` },
  { label: 'Decision log', href: `${AT}/docs/DECISIONS.md` },
  { label: 'Rules for the coding agents', href: `${AT}/AGENTS.md` },
  { label: 'Data contract', href: `${AT}/docs/DATA_CONTRACT.md` },
  { label: 'Writer evaluation results', href: `${AT}/docs/results-planB.md` },
  { label: 'Case-study notes', href: `${AT}/docs/case-study-notes.md` },
  { label: 'QA reports', href: `${TREE}/docs/qa` },
  { label: 'Design system', href: `${TREE}/docs/design` },
  { label: 'Release notes', href: `${TREE}/docs/releases` },
];

const COVER_ALT =
  "The PitchCraft page for World Series Game 5: Milwaukee Brewers 4, Tampa Bay Rays 1, with the reasons the game is notable and both starters' final lines.";

export default function PitchcraftV2Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd).replace(/</g, '\\u003c') }}
      />
      <Nav />
      <main id="main" tabIndex={-1}>
        <section className="page-hero">
          <div className="container page-hero-inner">
            <div className="prose-narrow">
              <Link href="/work" className="ghost-link back-link">
                &larr; Work
              </Link>
              <Eyebrow>PitchCraft v2 &middot; November 2026</Eyebrow>
              <h1>{title}</h1>
              <p className="case-lead">
                After building PitchCraft for a Kaggle competition, I returned to the project to publish
                daily scouting reports, evaluate a language model as the report writer and develop a
                product that would remain useful beyond the baseball season.
              </p>
              <p className="case-facts">
                Written at v2.2.0 &middot; November 2026 &middot;{' '}
                <External href={PRODUCT_URL}>Open PitchCraft &#8599;</External> &middot;{' '}
                <External href={TREE}>GitHub &#8599;</External>
              </p>
            </div>
          </div>
        </section>

        <article className="narrative about-narrative" style={{ paddingBottom: 'var(--space-16)' }}>
          <div className="container">
            <Reveal>
              <div className="prose-wide">
                <CaseFigure
                  bare
                  caption="World Series Game 5 in the PitchCraft postseason archive, November 2026."
                >
                  <CaseCover
                    alt={COVER_ALT}
                    desktop={{ src: `${ASSETS}/pitchcraft-game5-desktop.webp`, width: 1441, height: 900 }}
                    phone={{ src: `${ASSETS}/pitchcraft-game5-cover-phone.webp`, width: 750, height: 1612 }}
                  />
                </CaseFigure>
              </div>
            </Reveal>

            <Reveal>
              <div className="journey">
                <div className="stage">
                  <StageLabel>Coming back to PitchCraft</StageLabel>
                  <div className="about-prose">
                    <p>
                      PitchCraft started as{' '}
                      <Link href="/work/pitchcraft-v1-kaggle">
                        my capstone for Kaggle&apos;s AI Agents Intensive
                      </Link>
                      . The idea was to help baseball fans understand starting-pitcher matchups through
                      readable scouting reports backed by public data. I built the first version in seven
                      days with AI coding agents, using a deterministic pipeline and a critic that checked
                      its claims against the data.
                    </p>
                    <p>
                      The capstone worked, but refreshing its data required a manual command. I wanted the
                      reports to be available every day during the postseason. I also wanted to put
                      something I had been learning about AI products into practice: how to evaluate
                      whether a language model could improve an existing product.
                    </p>
                    <p>Those two goals brought me back to PitchCraft in October.</p>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>Live for the World Series</StageLabel>
                  <div className="about-prose">
                    <p>
                      Before starting on new features, I defined how the development work would happen.
                      The repository got a PRD, a decision log, an evaluation spec and written
                      instructions for the coding agents. One agent writes at a time, following a plan I
                      approve. Another reviews the changes in a fresh session, without access to the first
                      agent&apos;s reasoning. Decisions outside the agreed scope come back to me.
                    </p>
                    <p>
                      The first independent QA review found six blockers. Among them was a problem that
                      went directly against the original idea behind PitchCraft: some real pitchers were
                      still being shown with demo data.
                    </p>
                    <p>
                      That led me to define eight rules that the daily data file had to satisfy before
                      publication. One of them is &quot;unknown is never zero.&quot; When a value is
                      missing, the page says so. The scouting statistics also stop at the day before the
                      game, so a preview cannot draw on information that became available afterward.
                    </p>
                    <p>
                      The postseason was coming to an end, and waiting for the language model evaluation
                      would have meant missing the chance to publish during the season. I decided to
                      release the rules-based reports first and make the new writer a separate release
                      decision, subject to its evaluation results.
                    </p>
                    <p>
                      The daily job published its first update on October 23, for Game 1 of the World
                      Series.
                    </p>
                    <CaseFigure caption="A scheduled job fetches the data and the agents write the report. The critic checks its claims, and the job validates the file against the data contract before it publishes.">
                      <PitchcraftPipeline />
                    </CaseFigure>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>Testing an AI writer</StageLabel>
                  <div className="about-prose">
                    <p>
                      The rules-based reports were doing their job, but their sentences could feel
                      repetitive. I wanted to see whether a language model could make the report read
                      more like someone explaining a game.
                    </p>
                    <p>
                      To keep the analysis grounded, I separated the facts from the writing. Gemini
                      received a structured table of facts and had to cite them in each sentence.
                      Automated checks verified those references and assessed the resulting claims.
                    </p>
                    <p>
                      Before the development run, I had set a threshold for continuing with the original
                      evaluation plan: at least five of ten reports had to pass the checks.
                    </p>
                    <p>Four passed.</p>
                    <p>
                      Continuing to adjust the writer might have improved that number, but the pass rate
                      alone could not tell me whether the problem was in the writing or in the checks
                      themselves. To understand that, I manually labeled 348 sentences against their
                      source facts, 113 from development and 235 from a separate test set that had not
                      been used for tuning.
                    </p>
                    <p>
                      In the test set, I found no incorrect numbers or names. The errors came from what
                      the model inferred from the data. One sentence described the two starting pitchers
                      as having different primary pitches, even though the fact table listed a four-seam
                      fastball for both.
                    </p>
                    <p>
                      The automated checks struggled with those distinctions. They flagged 40 test
                      sentences, of which 36 had support in the data. Three of the five test reports that
                      passed the checks still contained an unsupported sentence.
                    </p>
                    <CaseFigure caption="Test set of the writer evaluation, labeled by me.">
                      <PitchcraftEval />
                    </CaseFigure>
                    <blockquote className="pull">
                      <p>The guardrails that prevent invention are what flatten the voice.</p>
                    </blockquote>
                    <p>
                      I also evaluated a language model as a judge. It agreed with my labels on 79.6% of
                      the test sentences, below the 85% target. Because most sentences were supported, a
                      judge that answered &quot;supported&quot; every time would have reached 94.5%. The
                      model identified five of the 12 errors I had labeled.
                    </p>
                    <p>
                      There was still a question about the reading experience itself. While working
                      through individual sentences, I had come to prefer the model&apos;s prose. When I
                      compared 11 pairs of complete reports, however, my choices went in opposite
                      directions across the development and test sets. I was the only reader, I could
                      recognize the model&apos;s style, and the rules-based reports were about 25% longer.
                    </p>
                    <hr className="movement-rule" />
                    <blockquote className="serif-beat">
                      <p>The LLM writes better sentences but says less.</p>
                    </blockquote>
                    <p>
                      I kept the rules-based writer in production. I liked the model&apos;s writing, but I
                      had no reliable way to catch its remaining errors, and the comparison of complete
                      reports had given me little evidence that it would make PitchCraft better for a fan.
                    </p>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>A product between seasons</StageLabel>
                  <div className="about-prose">
                    <p>
                      When the World Series ended, PitchCraft had nothing left to preview. I wanted the
                      product to remain useful between seasons, so the home page became a season in
                      review and the archive became the center of the experience.
                    </p>
                    <p>
                      Each of the 40 postseason games has its own page with the final score, both
                      starters&apos; final lines and a matchup report. The page identifies whether the
                      report was published before the game or reconstructed afterward using data through
                      the day before it was played.
                    </p>
                    <p>
                      Thirty of those games qualify as notable under defined rules covering strikeout
                      duels, veteran matchups, series-ending games and World Series games. Those reasons
                      also work as filters, giving fans a way to find the games they are interested in
                      revisiting.
                    </p>
                    <p>
                      The mockup from July was no longer enough for a product with several pages. After
                      an agent audited the existing interface, I worked with Claude Design on a new
                      identity inspired by a ballpark scoreboard. This time, I approved a written design
                      system before any new page was built, so the coding agents had a shared reference
                      for components, layouts and content.
                    </p>
                    <p>Version 2.1.0 shipped the new experience on November 17.</p>
                    <CaseFigure
                      bare
                      caption="World Series Game 5 in the daily view and in the postseason archive. The left view was recreated in November from the file published on October 28."
                    >
                      <div className="before-after">
                        <div>
                          <p>Before</p>
                          <Image
                            src={`${ASSETS}/pitchcraft-game5-before-crop.webp`}
                            alt="The old daily view on a phone: a matchup headline and the two starters' season stats."
                            width={375}
                            height={946}
                            loading="eager"
                            sizes="(min-width: 768px) 320px, calc(100vw - 64px)"
                          />
                        </div>
                        <div>
                          <p>After</p>
                          <Image
                            src={`${ASSETS}/pitchcraft-game5-after-phone.webp`}
                            alt="The new game page on a phone: the final score in a scoreboard panel, the reasons the game is notable and both starters' final lines."
                            width={750}
                            height={1892}
                            loading="eager"
                            sizes="(min-width: 768px) 320px, calc(100vw - 64px)"
                          />
                        </div>
                      </div>
                    </CaseFigure>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>How it ships</StageLabel>
                  <div className="about-prose">
                    <p>
                      The development process I established in October now extends to each release.
                      Claude Code writes the code, Codex audits each phase against a written QA protocol,
                      and Gemini in Antigravity checks the preview build. I decide when a release is ready
                      to merge. The data audit before the November release alone found 17 issues.
                    </p>
                    <p>
                      Every code merge into the main branch is a versioned release with its own notes.
                      Daily data updates follow a separate path through GitHub Actions, with a publication
                      script that rejects changes outside the allowed data directories.
                    </p>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>What I learned</StageLabel>
                  <div className="about-prose">
                    <p>
                      PitchCraft gave me a practical understanding of CI/CD, agentic development and QA,
                      and of how those disciplines affect the decisions I make as a product manager.
                    </p>
                    <p>
                      The evaluation was particularly useful to me. By the time it was over, I had grown
                      to like the model&apos;s writing. Having defined the conditions for release before
                      seeing the results gave me a way to make that decision without relying on my own
                      preference.
                    </p>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>What&apos;s next</StageLabel>
                  <div className="about-prose">
                    <p>
                      This case stops at version 2.2.0. The next stage is planned for February, with more
                      attention to how a fan learns about the game through PitchCraft. I want to provide
                      explanations alongside individual statistics and give each pitcher a page of his
                      own.
                    </p>
                    <p>
                      I also want to revisit how the reports are written. The approach I intend to test
                      is to have the code identify the important aspects of a matchup and give them to the
                      language model as facts it can cite. That would give the writer more to work with
                      while keeping the analysis grounded in the data.
                    </p>
                    <p>
                      I&apos;m also exploring a chat-style way for fans to ask PitchCraft questions about
                      a matchup.
                    </p>
                    <p>When that stage ships, it will have its own write-up.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="prose-narrow close">
                <p>
                  I built PitchCraft because I like baseball and wanted to see how far a contest idea
                  could go with AI at my side.
                </p>
                <div className="cta-row">
                  <a href={PRODUCT_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    Open PitchCraft <span className="arrow up-right">&#8599;</span>
                  </a>
                  <a
                    href={`${AT}/docs/DECISIONS.md`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ghost-link"
                  >
                    Read the decision log <span className="arrow up-right">&#8599;</span>
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="prose-narrow" style={{ marginTop: 'var(--space-16)' }}>
                <Eyebrow as="h2" dot={false}>
                  Project notes and sources
                </Eyebrow>
                <p className="case-sources-intro">
                  The motivation and the July workflow come from my own notes.
                </p>
                <ul className="case-sources">
                  {sources.map((source) => (
                    <li key={source.label}>
                      <External href={source.href}>{source.label} &#8599;</External>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </article>

        <section className="work" style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal>
              <div className="prose-narrow">
                <Eyebrow as="h2">More work</Eyebrow>
              </div>
            </Reveal>

            <Reveal>
              <div className="work-grid">
                {otherCases(ROUTE).map((c) => (
                  <CaseCard key={c.href} {...c} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
