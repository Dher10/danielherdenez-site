'use client';

import { motion } from 'framer-motion';
import CaseCard from '@/components/shared/case-card';
import SectionHead from '@/components/shared/section-head';
import { cases } from '@/lib/cases';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function Work() {
  // Reduced motion is handled by MotionConfig in the root layout — see
  // motion-provider.tsx. Branching the tree here stranded the SSR opacity:0.
  return (
    <section id="work" className="work">
      <div className="container">
        <SectionHead index="01 — Work" heading="What I'm building right now." />
        <motion.div
          className="work-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        >
          {cases.map((c) => (
            <CaseCard key={c.title} {...c} variants={cardVariants} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
