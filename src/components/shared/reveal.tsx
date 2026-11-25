'use client';
import { useEffect, useRef } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Fade the direct children in one after another (home work grid). */
  stagger?: boolean;
}

/** Hide an element only while it sits within this distance below the viewport. */
const ARM_MARGIN = '0px 0px 25% 0px';
/** Play once the element is 10% inside the bottom edge, as the original spec. */
const PLAY_MARGIN = '0px 0px -10% 0px';

/**
 * Fade-up on scroll as progressive enhancement.
 *
 * The server renders the content fully visible, and nothing hides it until
 * the reader scrolls. Only then is an element that is still below the
 * viewport "armed" (hidden by CSS, see `.reveal.is-armed`), and it plays the
 * fade-up when it enters. So without JavaScript, in print, for crawlers, in a
 * full-page capture of a fresh load, and under reduced motion, every element
 * stays visible. The hidden state is screen-only CSS, so printing mid-scroll
 * never loses content either.
 */
export default function Reveal({ children, className, stagger = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    // Non-null binding so the nested handlers keep the narrowed type.
    const el: HTMLDivElement = node;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let armed = false;
    let timer: number | undefined;
    let armer: IntersectionObserver | undefined;

    const player = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        stop();
        if (!armed) return;
        el.classList.add('is-playing');
        el.classList.remove('is-armed');
        timer = window.setTimeout(() => el.classList.remove('is-playing'), 1000);
      },
      { rootMargin: PLAY_MARGIN },
    );

    function stop() {
      player.disconnect();
      armer?.disconnect();
      window.removeEventListener('scroll', startArming);
    }

    // Arm only after the reader scrolls: a fresh load never hides anything.
    function startArming() {
      window.removeEventListener('scroll', startArming);
      armer = new IntersectionObserver(
        ([entry]) => {
          if (armed || !entry.isIntersecting) return;
          if (entry.boundingClientRect.top < window.innerHeight) {
            // Already on screen (jump, fast scroll, tall viewport): leave it be.
            stop();
            return;
          }
          armed = true;
          el.classList.add('is-armed');
          armer?.disconnect();
          player.observe(el);
        },
        { rootMargin: ARM_MARGIN },
      );
      armer.observe(el);
    }

    window.addEventListener('scroll', startArming, { passive: true, once: true });

    return () => {
      stop();
      window.clearTimeout(timer);
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
