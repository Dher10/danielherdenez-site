import Reveal from '@/components/shared/reveal';

export default function Proof() {
  return (
    <section className="proof" aria-label="At a glance">
      <div className="container">
        <Reveal>
          <div className="proof-grid">
            <div className="proof-tile">
              <span className="label">CURRENT</span>
              <p className="value">Product Manager at MindTechSourcing</p>
            </div>
            <div className="proof-tile">
              <span className="label">FOCUS</span>
              <p className="value">Workflow platforms with native AI</p>
            </div>
            <div className="proof-tile">
              <span className="label">BACKGROUND</span>
              <p className="value">Industrial engineering, operations, lean</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
