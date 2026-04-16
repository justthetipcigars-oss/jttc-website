'use client';

import { useState } from 'react';
import Image from 'next/image';
import { JTTEvent } from '@/lib/events';

type Filter = 'all' | 'on-site' | 'off-site';
type RSVP = 'going' | 'interested' | 'not-interested';
type View = 'list' | 'calendar';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function formatTime(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function googleCalendarUrl(ev: JTTEvent) {
  const start = ev.date.replace(/-/g, '') + 'T' + (ev.time || '190000').replace(':', '') + '00';
  const end = ev.endTime
    ? ev.date.replace(/-/g, '') + 'T' + ev.endTime.replace(':', '') + '00'
    : '';
  const details = encodeURIComponent(ev.description || '');
  const location = encodeURIComponent(ev.location || 'Just The Tip Cigars, South Park Township, PA');
  const title = encodeURIComponent(ev.title);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end || start}&details=${details}&location=${location}`;
}

function icsContent(ev: JTTEvent) {
  const start = ev.date.replace(/-/g, '') + 'T' + (ev.time || '1900').replace(':', '') + '00';
  const end = ev.endTime
    ? ev.date.replace(/-/g, '') + 'T' + ev.endTime.replace(':', '') + '00'
    : start;
  const location = ev.location || 'Just The Tip Cigars, South Park Township, PA';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${ev.title}`,
    `DESCRIPTION:${(ev.description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function downloadIcs(ev: JTTEvent) {
  const blob = new Blob([icsContent(ev)], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${ev.title.replace(/\s+/g, '-')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function CalendarModal({ ev, onClose }: { ev: JTTEvent; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '2rem', maxWidth: 360, width: '90%' }}>
        <h3 style={{ color: 'var(--color-cream)', fontWeight: 600, marginBottom: '0.5rem' }}>{ev.title}</h3>
        <p style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Add to your calendar:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a href={googleCalendarUrl(ev)} target="_blank" rel="noopener noreferrer" style={calBtnStyle}>
            Google Calendar
          </a>
          <button onClick={() => { downloadIcs(ev); onClose(); }} style={calBtnStyle}>
            Apple Calendar / iCal (.ics)
          </button>
        </div>
        <button onClick={onClose} style={{ marginTop: '1.25rem', background: 'none', border: 'none', color: 'var(--color-smoke)', fontSize: '0.75rem', cursor: 'pointer', letterSpacing: '0.08em' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function EventCard({ ev }: { ev: JTTEvent }) {
  const [rsvp, setRsvp] = useState<RSVP | null>(null);
  const [showCal, setShowCal] = useState(false);

  const [y, m, d] = ev.date.split('-');
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const monthLabel = months[parseInt(m) - 1];
  const dayLabel = parseInt(d).toString();

  function handleRsvp(type: RSVP) {
    setRsvp(prev => prev === type ? null : type);
    if (type === 'going' || type === 'interested') setShowCal(true);
  }

  return (
    <div style={{ background: 'var(--color-charcoal)', padding: '1.5rem 2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      {/* Date block */}
      <div style={{
        flexShrink: 0, width: 72, height: 72,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-charcoal-mid)', border: '1px solid var(--color-charcoal-light)',
      }}>
        <span style={{ color: 'var(--color-terracotta)', fontSize: '0.55rem', letterSpacing: '0.2em' }}>{monthLabel}</span>
        <span style={{ color: 'var(--color-cream)', fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>{dayLabel}</span>
        <span style={{ color: 'var(--color-smoke)', fontSize: '0.55rem' }}>{y}</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <span style={tagStyle}>{ev.category}</span>
          {ev.subcategory && <span style={tagStyle}>{ev.subcategory}</span>}
          {ev.recurringPattern && <span style={{ ...tagStyle, color: 'var(--color-amber)', background: 'rgba(212,175,55,0.1)' }}>{ev.recurringPattern}</span>}
        </div>

        <h3 style={{ color: 'var(--color-cream)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>
          {ev.title}
        </h3>

        <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', marginBottom: '0.6rem' }}>
          {formatTime(ev.time)}{ev.endTime ? ` – ${formatTime(ev.endTime)}` : ''}
          {ev.location ? ` · ${ev.location}` : ' · Just The Tip Cigars'}
        </div>

        {ev.description && (
          <p style={{ color: 'var(--color-smoke)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1rem' }}>
            {ev.description}
          </p>
        )}

        {ev.imageUrl && (
          <div style={{ marginTop: '0.75rem', marginBottom: '0.25rem' }}>
            {ev.facebookEventUrl ? (
              <a href={ev.facebookEventUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
                <Image
                  src={ev.imageUrl} alt={ev.title} width={320} height={480}
                  style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: 320, border: '1px solid var(--color-charcoal-mid)' }}
                />
                <div style={{ fontSize: '0.65rem', color: 'var(--color-terracotta)', letterSpacing: '0.1em', marginTop: '0.3rem' }}>
                  View on Facebook →
                </div>
              </a>
            ) : (
              <Image
                src={ev.imageUrl} alt={ev.title} width={320} height={480}
                style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: 320, border: '1px solid var(--color-charcoal-mid)' }}
              />
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['going', 'interested', 'not-interested'] as RSVP[]).map(type => (
            <button
              key={type}
              onClick={() => handleRsvp(type)}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.65rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                border: '1px solid', cursor: 'pointer',
                background: rsvp === type
                  ? type === 'not-interested' ? 'rgba(248,113,113,0.15)' : 'rgba(196,98,45,0.2)'
                  : 'transparent',
                color: rsvp === type
                  ? type === 'not-interested' ? '#f87171' : 'var(--color-terracotta)'
                  : 'var(--color-smoke)',
                borderColor: rsvp === type
                  ? type === 'not-interested' ? 'rgba(248,113,113,0.4)' : 'var(--color-terracotta)'
                  : 'var(--color-charcoal-mid)',
              }}
            >
              {type === 'going' ? 'Going' : type === 'interested' ? 'Interested' : 'Not Interested'}
            </button>
          ))}
        </div>
      </div>

      {showCal && <CalendarModal ev={ev} onClose={() => setShowCal(false)} />}
    </div>
  );
}

function CalendarView({ events, filter }: { events: JTTEvent[]; filter: Filter }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.category === filter);

  // Build a map: date-string -> events[]
  const eventsByDate: Record<string, JTTEvent[]> = {};
  for (const ev of filteredEvents) {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  }

  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = today.toISOString().slice(0, 10);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  }

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button
          onClick={prevMonth}
          style={{ background: 'none', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-smoke)', width: 36, height: 36, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >‹</button>
        <span style={{ color: 'var(--color-cream)', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.05em' }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          style={{ background: 'none', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-smoke)', width: 36, height: 36, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >›</button>
      </div>

      {/* Day-of-week header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1px' }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{ textAlign: 'center', padding: '0.4rem 0', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'var(--color-smoke)', textTransform: 'uppercase' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--color-charcoal-mid)' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} style={{ background: 'var(--color-pitch)', minHeight: 90 }} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = eventsByDate[dateStr] ?? [];
          const hasEvents = dayEvents.length > 0;
          const isPast    = dateStr < todayStr;
          const isToday   = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const posterUrl = dayEvents.find(e => e.imageUrl)?.imageUrl ?? null;

          return (
            <div
              key={i}
              onClick={() => hasEvents && setSelectedDate(isSelected ? null : dateStr)}
              style={{
                background: isSelected ? 'rgba(196,98,45,0.25)' : 'var(--color-charcoal)',
                minHeight: posterUrl ? 120 : 90,
                padding: '0.4rem',
                cursor: hasEvents ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden',
                opacity: isPast && !hasEvents ? 0.35 : 1,
                transition: 'background 0.1s',
              }}
            >
              {/* Poster thumbnail as background */}
              {posterUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={posterUrl}
                  alt=""
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    opacity: isPast ? 0.25 : 0.55,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Day number — overlaid */}
              <span style={{
                position: 'relative', zIndex: 1,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 24, height: 24, borderRadius: '50%',
                fontSize: '0.78rem', fontWeight: isToday ? 700 : 400,
                background: isToday ? 'var(--color-terracotta)' : posterUrl ? 'rgba(0,0,0,0.55)' : 'transparent',
                color: 'var(--color-cream)',
              }}>
                {day}
              </span>

              {/* Event title (no poster) or dot indicators */}
              {hasEvents && !posterUrl && (
                <div style={{ display: 'flex', gap: '2px', marginTop: '4px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                  {dayEvents.slice(0, 3).map((_, di) => (
                    <div key={di} style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: isPast ? 'var(--color-charcoal-light)' : 'var(--color-terracotta)',
                    }} />
                  ))}
                  {dayEvents.length > 3 && (
                    <span style={{ fontSize: '0.55rem', color: 'var(--color-smoke)', lineHeight: '5px' }}>+{dayEvents.length - 3}</span>
                  )}
                </div>
              )}

              {/* Title strip at bottom for poster cells */}
              {posterUrl && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                  padding: '0.75rem 0.3rem 0.25rem',
                  fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.04em',
                  color: 'var(--color-cream)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {dayEvents[0].title}
                  {dayEvents.length > 1 && <span style={{ color: 'var(--color-terracotta)' }}> +{dayEvents.length - 1}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected day events */}
      {selectedDate && selectedEvents.length > 0 && (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--color-charcoal-mid)' }}>
          <div style={{ background: 'var(--color-pitch)', padding: '0.6rem 1.25rem', fontSize: '0.62rem', letterSpacing: '0.2em', color: 'var(--color-terracotta)', textTransform: 'uppercase' }}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          {selectedEvents.map(ev => (
            <div key={ev.id} style={{ opacity: ev.date < todayStr ? 0.5 : 1 }}>
              <EventCard ev={ev} />
            </div>
          ))}
        </div>
      )}

      {/* No events this month notice */}
      {Object.keys(eventsByDate).filter(d => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-smoke)', fontSize: '0.85rem' }}>
          No events this month.
        </div>
      )}
    </div>
  );
}

export default function EventsClient({ events }: { events: JTTEvent[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView]     = useState<View>('list');

  const now = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter(e => e.date >= now);
  const past     = events.filter(e => e.date < now);

  const filtered = (list: JTTEvent[]) =>
    filter === 'all' ? list : list.filter(e => e.category === filter);

  const upcomingFiltered = filtered(upcoming);
  const pastFiltered     = filtered(past);

  return (
    <>
      {/* Controls row: filter tabs + view toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-charcoal-mid)' }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex' }}>
          {(['all', 'on-site', 'off-site'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                fontWeight: 600, border: 'none', cursor: 'pointer',
                background: filter === f ? 'var(--color-terracotta)' : 'transparent',
                color: filter === f ? 'var(--color-cream)' : 'var(--color-smoke)',
              }}
            >
              {f === 'all' ? 'All Events' : f === 'on-site' ? 'On-Site' : 'Off-Site'}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: '2px', background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '3px', marginBottom: '1px' }}>
          {(['list', 'calendar'] as View[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: view === v ? 'var(--color-terracotta)' : 'transparent',
                color: view === v ? 'var(--color-cream)' : 'var(--color-smoke)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {v === 'list' ? '≡ List' : '⊞ Calendar'}
            </button>
          ))}
        </div>
      </div>

      {view === 'calendar' ? (
        <CalendarView events={events} filter={filter} />
      ) : (
        <>
          {upcomingFiltered.length === 0 && pastFiltered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-smoke)' }}>
              No events scheduled. Check back soon.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--color-charcoal-mid)' }}>
              {upcomingFiltered.map(ev => <EventCard key={ev.id} ev={ev} />)}
              {pastFiltered.length > 0 && upcomingFiltered.length > 0 && (
                <div style={{ background: 'var(--color-pitch)', padding: '1rem 2rem', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--color-charcoal-light)', textTransform: 'uppercase' }}>
                  Past Events
                </div>
              )}
              {pastFiltered.map(ev => (
                <div key={ev.id} style={{ opacity: 0.5 }}>
                  <EventCard ev={ev} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

const tagStyle: React.CSSProperties = {
  padding: '0.15rem 0.5rem',
  background: 'rgba(196,98,45,0.12)',
  color: 'var(--color-terracotta)',
  fontSize: '0.6rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

const calBtnStyle: React.CSSProperties = {
  display: 'block',
  textAlign: 'center',
  padding: '0.75rem',
  background: 'var(--color-charcoal-mid)',
  color: 'var(--color-cream)',
  border: '1px solid var(--color-charcoal-light)',
  fontSize: '0.8rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  cursor: 'pointer',
  textDecoration: 'none',
};
