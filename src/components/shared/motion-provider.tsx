'use client';

import { MotionConfig } from 'framer-motion';

/**
 * reducedMotion="user" lets Framer honour prefers-reduced-motion for the
 * motion that still runs through it (the case-card hover lift).
 *
 * Scroll reveals no longer use Framer: its `initial` state was server-rendered
 * as inline `opacity: 0`, which hid content without JavaScript, in print and
 * in full-page captures. Reveal is now CSS plus an IntersectionObserver that
 * only hides content after the reader scrolls; see reveal.tsx.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
