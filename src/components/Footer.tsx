'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--color-charcoal)', borderTop: '1px solid var(--color-charcoal-mid)' }}>
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand */}
        <div className="md:col-span-1">
          <div style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cream)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Just The Tip Cigars
          </div>
          <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Premium Cigar Lounge
          </div>
          <p style={{ color: 'var(--color-smoke)', fontSize: '0.875rem', lineHeight: 1.7 }}>
            Can't wait to smoke with y'all.
          </p>
        </div>

        {/* Hours */}
        <div>
          <h4 style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Hours
          </h4>
          <div style={{ color: 'var(--color-smoke)', fontSize: '0.875rem', lineHeight: 2 }}>
            {/* TODO: Pull from Sanity CMS */}
            <div className="flex justify-between gap-4"><span>Mon – Thu</span><span>11am – 9pm</span></div>
            <div className="flex justify-between gap-4"><span>Fri – Sat</span><span>11am – 10pm</span></div>
            <div className="flex justify-between gap-4"><span>Sunday</span><span>12pm – 7pm</span></div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h4 style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Location
          </h4>
          <address style={{ color: 'var(--color-smoke)', fontSize: '0.875rem', fontStyle: 'normal', lineHeight: 2 }}>
            2550 Brownsville Road<br />
            South Park Township, PA<br />
            <a
              href="tel:+1XXXXXXXXXX"
              style={{ color: 'var(--color-cream-dark)' }}
            >
              {/* TODO: Add phone number */}
              (XXX) XXX-XXXX
            </a>
          </address>
          <a
            href="https://maps.google.com/?q=2550+Brownsville+Road+South+Park+Township+PA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-xs"
            style={{ color: 'var(--color-terracotta)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            Get Directions →
          </a>
        </div>

        {/* Nav */}
        <div>
          <h4 style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Explore
          </h4>
          <nav className="flex flex-col gap-2">
            {[
              { label: 'The Lounge', href: '/lounge' },
              { label: 'Shop', href: '/shop' },
              { label: 'Events', href: '/events' },
              { label: 'Our Story', href: '/story' },
              { label: 'Contact', href: '/contact' },
              { label: 'Military Discount', href: '/military-discount' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm transition-colors w-fit"
                style={{ color: 'var(--color-smoke)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-cream)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-smoke)')}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ borderTop: '1px solid var(--color-charcoal-mid)' }}
      >
        <p style={{ color: 'var(--color-charcoal-light)', fontSize: '0.75rem' }}>
          © {new Date().getFullYear()} Just The Tip Cigars. All rights reserved.
        </p>
        <p style={{ color: 'var(--color-charcoal-light)', fontSize: '0.75rem' }}>
          Must be 21+ to purchase tobacco products.
        </p>
      </div>
    </footer>
  );
}
