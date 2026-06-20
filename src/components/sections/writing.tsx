import Reveal from '@/components/shared/reveal';
import SectionHead from '@/components/shared/section-head';

export default function Writing() {
  return (
    <section id="writing" className="writing">
      <div className="container">
        <Reveal>
          <SectionHead
            index="02 — Writing &amp; Artifacts"
            heading="Notes, frameworks, and works in progress."
          />
          <div className="writing-grid">
            <a
              href="https://github.com/Dher10/PM-AI-Prompts"
              target="_blank"
              rel="noopener noreferrer"
              className="artifact"
            >
              <div className="a-meta">repository · github</div>
              <h3>PM-AI-Prompts</h3>
              <p>
                An open, in-progress library of prompts and workflows for AI-assisted product
                management.
              </p>
              <div className="a-foot">
                <span className="ghost-link">
                  View on GitHub <span className="arrow up-right">↗</span>
                </span>
              </div>
            </a>

            <a href="#contact" className="artifact">
              <div className="a-meta">essays · coming soon</div>
              <h3>Essays coming soon</h3>
              <p>
                Notes on AI product management, operations discipline, and how to ship
                software that earns trust.
              </p>
              <div className="a-foot">
                <span className="ghost-link">
                  Reach out <span className="arrow">→</span>
                </span>
              </div>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
