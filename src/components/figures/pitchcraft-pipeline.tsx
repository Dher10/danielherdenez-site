const steps = [
  { name: 'Schedule', text: 'GitHub Actions starts the daily job.' },
  { name: 'Fetch', text: 'MLB Stats API and Statcast, with scouting data through the day before the game.' },
  { name: 'Write and check', text: 'The agents turn the data into findings and a rules-based report. The critic tests every claim.' },
  { name: 'Validate', text: 'The job checks the file against the eight rules of the data contract.' },
  { name: 'Publish', text: 'A bot commits the file and Vercel serves it.' },
];

/** Figure: the daily PitchCraft pipeline, as an ordered list so it reads without the picture. */
export default function PitchcraftPipeline() {
  return (
    <div className="pipeline">
      <ol className="pipeline-steps">
        {steps.map((step, i) => (
          <li key={step.name} className="pipeline-step">
            <span className="pipeline-index" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="pipeline-name">{step.name}</span>
            <span className="pipeline-text">{step.text}</span>
          </li>
        ))}
      </ol>
      <p className="pipeline-note">A file that fails validation is not published.</p>
    </div>
  );
}
