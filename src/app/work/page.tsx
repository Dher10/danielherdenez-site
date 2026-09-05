import type { Metadata } from 'next';
import Nav from '@/components/sections/nav';
import Footer from '@/components/sections/footer';
import CaseCard from '@/components/shared/case-card';
import Eyebrow from '@/components/shared/eyebrow';
import HeroMesh from '@/components/shared/hero-mesh';
import Reveal from '@/components/shared/reveal';
import { cases } from '@/lib/cases';

export const metadata: Metadata = {
  title: 'Work \u2014 Daniel Herdenez',
  description: 'A library of case studies and product work by Daniel Herdenez.',
};

export default function WorkPage() {
  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1}>
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
                  <CaseCard key={caseStudy.title} {...caseStudy} />
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
