import type { Metadata } from 'next';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import Nav from '@/components/sections/nav';
import Footer from '@/components/sections/footer';
import CaseCard from '@/components/shared/case-card';
import CaseFigure from '@/components/shared/case-figure';
import Eyebrow from '@/components/shared/eyebrow';
import Reveal from '@/components/shared/reveal';
import PitchcraftEval from '@/components/figures/pitchcraft-eval';
import PitchcraftPipeline from '@/components/figures/pitchcraft-pipeline';
import { internalPlatform, vefloTrace } from '@/lib/cases';
import { createPageMetadata } from '@/lib/metadata';

const title = 'From a Kaggle capstone to a live baseball product';
const description =
  'How PitchCraft went from a seven-day Kaggle capstone to daily reports for the World Series, and why its AI writer stayed off.';

const PRODUCT_URL = 'https://pitchcraft-agent.vercel.app';
const REPO = 'https://github.com/Dher10/pitchcraft-agent';
/** Source links are pinned to the commit the case was checked against. */
const AT = `${REPO}/blob/fd96889`;
const TREE = `${REPO}/tree/fd96889`;

export const metadata: Metadata = createPageMetadata({
  path: '/work/pitchcraft',
  title: `${title} — Daniel Herdenez`,
  description,
  image: { path: '/work/pitchcraft/og.png', alt: 'PitchCraft: World Series Game 5 in the postseason archive' },
});

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  url: 'https://danielherdenez.com/work/pitchcraft',
  image: 'https://danielherdenez.com/work/pitchcraft/og.png',
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
  { label: 'Kaggle write-up', href: `${AT}/docs/KAGGLE_WRITEUP.md` },
  { label: 'Decision log', href: `${AT}/docs/DECISIONS.md` },
  { label: 'Rules for the coding agents', href: `${AT}/AGENTS.md` },
  { label: 'Data contract', href: `${AT}/docs/DATA_CONTRACT.md` },
  { label: 'Writer evaluation results', href: `${AT}/docs/results-planB.md` },
  { label: 'QA reports', href: `${TREE}/docs/qa` },
  { label: 'Design system', href: `${TREE}/docs/design` },
  { label: 'Release notes', href: `${TREE}/docs/releases` },
];

const COVER_ALT =
  "The PitchCraft page for World Series Game 5: Milwaukee Brewers 4, Tampa Bay Rays 1, with the reasons the game is notable and both starters' final lines.";

/**
 * Art-directed cover: below 768px a crop of the phone capture at full prose
 * width, the desktop capture above. Only the selected source is downloaded.
 */
function Cover() {
  const {
    props: { srcSet: desktop, sizes: desktopSizes },
  } = getImageProps({
    alt: COVER_ALT,
    src: '/work/pitchcraft/pitchcraft-game5-desktop.webp',
    width: 1441,
    height: 900,
    sizes: '(min-width: 1024px) 832px, calc(100vw - 96px)',
  });
  const {
    props: { srcSet: phone, sizes: phoneSizes, ...rest },
  } = getImageProps({
    alt: COVER_ALT,
    src: '/work/pitchcraft/pitchcraft-game5-cover-phone.webp',
    width: 750,
    height: 1612,
    sizes: 'calc(100vw - 64px)',
  });
  return (
    <picture>
      {/* Each <source> needs its own sizes; without it the browser assumes
          100vw and fetches an oversized rendition. */}
      <source media="(min-width: 768px)" srcSet={desktop} sizes={desktopSizes} width={1441} height={900} />
      <source media="(max-width: 767px)" srcSet={phone} sizes={phoneSizes} width={750} height={1612} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps in rest */}
      <img {...rest} loading="eager" fetchPriority="high" />
    </picture>
  );
}

export default function PitchcraftPage() {
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
              <Eyebrow>PitchCraft &middot; Since June 2026</Eyebrow>
              <h1>{title}</h1>
              <p className="case-lead">
                PitchCraft explains MLB starting-pitcher matchups in plain language. I started it as a
                Kaggle capstone and launched daily reports for the World Series. After testing a
                language model as the report writer, I kept the reports rules-based.
              </p>
              <p className="case-facts">
                Written at v2.2.0 &middot; November 2026 &middot;{' '}
                <External href={PRODUCT_URL}>Open PitchCraft &#8599;</External> &middot;{' '}
                <External href={REPO}>GitHub &#8599;</External>
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
                  <Cover />
                </CaseFigure>
              </div>
            </Reveal>

            <Reveal>
              <div className="journey">
                <div className="stage">
                  <StageLabel>The idea</StageLabel>
                  <div className="about-prose">
                    <p>
                      I wanted a fan checking tonight&apos;s game to understand what each starter
                      throws and how that pitch mix might play against the opposing lineup. The data
                      exists, but it lives in dashboards built for analysts. PitchCraft never predicts
                      who wins and has nothing to do with betting. I like baseball, and Kaggle&apos;s
                      AI Agents Intensive gave me a reason to build the first version.
                    </p>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>Kaggle, July 2026</StageLabel>
                  <div className="about-prose">
                    <p>
                      I built it in seven days, from the first commit on June 28 to the submission on
                      July 4. I planned each milestone in a chat with Claude, and Codex and Claude
                      Code wrote the code. Five agents ran in sequence, from fetching the data to a
                      critic that checked every claim before the report went out. None of them used a
                      language model, so the same inputs always produced the same report.
                    </p>
                    <p>
                      In the capstone demo, the writer named a changeup as one pitcher&apos;s put-away
                      pitch. The critic found the changeup at 12% of his pitches, under the 15% bar,
                      and corrected the claim on the page with its evidence.
                    </p>
                    <p>
                      The look came from a Claude Design mockup that gave each team its color and
                      badge. For a single daily view, that was enough.
                    </p>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>Running daily, Oct 2026</StageLabel>
                  <div className="about-prose">
                    <p>
                      In October I came back with two goals: run PitchCraft every day for real fans
                      during the postseason, and use it to test whether a language model could write
                      the reports, with a real evaluation behind the answer.
                    </p>
                    <p>
                      I started with the process. Before any new code, the repository got a PRD, a
                      decision log, an evaluation spec and rules for the coding agents. One agent
                      writes at a time, inside a plan I approve. A reviewer in a fresh session checks
                      each change against the task and the plan without seeing the writer&apos;s
                      reasoning, and the writer stops and asks me before any new decision.
                    </p>
                    <p>
                      The first QA review found six blockers. The app was showing demo values for live
                      pitchers. I wrote down eight rules for the daily data file. One of them is
                      &ldquo;unknown is never zero&rdquo;: when a value is missing, the page says so
                      instead of printing a zero that looks like a fact. The scouting stats stop at the
                      day before the game.
                    </p>
                    <p>
                      The postseason gave me a deadline. I shipped the rules-based reports first and
                      made the language model a separate release decision. The daily job published its
                      first report on October 23, for Game 1 of the World Series.
                    </p>
                    <CaseFigure caption="A scheduled job fetches the data and the agents write the report. The critic checks its claims, and the job validates the file against the data contract before it publishes.">
                      <PitchcraftPipeline />
                    </CaseFigure>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>The writer, Oct&ndash;Nov</StageLabel>
                  <div className="about-prose">
                    <blockquote className="pull" style={{ marginTop: 0 }}>
                      <p>The guardrails that prevent invention are what flatten the voice.</p>
                    </blockquote>
                    <p>
                      I set the release threshold before the run. At least five of ten development
                      reports had to pass the automated checks. Four passed.
                    </p>
                    <p>
                      Instead of tuning until something passed, I measured what was going wrong. I
                      labeled 348 sentences against their source facts: 113 from development and 235
                      from a test set that nothing was tuned on. In the test sample I found no
                      incorrect numbers or names. The errors were claims the facts didn&apos;t
                      support. One sentence called the starters&apos; main pitches different, while
                      both entries in the fact table listed a four-seam fastball.
                    </p>
                    <p>
                      In the test set, the checks flagged 40 sentences, and I found support for 36 of
                      them. Three of the five test reports that passed the checks still had an
                      unsupported sentence.
                    </p>
                    <p>
                      I also tried a language model as a judge. It agreed with my labels on 79.6% of
                      the test sentences, short of the 85% target and below the 94.5% a judge would get
                      by always answering &ldquo;supported&rdquo;. It found 5 of my 12 errors.
                    </p>
                    <p>
                      I preferred the model&apos;s prose at the sentence level. When I compared 11
                      pairs of full reports, my choices went in opposite directions in development and
                      test. I was the only reader, I could recognize the model&apos;s style, and the
                      rules-based reports were about 25% longer.
                    </p>
                    <hr className="movement-rule" />
                    <blockquote className="serif-beat">
                      <p>The LLM writes better sentences but says less.</p>
                    </blockquote>
                    <p>
                      I kept the rules-based reports in production because the checks still let
                      unsupported claims through.
                    </p>
                    <CaseFigure caption="Test set of the writer evaluation, labeled by me.">
                      <PitchcraftEval />
                    </CaseFigure>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>Off season, Nov 2026</StageLabel>
                  <div className="about-prose">
                    <p>
                      After the World Series, the home page became a season in review and the archive
                      became the center of the product. Each of the 40 postseason games has a final
                      score, both starters&apos; final lines and a matchup report. The game page tells
                      you whether the report went live before first pitch or was reconstructed later
                      from data through the day before the game. Thirty of the 40 games qualify as
                      notable under fixed rules (strikeout duels, veteran duels, series-ending games
                      and World Series games), so the reasons work as filters instead of a badge.
                    </p>
                    <p>
                      New pages needed more than a mockup. An agent audited the existing interface
                      first. Then I worked out an identity with Claude Design, based on a ballpark
                      scoreboard, and approved it as a written design system before any new page was
                      built, so every agent that added a page followed the same rules. Version 2.1.0
                      shipped it on November 17.
                    </p>
                    <CaseFigure
                      bare
                      caption="World Series Game 5 in the daily view and in the postseason archive. The left view was recreated in November from the file published on October 28."
                    >
                      <div className="before-after">
                        <div>
                          <p>Before</p>
                          <Image
                            src="/work/pitchcraft/pitchcraft-game5-before-crop.webp"
                            alt="The old daily view on a phone: a list of games, a matchup headline and the two starters' season stats."
                            width={375}
                            height={946}
                            sizes="(min-width: 768px) 320px, calc(100vw - 64px)"
                          />
                        </div>
                        <div>
                          <p>After</p>
                          <Image
                            src="/work/pitchcraft/pitchcraft-game5-after-phone.webp"
                            alt="The new game page on a phone: the final score in a scoreboard panel, the reasons the game is notable and both starters' final lines."
                            width={750}
                            height={1892}
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
                      I approved the plan before a coding agent started. A separate reviewer checked
                      each change in a fresh session using the task and the plan. Codex ran the phase
                      audits, Gemini in Antigravity checked the preview build, and I decided when to
                      merge the release. Every code merge into the main branch is a versioned release
                      with its own notes. A GitHub Actions bot commits the daily data, and its publish
                      script refuses any change outside the data folders.
                    </p>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>What I learned</StageLabel>
                  <div className="about-prose">
                    <p>
                      PitchCraft is where my interest in baseball and my work as a PM met, and
                      building it expanded what I know about CI/CD, agentic development and QA. The
                      clearest change was in how I work. In July a mockup was enough for one daily
                      view; in November I approved a design system before several agents added pages.
                      The independent reviews kept finding real problems, from six blockers in the
                      first QA of October to 17 findings in the data audit before the November release.
                    </p>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>Still open</StageLabel>
                  <div className="about-prose">
                    <p>
                      No check I built catches a claim that two pitchers are similar or different, and
                      my comparison of whole reports wasn&apos;t blind. Next I&apos;d have the code
                      identify a pitcher&apos;s profile and the opposing lineup&apos;s weakness, then
                      give those facts to the model to cite. That work resumes in February.
                    </p>
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
                  The repository documents the artifacts and the decisions. The motivation and the
                  July workflow come from my own notes.
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
                <CaseCard {...vefloTrace} />
                <CaseCard {...internalPlatform} />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
