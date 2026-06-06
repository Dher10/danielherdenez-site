'use client';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Monogram from '@/components/shared/monogram';
import ThemeToggle from '@/components/shared/theme-toggle';

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const displayActiveSection = pathname === '/about' ? 'about' : activeSection;

  const navLinks = [
    { href: '/#work', label: 'Work', id: 'work' },
    { href: '/about', label: 'About', id: 'about' },
    { href: '/#writing', label: 'Writing & Artifacts', id: 'writing' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== '/') return;

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
  }, [pathname]);

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <div className="nav-inner">
        <Monogram />
        <nav className="nav-links" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={displayActiveSection === link.id ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} strokeWidth={1.6} /> : <Menu size={20} strokeWidth={1.6} />}
          </button>
        </div>
      </div>
      <nav
        id="mobile-nav-menu"
        className={`mobile-nav-menu${menuOpen ? ' open' : ''}`}
        aria-label="Mobile primary"
      >
        {navLinks.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className={displayActiveSection === link.id ? 'active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
