import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/sections/nav';
import Footer from '@/components/sections/footer';
import Eyebrow from '@/components/shared/eyebrow';
import HeroMesh from '@/components/shared/hero-mesh';
import Reveal from '@/components/shared/reveal';

export const metadata: Metadata = {
  title: 'About \u2014 Daniel Herdenez',
  description:
    'How I got here: from process improvement and consulting to building AI-native workflow products. Product Manager at MindTechSourcing.',
};

export default function AboutPage() {
  return (
    <>
      <Nav />

      <section className="page-hero">
        <HeroMesh />
        <div className="container page-hero-inner">
          <div className="prose-narrow">
            <Eyebrow>About</Eyebrow>
            <h1>How I got here.</h1>
          </div>
        </div>
      </section>

      <article className="narrative about-narrative">
        <div className="container">
          <Reveal>
            <div className="prose-narrow about-prose">
              <p>
                I&apos;m a product manager at MindTechSourcing. I work on a workflow platform
                that helps teams move through high volumes of work without losing track of who
                did what, when, and why. The part I&apos;m focused on now lets AI agents take
                on real pieces of that work.
              </p>
              <p>
                I&apos;m at my best where messy operations meet software. The volumes are high,
                the requirements keep moving, and there&apos;s usually a real gap between what a
                team needs and what the tool actually does. Closing that gap is the work.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="prose-narrow">
              <blockquote className="pull">
                <p>Understand how the work actually happens before you try to change it.</p>
              </blockquote>
            </div>
          </Reveal>

          <Reveal>
            <div className="journey">
              <div className="stage">
                <span className="stage-label">
                  <span className="stage-dot" aria-hidden="true"></span>
                  Manufacturing
                </span>
                <div className="about-prose">
                  <p>
                    None of this started with software. My career started on the floor of a
                    manufacturing plant, leading process improvement in soap production. It&apos;s
                    more complex than it looks: dozens of transformations, plenty of places for
                    things to quietly go wrong. I introduced Lean when the company had never
                    worked that way, and spent my time in the corners most people skipped, the
                    small losses, the weights that drifted, the adjustments no one had time to
                    chase. That work taught me something I still rely on: you don&apos;t fix a
                    process from a desk. You stop, watch how it really runs, and ask the people
                    doing it what actually happens.
                  </p>
                </div>
              </div>
              <div className="stage">
                <span className="stage-label">
                  <span className="stage-dot" aria-hidden="true"></span>
                  Consulting
                </span>
                <div className="about-prose">
                  <p>
                    Consulting came next, and the view widened. Instead of one plant I worked
                    across companies in retail, manufacturing, logistics, and other sectors. I sat
                    close to boards, owners, and shareholders, and learned to think about a
                    business the way they do. I led complex, cross-functional projects and built
                    what sat underneath them: corporate strategy, roadmaps, financial analysis,
                    plans to make a company actually profitable. I got fast at walking into an
                    organization and seeing where it was breaking.
                  </p>
                </div>
              </div>
              <div className="stage">
                <span className="stage-label">
                  <span className="stage-dot" aria-hidden="true"></span>
                  Software
                </span>
                <div className="about-prose">
                  <p>
                    Software came after that, and it came quickly. I moved into a faster
                    environment and almost immediately took over an internal system that handled a
                    high volume of customer requests and complaints, the kind of work that lives
                    or dies on traceability: every request answered, on time, with a record of
                    how. It was my first real contact with technology, and I brought the same
                    operations instinct to it.
                  </p>
                  <p>
                    I became the product owner for that system and the ones around it, and stepped
                    fully into how product actually gets built, working with a scrum master, a
                    tech lead, and engineers. Together we took the tooling from tens of thousands
                    of cases a month to well over a million handled in total, unified what had
                    been separate tools, and rebuilt the flows around the things that hurt: wasted
                    time, rework, and the failures that turned into penalties. It was also where I
                    first put AI into real production, not demos, with models that classified
                    incoming cases and helped draft responses, designed around how a person and
                    the system would hand work back and forth.
                  </p>
                </div>
              </div>
              <div className="stage">
                <span className="stage-label">
                  <span className="stage-dot" aria-hidden="true"></span>
                  Now
                </span>
                <div className="about-prose">
                  <p>
                    For years I shaped these systems from the operations side, defining what the
                    work on the ground actually needed from them. Then a dedicated product team
                    was formed to turn that internal tooling into a product any team could use,
                    and I came on to lead it. That&apos;s the role I have now: not just defining
                    what to build, but owning the product itself, from discovery through to
                    production and across its whole life. It sits inside a broader suite, and the
                    layer I&apos;m building is what lets AI agents take on real parts of the work.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="prose-narrow">
              <hr className="movement-rule" />
              <blockquote className="serif-beat">
                <p>I like building things, and I like taking them apart to see how they work.</p>
              </blockquote>
            </div>
          </Reveal>

          <Reveal>
            <div className="prose-narrow about-prose">
              <p>
                Away from the job, I&apos;ve been doing it since I was a kid assembling PCs, and
                I do it in public now. This site is mine, code and all, built with Claude and
                Codex. So is PM-AI-Prompts, an open library of the prompts and workflows I
                actually use for product work, which I started early in 2026. I share it because
                what I figure out is more useful to other people than it is sitting on my drive.
              </p>
              <p>
                My relationship with AI has changed fast. In a matter of months I went from
                writing good prompts to designing agentic systems, and I use them on real work.
                The industrial engineer in me doesn&apos;t switch off either: I notice the
                friction in things, the extra step, the process that could be smoother, and I
                usually can&apos;t leave it alone.
              </p>
              <p>
                There&apos;s more in motion. One of the things I&apos;m building is being made end
                to end with agentic AI, from the product work through to the code. Another is a
                product I&apos;m about to take ownership of. I&apos;ll share both when they&apos;re
                ready.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="prose-narrow close">
              <p>
                The problems I care about live where operations, software, and AI meet. If
                that&apos;s what you&apos;re building, I&apos;d like to hear about it.
              </p>
              <div className="cta-row">
                <a href="#contact" className="btn btn-primary">
                  Let&apos;s talk <span className="arrow">&rarr;</span>
                </a>
                <Link href="/#work" className="ghost-link">
                  See my work <span className="arrow">&rarr;</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </article>

      <Footer />
    </>
  );
}
