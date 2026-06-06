import Link from 'next/link';
import Reveal from '@/components/shared/reveal';
import SectionHead from '@/components/shared/section-head';

export default function About() {
  return (
    <section id="about" className="about" data-screen-label="03 About">
      <div className="container">
        <Reveal>
          <SectionHead index="— About" heading="How I got here." />
          <div className="prose-narrow">
            <p className="about-body">
              Industrial engineer by training. The first half of my career was about making
              complex operations work better. The second half is about building software
              products that do the same thing for other teams. Now I run product at{' '}
              <strong>MindTechSourcing</strong>, shipping workflow platforms with native AI.
            </p>
            <Link href="/about" className="ghost-link">
              More about me <span className="arrow">→</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
