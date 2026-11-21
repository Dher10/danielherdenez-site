import type { ReactNode } from 'react';

export interface Fact {
  label: string;
  value: ReactNode;
}

/**
 * Short facts under a case-study title: status, cost, stack, links.
 * Facts only, one line each. Same visual family as the home proof tiles.
 */
export default function FactsStrip({ facts }: { facts: Fact[] }) {
  return (
    <dl className="facts-strip">
      {facts.map((fact) => (
        <div className="fact" key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
