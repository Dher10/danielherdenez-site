'use client';

import { MotionConfig } from 'framer-motion';

/**
 * reducedMotion="user" lets Framer honour prefers-reduced-motion internally:
 * transform and layout animations are dropped, opacity still resolves.
 *
 * This has to be handled inside Framer rather than by branching the component
 * tree on useReducedMotion(). The server has no media query, so it renders the
 * `initial` state as inline `opacity: 0`. If the client then renders a
 * different tree, nothing owns that inline style and it never gets cleared —
 * which left every revealed section invisible for reduced-motion users.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
