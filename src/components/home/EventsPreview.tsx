import Link from 'next/link';

// Placeholder events — will be replaced with Sanity CMS data
const PLACEHOLDER_EVENTS = [
  {
    id: '1',
    date: { month: 'APR', day: '19', year: '2026' },
    title: 'Saturday Night Smoke',
    description: 'Kick back with the crew. Featured stick of the night, drink specials, and good company.',
    tag: 'Weekly',
  },
  {
    id: '2',
    date: { month: 'APR', day: '25', year: '2026' },
    title: 'Padron Tasting Night',
    description: 'A guided tasting of the Padron 1964 Anniversary Series with a rep from the brand on hand.',
    tag: 'Tasting',
  },
  {
    id: '3',
    date: { month: 'MAY', day: '3', year: '2026' },
    title: 'Cigar & Bourbon Pairing',
    description: 'Four pairings, four rounds. Learn what to reach for when you pour something worth sipping.',
    tag: 'Pairing',
  },
];

export default function EventsPreview() {
  return (
    <section style={{ background: 'var(--color-charcoal)' }}>
      <div className="max-w-7xl mx-auto px-6 py-24">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              At the Lounge
            </div>
            <h2
              className="display"
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 600,
                color: 'var(--color-cream)',
                lineHeight: 1.2,
              }}
            >
              Coming Up<br />
              <span style={{ color: 'var(--color-terracotta)' }}>Don't Miss Out</span>
            </h2>
          </div>
          <Link
            href="/events"
            className="text-sm font-semibold tracking-widest uppercase shrink-0"
            style={{ color: 'var(--color-smoke)', letterSpacing: '0.15em' }}
          >
            Full Calendar →
          </Link>
        </div>

        {/* Events */}
        <div className="flex flex-col gap-px" style={{ background: 'var(--color-charcoal-mid)' }}>
          {PLACEHOLDER_EVENTS.map(event => (
            <div
              key={event.id}
              className="group flex flex-col sm:flex-row gap-6 p-6 sm:p-8 transition-colors"
              style={{ background: 'var(--color-charcoal)' }}
            >
              {/* Date block */}
              <div
                className="shrink-0 w-20 h-20 flex flex-col items-center justify-center"
                style={{ background: 'var(--color-charcoal-mid)', border: '1px solid var(--color-charcoal-light)' }}
              >
                <span style={{ color: 'var(--color-terracotta)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  {event.date.month}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cream)', fontSize: '2rem', lineHeight: 1 }}>
                  {event.date.day}
                </span>
                <span style={{ color: 'var(--color-smoke)', fontSize: '0.65rem' }}>
                  {event.date.year}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-xs px-2 py-0.5"
                    style={{
                      background: 'rgba(196,98,45,0.15)',
                      color: 'var(--color-terracotta)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {event.tag}
                  </span>
                </div>
                <h3
                  className="mb-2 font-semibold"
                  style={{
                    color: 'var(--color-cream)',
                    fontSize: '1.2rem',
                  }}
                >
                  {event.title}
                </h3>
                <p style={{ color: 'var(--color-smoke)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                  {event.description}
                </p>
              </div>

              {/* Add to calendar */}
              <div className="shrink-0 flex items-center">
                <Link
                  href={`/events/${event.id}`}
                  className="text-xs tracking-widest uppercase transition-colors whitespace-nowrap"
                  style={{ color: 'var(--color-smoke)', letterSpacing: '0.15em' }}
                >
                  + Add to Calendar
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/events"
            className="inline-block px-10 py-4 text-sm font-semibold tracking-widest uppercase transition-all"
            style={{
              border: '1px solid var(--color-terracotta)',
              color: 'var(--color-terracotta)',
              letterSpacing: '0.15em',
            }}
          >
            See All Events
          </Link>
        </div>
      </div>
    </section>
  );
}
