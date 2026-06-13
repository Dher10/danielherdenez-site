import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/sections/nav';
import Footer from '@/components/sections/footer';
import CaseCard from '@/components/shared/case-card';
import Eyebrow from '@/components/shared/eyebrow';
import HeroMesh from '@/components/shared/hero-mesh';
import Reveal from '@/components/shared/reveal';

export const metadata: Metadata = {
  title: 'Veflo Trace \u2014 Daniel Herdenez',
  description:
    'A case study on building Veflo Trace from workflow software toward AI-assisted operations.',
};

export default function VefloTracePage() {
  return (
    <>
      <Nav />

      <section className="page-hero">
        <HeroMesh />
        <div className="container page-hero-inner">
          <div className="prose-narrow">
            <Eyebrow>Veflo Trace &middot; Since 2025</Eyebrow>
            <h1>Building the path from workflow software to AI-assisted operations</h1>
            <div className="cta-row">
              <Link href="/work" className="ghost-link">
                &larr; Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      <article className="narrative about-narrative" style={{ paddingBottom: 'var(--space-16)' }}>
        <div className="container">
          <Reveal>
            <div className="prose-narrow about-prose">
              <p>
                Veflo Trace runs structured operational flows: customer requests, support tickets,
                approval chains, and any process that moves through stages, owners, and rules. It
                is often read first as a ticketing tool, but the product is built around a broader
                idea: the platform should fit the operation, not force every team into the same
                rigid model.
              </p>
              <p>
                That idea came from work already tested in real operations. The platforms before
                Trace supported more than 300 users and handled over 1M cases, in environments
                where volume, deadlines, escalations, and regulatory pressure were part of the
                daily work. I worked on those platforms from 2023, first as an analyst close to the
                operation and later as their product owner.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="prose-narrow">
              <blockquote className="pull">
                <p>At that scale, product decisions stop being abstract.</p>
              </blockquote>
            </div>
          </Reveal>

          <Reveal>
            <div className="prose-narrow about-prose">
              <p>
                You see which ideas survive a busy team, which ones create rework, and which ones
                quietly get abandoned.
              </p>
              <p>
                That experience also shaped how I approached AI. Before Trace, a quality step built
                with Data Science and the operation evaluated more than the written response. It
                looked at the case as a whole: its typifications, the state of its subcases, and
                the type of closure given to the customer. It automatically handled more than 60%
                of incoming cases, with the quality of the information entering the process as the
                real ceiling.
              </p>
              <p>
                A few principles carried into Trace from that experience. Keep the interface
                simple, because a tool that needs too much explanation loses to whatever people
                already know how to use. Make every action traceable, because operational work
                always comes back to who did what, when, and why. Let teams configure their own
                process, because no two operations run exactly the same way. And use AI only where
                it changes the outcome.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="journey" style={{ marginTop: 'var(--space-12)' }}>
              <div className="stage">
                <span className="stage-label">
                  <span className="stage-dot" aria-hidden="true"></span>
                  AI with restraint
                </span>
                <div className="about-prose">
                  <p>
                    That last principle shaped the MVP. The AI scope stayed intentionally narrow:
                    one feature summarizes long cases so analysts can understand context faster;
                    another validates whether a response addresses what the customer actually
                    raised, reducing the risk of incomplete answers and repeat complaints. More
                    automation can come later. The first version needed AI that made the work
                    better, not AI that made the product sound larger than it was.
                  </p>
                </div>
              </div>
              <div className="stage">
                <span className="stage-label">
                  <span className="stage-dot" aria-hidden="true"></span>
                  Data before connections
                </span>
                <div className="about-prose">
                  <p>
                    The same restraint shaped the technical foundation. Jeffrey Liker&apos;s reading
                    of Toyota puts it plainly: technology should be reliable, tested, and useful to
                    the people and processes it serves. For Trace, that meant treating data
                    structure as product infrastructure, not as implementation detail. Traceability
                    depends on clean data, so the data layer came before broad connectivity. The
                    creation API was scoped later as a controlled way to bring cases from public
                    forms and client applications into the managed flow.
                  </p>
                </div>
              </div>
              <div className="stage">
                <span className="stage-label">
                  <span className="stage-dot" aria-hidden="true"></span>
                  Ship to learn
                </span>
                <div className="about-prose">
                  <p>
                    The hardest decision was not what else Trace could do. It was what had to wait.
                    With a fixed launch date, scope had to be cut without reducing the product to a
                    demo. The proposal was built around a simple trade-off: ship a product real
                    teams could use, learn from production, and let that evidence shape the next
                    version.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="prose-narrow">
              <hr className="movement-rule" />
              <blockquote className="serif-beat">
                <p>
                  A live product used by real teams teaches more than a perfect version that
                  arrives too late.
                </p>
              </blockquote>
            </div>
          </Reveal>

          <Reveal>
            <div className="prose-narrow about-prose">
              <p>
                That is the direction behind Trace: AI inside the workflow, data structured enough
                to make the work traceable, and a product shaped by what real operations can
                actually use. As AI takes on more work, one rule stays in place: a person
                configures the process, and a person approves what goes out.
              </p>
            </div>
          </Reveal>
        </div>
      </article>

      <section className="work" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <div className="prose-narrow">
              <Eyebrow>More work</Eyebrow>
            </div>
          </Reveal>

          <Reveal>
            <div className="work-grid">
              {/* TODO: Replace placeholder hrefs when the remaining case study routes exist. */}
              <CaseCard
                href="#"
                meta="Platform governance &middot; Since 2026"
                title="Designing governance for a multi-product platform"
                desc="Shaping the admin layer for a SaaS suite where multiple products share users, billing, and access. Evolving the early mockup into a coherent model for organization-level configuration and cross-product interactions that reduce friction across tools."
                tags={['Platform', 'Governance', 'Since 2026']}
                cta="read"
              />
              <CaseCard
                href="#"
                meta="Open source"
                title="How I use AI to do product work"
                desc="A public library documenting the prompts, workflows, and frameworks I use to do PM work faster and better. Built in production, not theory."
                tags={['Open source', 'GitHub', 'Since 2026']}
                cta="view"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
