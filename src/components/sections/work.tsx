import CaseCard from '@/components/shared/case-card';
import Reveal from '@/components/shared/reveal';
import SectionHead from '@/components/shared/section-head';
import { cases } from '@/lib/cases';

export default function Work() {
  // The card stagger is CSS on .reveal-stagger, so the cards render visible
  // without JavaScript; see reveal.tsx.
  return (
    <section id="work" className="work">
      <div className="container">
        <SectionHead index="01 — Work" heading="What I'm building right now." />
        <Reveal className="work-grid" stagger>
          {cases.map((c) => (
            <CaseCard key={c.title} {...c} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
