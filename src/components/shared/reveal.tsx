'use client';
import { motion } from 'framer-motion';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reduced motion is handled by MotionConfig in the root layout, not by
 * branching here — see motion-provider.tsx. The tree must stay identical
 * between server and client or the SSR `initial` style gets stranded.
 */
export default function Reveal({ children, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
    >
      {children}
    </motion.div>
  );
}
