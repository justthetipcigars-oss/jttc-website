'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const links = [
  { label: 'The Lounge', href: '/lounge' },
  { label: 'Out of the Lounge', href: '/out-of-the-lounge' },
  { label: 'Events', href: '/events' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleAuthClick() {
    if (loggedIn) {
      await supabase.auth.signOut();
      router.push('/');
    } else {
      router.push('/account/login');
    }
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(14,12,10,0.97)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(196,98,45,0.2)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        overflow: 'visible',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: '80px' }}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="shrink-0"
            style={{ filter: 'drop-shadow(0 0 10px rgba(196,98,45,0.7)) drop-shadow(0 0 20px rgba(196,98,45,0.4))' }}
          >
            <img
              src="/images/JTTC-LOGO-CIRCLE-CREAM.png"
              alt="Just The Tip Cigars"
              style={{ width: 56, height: 56, display: 'block' }}
            />
          </div>
          <div
            className="display"
            style={{
              color: 'var(--color-cream)',
              fontSize: '1.6rem',
              lineHeight: 1.15,
              letterSpacing: '0.03em',
            }}
          >
            Just The Tip<br />Cigars
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
            style={{ background: 'var(--color-terracotta)', color: 'var(--color-cream)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-terracotta-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-terracotta)')}
          >
            Shop Now
          </Link>
          {loggedIn ? (
            <>
              <Link
                href="/account/dashboard"
                className="px-5 py-2 text-sm font-semibold transition-all"
                style={{ border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-cream)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-charcoal)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                My Corner
              </Link>
              <button
                onClick={handleAuthClick}
                className="text-sm transition-colors"
                style={{ color: 'var(--color-smoke)', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-cream-dark)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-smoke)')}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={handleAuthClick}
              className="px-5 py-2 text-sm font-semibold transition-all"
              style={{ background: 'var(--color-terracotta)', color: 'var(--color-cream)', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-terracotta-light)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-terracotta)')}
            >
              Login
            </button>
          )}
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
            className="text-center py-3 text-sm font-semibold"
            style={{ background: 'var(--color-terracotta)', color: 'var(--color-cream)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}
            onClick={() => setMenuOpen(false)}
          >
            Shop Now
          </Link>
          {loggedIn ? (
            <>
              <Link
                href="/account/dashboard"
                className="text-center py-3 text-sm font-semibold"
                style={{ border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-cream)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', display: 'block' }}
                onClick={() => setMenuOpen(false)}
              >
                My Corner
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleAuthClick(); }}
                className="text-center py-2 text-sm"
                style={{ color: 'var(--color-smoke)', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => { setMenuOpen(false); handleAuthClick(); }}
              className="text-center py-3 text-sm font-semibold"
              style={{ background: 'var(--color-terracotta)', color: 'var(--color-cream)', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Login
            </button>
          )}
        </div>
      )}
    </header>
  );
}
