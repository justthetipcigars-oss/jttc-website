import Link from 'next/link';

export default function AboutStrip() {
  return (
    <section style={{ background: 'var(--color-charcoal)' }}>
      <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* 📸 PHOTO PLACEHOLDER — Replace with a warm interior shot.
            Ideal: leather armchairs, amber lighting, cigars on a side table,
            someone relaxed with a drink. Feels like stepping into a friend's
            private study or a high-end western ranch lounge. */}
        <div
          className="relative aspect-[4/3] rounded-sm overflow-hidden order-2 lg:order-1"
          style={{ background: 'var(--color-charcoal-mid)' }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ border: '1px dashed var(--color-charcoal-light)' }}
          >
            <div className="text-center p-8">
              <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Photo Placeholder
              </div>
              <div style={{ color: 'var(--color-charcoal-light)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                Warm lounge interior —<br />leather chairs, amber light,<br />terracotta walls
              </div>
            </div>
          </div>
          {/* Decorative corner accent */}
          <div
            className="absolute top-4 left-4 w-8 h-8"
            style={{ borderTop: '2px solid var(--color-terracotta)', borderLeft: '2px solid var(--color-terracotta)' }}
          />
          <div
            className="absolute bottom-4 right-4 w-8 h-8"
            style={{ borderBottom: '2px solid var(--color-terracotta)', borderRight: '2px solid var(--color-terracotta)' }}
          />
        </div>

        {/* Text */}
        <div className="order-1 lg:order-2">
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            The Lounge
          </div>

          <h2
            className="display mb-6"
            style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight: 600,
              color: 'var(--color-cream)',
              lineHeight: 1.2,
            }}
          >
            More Than a Smoke Shop.<br />
            <span style={{ color: 'var(--color-terracotta)' }}>It's Your Third Place.</span>
          </h2>

          <div style={{ color: 'var(--color-smoke)', lineHeight: 1.9, fontSize: '0.95rem' }}>
            <p className="mb-4">
              Just The Tip Cigars was built for the people who know that the best conversations happen
              with a good cigar in hand. We carry a hand-selected lineup of premium sticks, but what
              keeps people coming back isn't the inventory — it's the room.
            </p>
            <p className="mb-6">
              Pull up a leather chair, pour something worth sipping, and settle in. South Park Township
              hasn't seen anything quite like it.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/story"
              className="text-sm font-semibold tracking-widest uppercase transition-colors"
              style={{ color: 'var(--color-terracotta)', letterSpacing: '0.15em' }}
            >
              Read Our Story →
            </Link>
            <span className="w-px h-5" style={{ background: 'var(--color-charcoal-light)' }} />
            <Link
              href="/lounge"
              className="text-sm tracking-widest uppercase transition-colors"
              style={{ color: 'var(--color-smoke)', letterSpacing: '0.15em' }}
            >
              Tour the Lounge
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
