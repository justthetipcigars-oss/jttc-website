'use client';

import { useState, useEffect, useRef } from 'react';
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

const accountLinks = [
  { label: 'Go To My Corner',    href: '/account/dashboard' },
  { label: 'Purchase History',   href: '/account/history' },
  { label: 'Wishlist',           href: '/account/wishlist' },
  { label: 'My Humidor',         href: '/account/humidor' },
  { label: 'My Ashtray',         href: '/account/ashtray' },
  { label: 'Tasting Journal',    href: '/account/journal' },
];

export default function Navbar() {
  const [scrolled,      setScrolled]      = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [loggedIn,      setLoggedIn]      = useState(false);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [mobileAccOpen, setMobileAccOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    setDropdownOpen(false);
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push('/');
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
            style={{ color: 'var(--color-cream)', fontSize: '1.6rem', lineHeight: 1.15, letterSpacing: '0.03em' }}
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

          {/* ── My Account dropdown (logged in) / Sign In button (logged out) ── */}
          {loggedIn ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              {/* Trigger button */}
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="px-5 py-2 text-sm font-semibold transition-all flex items-center gap-2"
                style={{
                  border: '1px solid var(--color-charcoal-mid)',
                  color: 'var(--color-cream)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: dropdownOpen ? 'var(--color-charcoal)' : 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-charcoal)')}
                onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.background = 'transparent'; }}
              >
                My Account
                <svg
                  width="10" height="6" viewBox="0 0 10 6" fill="none"
                  style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    minWidth: '220px',
                    background: 'rgba(14,12,10,0.98)',
                    border: '1px solid var(--color-charcoal-mid)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 50,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  }}
                >
                  {accountLinks.map((item, i) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'block',
                        padding: '0.75rem 1.25rem',
                        fontSize: '0.78rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: i === 0 ? 'var(--color-terracotta)' : 'var(--color-cream-dark)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--color-charcoal-mid)',
                        transition: 'background 0.15s, color 0.15s',
                        fontWeight: i === 0 ? 600 : 400,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--color-charcoal)';
                        e.currentTarget.style.color = 'var(--color-cream)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = i === 0 ? 'var(--color-terracotta)' : 'var(--color-cream-dark)';
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {/* Divider + Sign Out */}
                  <button
                    onClick={handleSignOut}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.75rem 1.25rem',
                      fontSize: '0.78rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-smoke)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--color-charcoal)';
                      e.currentTarget.style.color = 'var(--color-cream)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--color-smoke)';
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push('/account/login')}
              className="px-5 py-2 text-sm font-semibold transition-all"
              style={{ background: 'var(--color-terracotta)', color: 'var(--color-cream)', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-terracotta-light)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-terracotta)')}
            >
              Sign In
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
            <span key={i} className="block w-6 h-px transition-all" style={{ background: 'var(--color-cream)' }} />
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
            <div>
              {/* My Account accordion toggle */}
              <button
                onClick={() => setMobileAccOpen(o => !o)}
                className="w-full text-center py-3 text-sm font-semibold flex items-center justify-center gap-2"
                style={{ border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-cream)', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                My Account
                <svg
                  width="10" height="6" viewBox="0 0 10 6" fill="none"
                  style={{ transition: 'transform 0.2s', transform: mobileAccOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {mobileAccOpen && (
                <div style={{ borderLeft: '2px solid var(--color-terracotta)', marginTop: '4px', paddingLeft: '1rem' }}>
                  {accountLinks.map((item, i) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-2 text-sm"
                      style={{
                        color: i === 0 ? 'var(--color-terracotta)' : 'var(--color-cream-dark)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        fontWeight: i === 0 ? 600 : 400,
                      }}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleSignOut}
                    className="block py-2 text-sm w-full text-left"
                    style={{ color: 'var(--color-smoke)', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => { setMenuOpen(false); router.push('/account/login'); }}
              className="text-center py-3 text-sm font-semibold"
              style={{ background: 'var(--color-terracotta)', color: 'var(--color-cream)', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );
}
