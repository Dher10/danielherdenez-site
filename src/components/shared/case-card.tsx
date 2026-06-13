'use client';

import { Fragment } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface CaseCardProps {
  meta: string;
  title: string;
  desc: string;
  tags: string[];
  cta: string;
  href: string;
  variants?: HTMLMotionProps<'a'>['variants'];
}

export default function CaseCard({ meta, title, desc, tags, cta, href, variants }: CaseCardProps) {
  return (
    <motion.a href={href} className="case" variants={variants}>
      <div className="case-meta">{meta}</div>
      <h3>{title}</h3>
      <p className="desc">{desc}</p>
      <div className="case-foot">
        <div className="tags">
          {tags.map((tag, index) => (
            <Fragment key={tag}>
              <span>{tag}</span>
              {index < tags.length - 1 && <span className="sep">&middot;</span>}
            </Fragment>
          ))}
        </div>
        <span className="read">
          {cta} <span className="arrow">&rarr;</span>
        </span>
      </div>
    </motion.a>
  );
}
