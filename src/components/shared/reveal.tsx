'use client';
import { useEffect, useRef } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Fade the direct children in one after another (home work grid). */
  stagger?: boolean;
}

/** Arm (hide) an element only while its top sits within this many viewports below the bottom edge. */
const ARM_BAND = 0.25;
/** An armed element shows after this long even if it never enters the viewport. */
const FAILSAFE_MS = 1200;
/** Drop `.is-playing` once the longest transition (stagger: 160ms delay + 600ms) is over. */
const PLAY_MS = 1000;

/**
 * Fade-up on scroll as progressive enhancement.
 *
 * The server renders the content fully visible, and nothing hides it until
 * the reader scrolls. Only then is an element whose top is still below the
 * viewport, and below everything the reader has already seen, "armed"
 * (hidden by CSS, see `.reveal.is-armed`). It plays the fade-up as soon as
 * any part of it enters the viewport. So without JavaScript, in print, for
 * crawlers, in a full-page capture of a fresh load, and under reduced
 * motion, every element stays visible.
 *
 * Content must never end up hidden, so the state is checked against the live
 * layout on every scroll frame instead of relying on observer callbacks:
 * - an armed element plays as soon as its top is above the bottom edge,
 *   including when a fast scroll carried it past the viewport in one frame;
 * - an element the reader has already scrolled past (at any speed, in either
 *   direction) is never armed;
 * - an armed element plays after FAILSAFE_MS whatever happens.
 */
export default function Reveal({ children, className, stagger = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Non-null binding so the nested handlers keep the narrowed type.
    const el: HTMLDivElement = node;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let state: 'idle' | 'armed' | 'done' = 'idle';
    let frame = 0;
    let failsafe: number | undefined;
    let playTimer: number | undefined;
    // Lowest document position the reader has had on screen so far.
    let seenBottom = window.scrollY + window.innerHeight;

    function finish() {
      state = 'done';
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(failsafe);
    }

    function play() {
      const wasArmed = state === 'armed';
      finish();
      if (!wasArmed) return;
      el.classList.add('is-playing');
      el.classList.remove('is-armed');
      playTimer = window.setTimeout(() => el.classList.remove('is-playing'), PLAY_MS);
    }

    function check() {
      frame = 0;
      const viewport = window.innerHeight;
      const top = el.getBoundingClientRect().top;
      const docTop = top + window.scrollY;
      const seenBefore = seenBottom;
      seenBottom = Math.max(seenBottom, window.scrollY + viewport);

      if (state === 'armed') {
        // In view, or already carried past it: show it.
        if (top < viewport) play();
        return;
      }
      // Reached, in view or passed, or inside what the reader has seen: never hide it.
      if (top < viewport || docTop < seenBefore) {
        finish();
        return;
      }
      if (top < viewport * (1 + ARM_BAND)) {
        state = 'armed';
        el.classList.add('is-armed');
        failsafe = window.setTimeout(play, FAILSAFE_MS);
      }
    }

    function onScroll() {
      if (!frame) frame = window.requestAnimationFrame(check);
    }

    // Arm only after the reader scrolls: a fresh load never hides anything.
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      finish();
      window.clearTimeout(playTimer);
      el.classList.remove('is-armed', 'is-playing');
    };
  }, []);

  const classes = ['reveal', stagger ? 'reveal-stagger' : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}
