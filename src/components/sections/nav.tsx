'use client';
import { useState, useEffect } from 'react';
import Monogram from '@/components/shared/monogram';
import ThemeToggle from '@/components/shared/theme-toggle';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = ['work', 'about', 'writing'];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <div className="nav-inner">
        <Monogram />
        <nav className="nav-links" aria-label="Primary">
          <a href="#work" className={activeSection === 'work' ? 'active' : ''}>Work</a>
          <a href="#about" className={activeSection === 'about' ? 'active' : ''}>About</a>
          <a href="#writing" className={activeSection === 'writing' ? 'active' : ''}>
            Writing &amp; Artifacts
          </a>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
