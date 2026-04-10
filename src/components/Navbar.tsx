'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const links = [
  { label: 'The Lounge', href: '/lounge' },
  { label: 'Shop', href: '/shop' },
  { label: 'Events', href: '/events' },
  { label: 'Our Story', href: '/story' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(14,12,10,0.97)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(196,98,45,0.2)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Logo placeholder — replace with actual logo image */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center border transition-colors"
            style={{ borderColor: 'var(--color-terracotta)', background: 'var(--color-charcoal)' }}
          >
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--color-terracotta)', fontSize: '0.5rem', letterSpacing: '0.05em', lineHeight: 1.2, textAlign: 'center' }}>
              JTT
            </span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cream)', fontSize: '1rem', lineHeight: 1.1, letterSpacing: '0.02em' }}>
              Just The Tip
            </div>
            <div style={{ color: 'var(--color-smoke)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Cigars
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm transition-colors"
              style={{ color: 'var(--color-cream-dark)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-terracotta)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-cream-dark)')}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/shop"
            className="px-5 py-2 text-sm font-semibold transition-all"
            style={{
              background: 'var(--color-terracotta)',
              color: 'var(--color-cream)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-terracotta-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-terracotta)')}
          >
            Shop Now
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="block w-6 h-px transition-all"
              style={{ background: 'var(--color-cream)' }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-6 flex flex-col gap-4"
          style={{ background: 'rgba(14,12,10,0.98)', borderTop: '1px solid var(--color-charcoal-mid)' }}
        >
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm py-2"
              style={{ color: 'var(--color-cream-dark)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/shop"
            className="text-center py-3 text-sm font-semibold mt-2"
            style={{ background: 'var(--color-terracotta)', color: 'var(--color-cream)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
            onClick={() => setMenuOpen(false)}
          >
            Shop Now
          </Link>
        </div>
      )}
    </header>
  );
}
