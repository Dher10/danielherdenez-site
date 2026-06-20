import type { Metadata } from 'next';
import Nav from '@/components/sections/nav';
import Footer from '@/components/sections/footer';
import CaseCard from '@/components/shared/case-card';
import Eyebrow from '@/components/shared/eyebrow';
import HeroMesh from '@/components/shared/hero-mesh';
import Reveal from '@/components/shared/reveal';

export const metadata: Metadata = {
  title: 'Work \u2014 Daniel Herdenez',
  description: 'A library of case studies and product work by Daniel Herdenez.',
};

const cases = [
  {
    meta: 'case \u00b7 01',
    title: 'From workflow software to AI-assisted operations',
    desc: 'How a case platform built on real operations work grew into one that puts AI inside the workflow, on purpose and under control.',
    tags: ['Product strategy', 'AI-assisted', 'Since 2025'],
    cta: 'read',
    href: '/work/veflo-trace',
  },
  {
    meta: 'Internal platform \u00b7 Since 2026',
    title: 'Designing product work beside an agentic build system',
    desc: 'What it takes to be product manager of an internal platform built by a fast-moving agentic system, and how product work keeps pace without becoming the bottleneck.',
    tags: ['Platform', 'AI-assisted', 'Since 2026'],
    cta: 'read',
    href: '/work/internal-platform',
  },
  {
    meta: 'case \u00b7 03',
    title: 'How I use AI to do product work',
    desc: 'A public library documenting the prompts, workflows, and frameworks I use to do PM work faster and better. Built in production, not theory.',
    tags: ['Coming soon', 'Open source', 'GitHub', 'Since 2026'],
    cta: 'view',
    href: '#',
  },
];

export default function WorkPage() {
  return (
    <>
      <Nav />

      <section className="page-hero">
        <HeroMesh />
        <div className="container page-hero-inner">
          <div className="prose-narrow">
            <Eyebrow>Work</Eyebrow>
            <h1>Things I&apos;ve built and written.</h1>
          </div>
        </div>
      </section>

      <section className="work">
        <div className="container">
          <Reveal>
            <div className="work-grid">
              {cases.map((caseStudy) => (
                <CaseCard
                  key={caseStudy.title}
                  href={caseStudy.href}
                  meta={caseStudy.meta}
                  title={caseStudy.title}
                  desc={caseStudy.desc}
                  tags={caseStudy.tags}
                  cta={caseStudy.cta}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
