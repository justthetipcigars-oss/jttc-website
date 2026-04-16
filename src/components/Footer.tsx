import Image from 'next/image';
import Link from 'next/link';

const GOOGLE_REVIEW_URL = 'https://g.page/r/CQ2VJvYGMQFfEAI/review';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--color-charcoal)', borderTop: '1px solid var(--color-charcoal-mid)' }}>
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <Image src="/images/10.svg" alt="Just The Tip Cigars" width={40} height={40} />
            <div className="display" style={{ color: 'var(--color-cream)', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.2 }}>
              Just The Tip Cigars
            </div>
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
            <div className="flex justify-between gap-4"><span>Mon – Tue</span><span>12pm – 9pm</span></div>
            <div className="flex justify-between gap-4"><span>Wed – Sat</span><span>10am – 9pm</span></div>
            <div className="flex justify-between gap-4"><span>Sunday</span><span>12pm – 9pm</span></div>
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
              href="tel:+17249579229"
              style={{ color: 'var(--color-cream-dark)' }}
            >
              (724) 957-9229
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
              { label: 'The Lounge',  href: '/lounge' },
              { label: 'Shop',        href: '/shop' },
              { label: 'Our Brands',  href: '/brands' },
              { label: 'Events',      href: '/events' },
              { label: 'Our Story',   href: '/our-story' },
              { label: 'Contact',     href: '/contact' },
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
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm transition-colors w-fit flex items-center gap-1 mt-1"
              style={{ color: 'var(--color-terracotta)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-cream)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-terracotta)')}
            >
              ★ Leave Us a Review
            </a>
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
