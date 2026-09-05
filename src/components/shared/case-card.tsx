'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

const MotionLink = motion.create(Link);

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
  headingLevel?: 2 | 3;
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
  headingLevel = 3,
  variants,
}: CaseCardProps) {
  const shouldReduce = useReducedMotion();
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  const body = (
    <>
      <div className="case-head">
        <div className="case-meta">{meta}</div>
        {badge && <span className="case-badge">{badge}</span>}
      </div>
      <Heading>{title}</Heading>
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
    <MotionLink
      href={href}
      className="case"
      variants={variants}
      // The -2px lift is specified in DESIGN.md, but it cannot live in CSS here:
      // this is a motion component, so Framer's inline transform always beats
      // `.case:hover { transform }` from the stylesheet. Background and border
      // stay in CSS, which Framer does not touch.
      //
      // Gated on useReducedMotion because MotionConfig reducedMotion="user"
      // only skips the *animation* and still applies the end value, which would
      // leave the card jumping 2px on hover. Unlike `initial`, whileHover has no
      // server-rendered style, so branching on it is hydration-safe.
      whileHover={
        shouldReduce
          ? undefined
          : { y: -2, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const } }
      }
    >
      {body}
    </MotionLink>
  );
}
