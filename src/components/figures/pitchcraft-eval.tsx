/**
 * Figure: two results from the test set of the writer evaluation
 * (docs/results-planB.md, section 1, labels by Daniel).
 * Unit charts: one square per sentence, one block per report.
 */
function Units({ total, marked, unit }: { total: number; marked: number; unit: 'sentence' | 'report' }) {
  return (
    <div className={`units units-${unit}`} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i >= total - marked ? 'unit unit-marked' : 'unit'} />
      ))}
    </div>
  );
}

export default function PitchcraftEval() {
  return (
    <div className="eval-panels">
      <div
        className="eval-panel"
        role="img"
        aria-label="Sentences flagged by the automatic checks: 36 of 40 were supported, 4 were errors."
      >
        <p className="eval-label">Sentences flagged by the checks</p>
        <Units total={40} marked={4} unit="sentence" />
        <p className="eval-result">
          <strong>36 of 40</strong> were supported
        </p>
        <p className="eval-legend">
          <span className="legend-item"><span className="unit" aria-hidden="true" /> supported</span>
          <span className="legend-item"><span className="unit unit-marked" aria-hidden="true" /> error</span>
        </p>
      </div>
      <div
        className="eval-panel"
        role="img"
        aria-label="Reports that passed the checks: 3 of 5 still had an unsupported sentence."
      >
        <p className="eval-label">Reports that passed the checks</p>
        <Units total={5} marked={3} unit="report" />
        <p className="eval-result">
          <strong>3 of 5</strong> still had an unsupported sentence
        </p>
        <p className="eval-legend">
          <span className="legend-item"><span className="unit" aria-hidden="true" /> clean</span>
          <span className="legend-item"><span className="unit unit-marked" aria-hidden="true" /> unsupported sentence</span>
        </p>
      </div>
    </div>
  );
}
