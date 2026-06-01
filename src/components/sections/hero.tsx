import HeroMesh from '@/components/shared/hero-mesh';
import Eyebrow from '@/components/shared/eyebrow';

export default function Hero() {
  return (
    <section className="hero" data-screen-label="01 Hero">
      <HeroMesh />
      <div className="container hero-inner">
        <Eyebrow>available · summer 2026</Eyebrow>
        <h1>
          Product Manager. I turn complex problems into{' '}
          <span className="em">shipped products</span>.
        </h1>
        <p className="sub">
          Currently at MindTechSourcing, building the foundation for AI agents on a
          traceability and workflow SaaS.
        </p>
        <div className="hero-cta">
          <a href="#contact" className="btn btn-primary">
            Let&apos;s talk <span className="arrow">→</span>
          </a>
          <a
            href="https://www.linkedin.com/in/daniel-herdenez-5160161a9"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            LinkedIn <span className="arrow up-right">↗</span></a>
          <a
            href="https://github.com/Dher10"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            GitHub <span className="arrow up-right">↗</span></a>
        </div>
      </div>
    </section>
  );
}
