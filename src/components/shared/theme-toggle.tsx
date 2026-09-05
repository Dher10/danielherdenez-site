'use client';

import { useSyncExternalStore } from 'react';

function isLightTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light';
}

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

// The bootstrap script may apply a saved theme before React hydrates.
const serverTheme = () => false;

export default function ThemeToggle() {
  const isLight = useSyncExternalStore(subscribeToTheme, isLightTheme, serverTheme);
  const toggle = () => {
    const nextIsLight = !isLightTheme();
    if (!nextIsLight) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem('dh-theme', nextIsLight ? 'light' : 'dark');
    } catch {
      // The current page can still switch themes when persistence is unavailable.
    }
  };

  return (
    <button className="theme-toggle" type="button" onClick={toggle} aria-label="Light theme" aria-pressed={isLight}>
      <svg
        aria-hidden="true"
        className="icon-sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg
        aria-hidden="true"
        className="icon-moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
