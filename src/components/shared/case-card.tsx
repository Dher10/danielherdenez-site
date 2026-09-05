'use client';

import { Fragment } from 'react';
import { motion, type Variants } from 'framer-motion';

export interface CaseCardProps {
  meta: string;
  title: string;
  desc: string;
  tags: string[];
  /** Omit to render a non-interactive card — nothing clickable that goes nowhere. */
  href?: string;
  /** Only rendered alongside href. */
  cta?: string;
  /** Short status chip, e.g. "Coming soon". */
  badge?: string;
  variants?: Variants;
}

export default function CaseCard({
  meta,
  title,
  desc,
  tags,
  cta,
  href,
  badge,
  variants,
}: CaseCardProps) {
  const body = (
    <>
      <div className="case-head">
        <div className="case-meta">{meta}</div>
        {badge && <span className="case-badge">{badge}</span>}
      </div>
      <h3>{title}</h3>
      <p className="desc">{desc}</p>
      <div className="case-foot">
        <div className="tags">
          {tags.map((tag, index) => (
            <Fragment key={tag}>
              <span>{tag}</span>
              {index < tags.length - 1 && (
                <span className="sep" aria-hidden="true">
                  &middot;
                </span>
              )}
            </Fragment>
          ))}
        </div>
        {href && cta && (
          <span className="read">
            {cta} <span className="arrow">&rarr;</span>
          </span>
        )}
      </div>
    </>
  );

  if (!href) {
    return (
      <motion.div className="case case-inactive" variants={variants}>
        {body}
      </motion.div>
    );
  }

  return (
    <motion.a href={href} className="case" variants={variants}>
      {body}
    </motion.a>
  );
}
