import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/sections/nav';
import Footer from '@/components/sections/footer';
import CaseCard from '@/components/shared/case-card';
import CaseCover from '@/components/shared/case-cover';
import CaseFigure from '@/components/shared/case-figure';
import Eyebrow from '@/components/shared/eyebrow';
import Reveal from '@/components/shared/reveal';
import { otherCases, pitchcraftV1 } from '@/lib/cases';
import { createPageMetadata } from '@/lib/metadata';

/*
 * Case 03. Visible copy is docs/editorial/pitchcraft-2026-11-25/01_PitchCraft_v1_Kaggle_Copy.md,
 * word for word; tests/pitchcraft-v1.spec.ts compares the page against that file.
 * The cover was rebuilt from the v1.0.0-kaggle tag on 2026-11-25; see
 * docs/captures/2026-11-25-pitchcraft-cases/README.md.
 */

const ROUTE = '/work/pitchcraft-v1-kaggle';
const ASSETS = '/work/pitchcraft-v1-kaggle';
const title = pitchcraftV1.title;
const description = pitchcraftV1.desc;

/** The current public app, not a frozen July build. */
const PRODUCT_URL = 'https://pitchcraft-agent.vercel.app/';
const REPO = 'https://github.com/Dher10/pitchcraft-agent';
/** Source links are pinned to the Kaggle release tag. */
const TAG = `${REPO}/tree/v1.0.0-kaggle`;
const WRITEUP = `${REPO}/blob/v1.0.0-kaggle/docs/KAGGLE_WRITEUP.md`;

export const metadata: Metadata = createPageMetadata({
  path: ROUTE,
  title: `${title} — Daniel Herdenez`,
  description,
  image: { path: `${ASSETS}/og.png`, alt: 'PitchCraft v1: the Kaggle version with its cached demo data, rebuilt from the v1.0.0-kaggle tag' },
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
  { label: 'Kaggle write-up', href: WRITEUP },
  { label: 'Original Kaggle version', href: TAG },
  { label: 'Original reporting pipeline', href: `${TAG}/agents` },
];

// The rebuild runs on the tag's cached demo snapshot: demo values beside real
// player names. Caption and alt say so (file 05, section 2); no names or stats here.
const COVER_ALT =
  'The Kaggle version of PitchCraft running on its cached demo data: a strip of upcoming games and a matchup report with a profile card for each starting pitcher.';

export default function PitchcraftV1Page() {
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
              <Eyebrow>PitchCraft v1 &middot; July 2026</Eyebrow>
              <h1>{title}</h1>
              <p className="case-lead">
                PitchCraft started as an idea to help baseball fans understand the game through its
                statistics. I turned it into a working scouting product in seven days for Kaggle&apos;s
                AI Agents Intensive.
              </p>
              <p className="case-facts">
                Based on v1.0.0-kaggle &middot; July 2026 &middot;{' '}
                <External href={PRODUCT_URL}>Open PitchCraft &#8599;</External> &middot;{' '}
                <External href={TAG}>GitHub &#8599;</External>
              </p>
            </div>
          </div>
        </section>

        <article className="narrative about-narrative" style={{ paddingBottom: 'var(--space-16)' }}>
          <div className="container">
            <Reveal>
              <div className="prose-wide">
                <CaseFigure bare caption="The Kaggle version and its cached demo data, rebuilt from the v1.0.0-kaggle tag in November 2026.">
                  <CaseCover
                    alt={COVER_ALT}
                    desktop={{ src: `${ASSETS}/pitchcraft-v1-desktop.webp`, width: 1440, height: 900 }}
                    phone={{ src: `${ASSETS}/pitchcraft-v1-cover-phone.webp`, width: 750, height: 1612 }}
                  />
                </CaseFigure>
              </div>
            </Reveal>

            <Reveal>
              <div className="journey">
                <div className="stage">
                  <StageLabel>The idea</StageLabel>
                  <div className="about-prose">
                    <p>
                      Baseball is played one pitch at a time, and even with the recent rule changes to
                      speed up the game, it can still feel slow. That pace is part of what draws me to it.
                    </p>
                    <p>
                      When people close to me asked about baseball, I often found myself explaining the
                      statistics before I could explain the game. Baseball has a number for almost
                      everything, and those numbers can tell you a great deal about what&apos;s happening
                      on the field. For someone new to the sport, though, they can be difficult to make
                      sense of. ERA, wRC+, FIP. What do any of those numbers tell you about the game
                      you&apos;re about to watch?
                    </p>
                    <p>
                      After enough of those conversations, I began thinking about a way to help people
                      learn to watch baseball, to train their eye for what&apos;s happening on the field.
                      Starting pitchers gave me a place to begin: what each one throws, how he uses those
                      pitches, and how the opposing lineup has performed against left- or right-handed
                      pitching.
                    </p>
                    <p>
                      Much of that information is publicly available, but it lives in dashboards built for
                      analysts. I wanted to bring it together in a report that a fan could read before a
                      game. Something that explains the matchup without predicting the outcome or getting
                      into betting.
                    </p>
                    <p>
                      The idea had been on my mind for a while. When I signed up for Kaggle&apos;s AI
                      Agents Intensive, the capstone competition gave me a reason to build it.
                    </p>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>Seven days</StageLabel>
                  <div className="about-prose">
                    <p>
                      The first commit went in on June 28, and I finished the submission on July 4. I
                      planned each milestone with Claude, while Codex and Claude Code wrote the code.
                    </p>
                    <p>
                      With seven calendar days to build it, I had to decide how much information the
                      product actually needed. An analysis of confirmed lineups would have made each
                      report more specific, but team performance against left- and right-handed pitching
                      was enough to explain the matchup. Detailed statistical tables would have added
                      information at the cost of bringing the experience closer to the dashboards I was
                      trying to simplify.
                    </p>
                    <p>
                      I also kept the data refresh manual and prepared a cached snapshot for the
                      submission. The demonstration could then run without depending on a live request.
                    </p>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>Verifiable claims</StageLabel>
                  <div className="about-prose">
                    <p>
                      One of the early ideas was a composite metric for pitching quality. A single number
                      would have made it easier to compare two starters, but anyone who wanted to
                      understand that number would have had to rely on my own definition of it. I dropped
                      the composite metric and used labeled Statcast figures instead.
                    </p>
                    <p>
                      For grading a pitcher&apos;s performance after a game, I adopted Bill James&apos;s
                      Game Score. The formula was already public, and I documented the letter grade on top
                      of it as a way to make the result easier to read.
                    </p>
                    <p>
                      The same concern shaped the reporting pipeline. Five agents gathered the data,
                      analyzed the matchup, assembled the report, checked its claims and graded completed
                      games. None used a language model at runtime. Given the same inputs, they produced
                      the same outputs.
                    </p>
                    <p>
                      The critic was the part I most wanted to demonstrate. In the worked demo, I
                      deliberately included a claim that would fail one of its checks. The report
                      identified a changeup as a pitcher&apos;s put-away pitch, even though he threw it
                      only 12% of the time, below the 15% threshold defined in the critic&apos;s rules.
                    </p>
                    <p>
                      The critic flagged the claim for revision and showed the evidence on the page. A
                      reader could see why it had been challenged without having to take the report at
                      face value.
                    </p>
                  </div>
                </div>

                <div className="stage">
                  <StageLabel>The first version</StageLabel>
                  <div className="about-prose">
                    <p>
                      The visual design came from a mockup I developed with Claude Design. Team colors and
                      badges gave each matchup its own identity within a consistent interface. For a
                      product built around a single daily view, that was enough.
                    </p>
                    <p>
                      By the submission deadline, I had a public application that could fetch matchup
                      data, turn it into a readable scouting report and show how its claims were checked.
                      The original version remains available in the repository under the Kaggle release
                      tag.
                    </p>
                    <p>
                      I came back to PitchCraft in October to see whether it could run every day during
                      the postseason and whether a language model could improve the reports. That work is
                      documented in{' '}
                      <Link href="/work/pitchcraft-v2-world-series">
                        From a Kaggle capstone to a live baseball product
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="prose-narrow close">
                <p>
                  I wanted a report that a fan could read before a game and check against the numbers
                  behind it.
                </p>
                <div className="cta-row">
                  <a href={PRODUCT_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    Open PitchCraft <span className="arrow up-right">&#8599;</span>
                  </a>
                  <a href={WRITEUP} target="_blank" rel="noopener noreferrer" className="ghost-link">
                    Read the Kaggle write-up <span className="arrow up-right">&#8599;</span>
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
                  The motivation, early product decisions and July workflow come from my own notes.
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
