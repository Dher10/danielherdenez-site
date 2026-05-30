'use client';
import { Fragment } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import SectionHead from '@/components/shared/section-head';

const cases = [
  {
    meta: 'case · 01',
    title: 'From workflow tool to AI agent platform',
    desc: 'Leading the product evolution from a workflow management SaaS into the foundation for AI agent orchestration. Defining roadmap, metrics, and GTM.',
    tags: ['Product strategy', 'AI agents', 'Since 2025'],
    cta: 'read',
  },
  {
    meta: 'case · 02',
    title: 'Designing governance for a multi-product platform',
    desc: 'Shaping the admin layer for a SaaS suite where multiple products share users, billing, and access. Evolving the early mockup into a coherent model for organization-level configuration and cross-product interactions that reduce friction across tools.',
    tags: ['Platform', 'Governance', 'Since 2026'],
    cta: 'read',
  },
  {
    meta: 'case · 03',
    title: 'How I use AI to do product work',
    desc: 'A public library documenting the prompts, workflows, and frameworks I use to do PM work faster and better. Built in production, not theory.',
    tags: ['Open source', 'GitHub', 'Since 2026'],
    cta: 'view',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function Work() {
  const shouldReduce = useReducedMotion();

  return (
    <section id="work" className="work" data-screen-label="02 Work">
      <div className="container">
        <SectionHead index="01 — Work" heading="What I'm building right now." />
        <motion.div
          className="work-grid"
          variants={shouldReduce ? undefined : containerVariants}
          initial={shouldReduce ? false : 'hidden'}
          whileInView={shouldReduce ? undefined : 'show'}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        >
          {cases.map((c, i) => (
            <motion.a
              key={i}
              href="#"
              className="case"
              variants={shouldReduce ? undefined : cardVariants}
            >
              <div className="case-meta">{c.meta}</div>
              <h3>{c.title}</h3>
              <p className="desc">{c.desc}</p>
              <div className="case-foot">
                <div className="tags">
                  {c.tags.map((tag, ti) => (
                    <Fragment key={ti}>
                      <span>{tag}</span>
                      {ti < c.tags.length - 1 && <span className="sep">·</span>}
                    </Fragment>
                  ))}
                </div>
                <span className="read">
                  {c.cta} <span className="arrow">→</span>
                </span>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
