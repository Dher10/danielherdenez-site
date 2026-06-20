'use client';

import { motion, useReducedMotion } from 'framer-motion';
import CaseCard from '@/components/shared/case-card';
import SectionHead from '@/components/shared/section-head';

const cases = [
  {
    meta: 'case \u00b7 01',
    title: 'From workflow software to AI-assisted operations',
    desc: 'How a case platform built on real operations work grew into one that puts AI inside the workflow, on purpose and under control.',
    tags: ['Product strategy', 'AI-assisted', 'Since 2025'],
    cta: 'read',
    href: '/work/veflo-trace',
  },
  {
    meta: 'Internal platform \u00b7 Since 2026',
    title: 'Designing product work beside an agentic build system',
    desc: 'What it takes to be product manager of an internal platform built by a fast-moving agentic system, and how product work keeps pace without becoming the bottleneck.',
    tags: ['Platform', 'AI-assisted', 'Since 2026'],
    cta: 'read',
    href: '/work/internal-platform',
  },
  {
    meta: 'case \u00b7 03',
    title: 'How I use AI to do product work',
    desc: 'A public library documenting the prompts, workflows, and frameworks I use to do PM work faster and better. Built in production, not theory.',
    tags: ['Open source', 'GitHub', 'Since 2026'],
    cta: 'view',
    href: '#',
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
    <section id="work" className="work">
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
            <CaseCard
              key={i}
              href={c.href}
              meta={c.meta}
              title={c.title}
              desc={c.desc}
              tags={c.tags}
              cta={c.cta}
              variants={shouldReduce ? undefined : cardVariants}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
