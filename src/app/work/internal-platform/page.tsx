import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/sections/nav';
import Footer from '@/components/sections/footer';
import CaseCard from '@/components/shared/case-card';
import Eyebrow from '@/components/shared/eyebrow';
import HeroMesh from '@/components/shared/hero-mesh';
import Reveal from '@/components/shared/reveal';

export const metadata: Metadata = {
  title: 'Designing product work beside an agentic build system \u2014 Daniel Herdenez',
  description:
    'A case study on product management for an internal platform built beside an agentic engineering system.',
};

export default function InternalPlatformPage() {
  return (
    <>
      <Nav />

      <section className="page-hero">
        <HeroMesh />
        <div className="container page-hero-inner">
          <div className="prose-narrow">
            <Eyebrow>Internal platform &middot; Since 2026</Eyebrow>
            <h1>Designing product work beside an agentic build system</h1>
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
                The products in the suite grew separately, each with its own team and delivery
                pressure. To ship their first versions on time, two of them left shared flows for
                later: company registration, user invitations, and related setup work were handled
                outside the product while each team focused on its core. That worked for a while.
                Then the suite started needing a shared layer underneath its products.
              </p>
              <p>
                That layer became a product, even if it did not start as one. It began as a working
                prototype built by a development lead running an agentic engineering system. My
                role at the start was light: define behavior, set limits, answer product questions,
                and let the system move inside that frame.
              </p>
              <p>
                Once there was something tangible on screen, the questions changed. They were no
                longer only about behavior. They became product questions: what is this, who is it
                for, what should it own, and where should it stop. That is where I stepped in as
                product manager.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="prose-narrow">
              <blockquote className="pull">
                <p>This was still a product, even if no customer bought it directly.</p>
              </blockquote>
            </div>
          </Reveal>

          <Reveal>
            <div className="prose-narrow about-prose">
              <p>
                The customer might never operate this layer the way they operate the visible tools,
                but a bad experience here can still damage the relationship. Registration, access,
                invitations, permissions, and account setup are not background details when they
                decide whether a customer can start using the suite cleanly.
              </p>
              <p>
                The work became less about directing every task and more about designing the
                conditions for speed to stay useful. If product tried to control every decision, it
                would become the bottleneck. If product stepped away, the work could drift. The
                operating model had to sit in the middle: clear scope, clean boundaries, decisions
                made at the right level, and enough structure for the agentic system to keep
                building without losing direction.
              </p>
              <p>
                That also changed how I worked as a product manager. I started using Claude to keep
                planning, PRDs, roadmap structure, and user stories closer to the pace of the build.
                What began as a way to keep up with one fast-moving product became a reusable
                product workflow, later standardized for product teams across the company. The full
                system belongs in {/* Case 3 route pending. */}
                <Link href="#">its own case</Link>.
              </p>
              <p>
                The same question is now showing up in UX/UI. A designer joined to shape the
                experience around these shared flows, and the boundary needs to be drawn again: what
                can be made repeatable enough for the system to execute, and what still needs human
                judgment because it carries the customer experience.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="prose-narrow about-prose" style={{ marginTop: 'var(--space-12)' }}>
              <p>
                That is the work behind this platform: turning a shared operational need into a
                product while learning how product management changes when strategy has to keep
                pace with an agentic build.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="prose-narrow">
              <hr className="movement-rule" />
              <blockquote className="serif-beat">
                <p>
                  Not by controlling everything. Not by stepping out. By designing the boundaries
                  where both can work.
                </p>
              </blockquote>
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
              <CaseCard
                href="/work/veflo-trace"
                meta="case &middot; 01"
                title="From workflow software to AI-assisted operations"
                desc="How a case platform built on real operations work grew into one that puts AI inside the workflow, on purpose and under control."
                tags={['Product strategy', 'AI-assisted', 'Since 2025']}
                cta="read"
              />
              <CaseCard
                href="#"
                meta="case &middot; 03"
                title="How I use AI to do product work"
                desc="A public library documenting the prompts, workflows, and frameworks I use to do PM work faster and better. Built in production, not theory."
                tags={['Coming soon', 'Open source', 'GitHub', 'Since 2026']}
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
