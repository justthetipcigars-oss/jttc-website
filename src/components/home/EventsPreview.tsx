import Link from 'next/link';
import { getEvents, JTTEvent } from '@/lib/events';

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return {
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day: String(day).padStart(2, '0'),
    year: String(year),
  };
}

function eventTag(event: JTTEvent) {
  if (event.subcategory === 'recurring') return 'Recurring';
  if (event.subcategory === 'pop-up')    return 'Pop-Up';
  if (event.category === 'off-site')     return 'Off-Site';
  return 'Event';
}

export default async function EventsPreview() {
  let upcoming: JTTEvent[] = [];
  try {
    const today = new Date().toISOString().slice(0, 10);
    const all   = await getEvents();
    upcoming    = all.filter(e => e.date >= today).slice(0, 3);
  } catch {
    // Fall through to empty state
  }

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
              <span style={{ color: 'var(--color-terracotta)' }}>Don&apos;t Miss Out</span>
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

        {upcoming.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: 'var(--color-smoke)', fontSize: '0.95rem' }}>
              Check back soon — more events are being added.
            </p>
            <Link
              href="/events"
              className="inline-block mt-6 px-8 py-3 text-sm font-semibold tracking-widest uppercase"
              style={{ border: '1px solid var(--color-terracotta)', color: 'var(--color-terracotta)', letterSpacing: '0.15em' }}
            >
              View All Events
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-px" style={{ background: 'var(--color-charcoal-mid)' }}>
              {upcoming.map(event => {
                const date = formatDate(event.date);
                return (
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
                        {date.month}
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cream)', fontSize: '2rem', lineHeight: 1 }}>
                        {date.day}
                      </span>
                      <span style={{ color: 'var(--color-smoke)', fontSize: '0.65rem' }}>
                        {date.year}
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
                          {eventTag(event)}
                        </span>
                        {event.time && (
                          <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>
                            {event.time}
                          </span>
                        )}
                      </div>
                      <h3
                        className="mb-2 font-semibold"
                        style={{ color: 'var(--color-cream)', fontSize: '1.2rem' }}
                      >
                        {event.title}
                      </h3>
                      {event.description && (
                        <p style={{ color: 'var(--color-smoke)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="shrink-0 flex items-center">
                      <Link
                        href="/events"
                        className="text-xs tracking-widest uppercase transition-colors whitespace-nowrap"
                        style={{ color: 'var(--color-smoke)', letterSpacing: '0.15em' }}
                      >
                        See Details →
                      </Link>
                    </div>
                  </div>
                );
              })}
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
          </>
        )}
      </div>
    </section>
  );
}
