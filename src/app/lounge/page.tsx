import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'The Lounge | Just The Tip Cigars',
  description: "Welcome to the family. Just The Tip Cigars is South Park's no-pretense cigar lounge built for serious smokers and curious newcomers alike. Walk-ins always welcome — can't wait to smoke with y'all.",
  openGraph: {
    title: 'The Lounge | Just The Tip Cigars',
    description: "South Park's no-pretense cigar lounge. Serious smokers, curious newcomers — all welcome. Can't wait to smoke with y'all.",
    url: 'https://www.justthetipcigars.com/lounge',
    images: [{ url: '/images/cowboy-wb.png', width: 1200, height: 630, alt: 'Just The Tip Cigars Lounge' }],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'The Lounge | Just The Tip Cigars',
    description: "South Park's no-pretense cigar lounge. Walk-ins always welcome.",
    images: ['/images/cowboy-wb.png'],
  },
};

export default function LoungePage() {
  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', paddingTop: '80px' }}>

        {/* Hero */}
        <div
          style={{
            background: 'var(--color-charcoal)',
            borderBottom: '1px solid var(--color-charcoal-mid)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(ellipse at 20% 50%, var(--color-terracotta-dark) 0%, transparent 55%),
                               radial-gradient(ellipse at 80% 50%, var(--color-amber) 0%, transparent 50%)`,
            }}
          />
          <div className="max-w-5xl mx-auto px-6 py-20 relative">
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              South Park Township, PA
            </div>
            <h1
              className="display"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 600, color: 'var(--color-cream)', lineHeight: 1.1, marginBottom: '1.25rem' }}
            >
              The Lounge
            </h1>
            <p style={{ color: 'var(--color-smoke)', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '560px', marginBottom: '1.25rem' }}>
              Not just a smoke shop. A place to belong.
            </p>
            <p style={{ color: 'var(--color-smoke)', fontSize: '1rem', lineHeight: 1.9, maxWidth: '560px' }}>
              The moment you walk through the door, the outside world can wait. Whether you are
              a seasoned aficionado or lighting up for the very first time, you will feel it: a
              cigar is the great equalizer. Work boots, fresh sneakers, or a suit — pull up a
              chair, you are one of us.
            </p>
          </div>
        </div>

        {/* House Rules */}
        <section style={{ background: 'var(--color-charcoal)', borderTop: '1px solid var(--color-charcoal-mid)', borderBottom: '1px solid var(--color-charcoal-mid)' }}>
          <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col items-center">

            {/* SVG filter — letterpress roughness */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
              <defs>
                <filter id="letterpress" x="-5%" y="-5%" width="110%" height="110%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" seed="8" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>
            </svg>

            {/* Wanted-poster parchment */}
            <div style={{
              position: 'relative',
              maxWidth: '700px',
              width: '100%',
              backgroundImage: 'url(/images/parchment.png)',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              padding: '10% 11% 10%',
              filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.8))',
            }}>

              {/* Inner border frame */}
              <div style={{
                border: '3px solid #2c1204',
                padding: '1.5rem 1.5rem 1.25rem',
                position: 'relative',
                mixBlendMode: 'multiply',
              }}>
                {/* Double-line inner frame */}
                <div style={{
                  position: 'absolute',
                  inset: '6px',
                  border: '1px solid #2c1204',
                  pointerEvents: 'none',
                }} />

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                    color: '#1a0a02',
                    lineHeight: 1,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    textShadow: '1px 2px 0 rgba(0,0,0,0.15)',
                    filter: 'url(#letterpress)',
                  }}>
                    House Rules
                  </div>
                  <div style={{ width: '75%', height: '2px', background: '#2c1204', margin: '0.7rem auto 0.35rem' }} />
                  <div style={{ width: '55%', height: '1px', background: '#2c1204', margin: '0 auto' }} />
                </div>

                {/* Rules */}
                <ol style={{ listStyle: 'none', padding: 0, margin: '1.25rem 0 1rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {rules.map((r, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: '#1a0a02',
                        lineHeight: 1.6,
                        minWidth: '1.1rem',
                        filter: 'url(#letterpress)',
                      }}>
                        {i + 1}.
                      </span>
                      <span style={{
                        color: '#2c1206',
                        fontSize: '0.95rem',
                        lineHeight: 1.75,
                        fontStyle: 'italic',
                        fontFamily: 'Georgia, serif',
                        fontWeight: 700,
                        filter: 'url(#letterpress)',
                      }}>
                        {r}
                      </span>
                    </li>
                  ))}
                </ol>

                {/* Footer lines + stamp */}
                <div style={{ width: '55%', height: '1px', background: '#2c1204', margin: '1rem auto 0.35rem' }} />
                <div style={{ width: '75%', height: '2px', background: '#2c1204', margin: '0 auto 0.85rem' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: '0.55rem',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: '#5a3810',
                    filter: 'url(#letterpress)',
                  }}>
                    Just The Tip Cigars · South Park Township, PA
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Divider */}
        <div className="max-w-5xl mx-auto px-6">
          <div style={{ borderTop: '1px solid var(--color-charcoal-mid)' }} />
        </div>

        {/* Amenities */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={labelStyle}>What's Inside</div>
            <h2 className="display" style={{ ...h2Style, textAlign: 'center' }}>The Space</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}
               className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {amenities.map(a => (
              <div key={a.title} style={amenityCardStyle}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{a.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-cream)', fontSize: '1rem', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                  {a.title}
                </div>
                <p style={{ color: 'var(--color-smoke)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-5xl mx-auto px-6">
          <div style={{ borderTop: '1px solid var(--color-charcoal-mid)' }} />
        </div>

        {/* Hours + Location */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem' }}
               className="flex flex-col md:grid">

            {/* Hours */}
            <div>
              <div style={labelStyle}>When We&apos;re Open</div>
              <h2 className="display" style={h2Style}>Hours</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {hours.map(h => (
                  <div key={h.day} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-charcoal-mid)', paddingBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--color-cream-dark)', fontSize: '0.9rem', letterSpacing: '0.03em' }}>{h.day}</span>
                    <span style={{ color: h.time === 'Closed' ? 'var(--color-smoke)' : 'var(--color-terracotta)', fontSize: '0.9rem', fontWeight: 600 }}>{h.time}</span>
                  </div>
                ))}
              </div>
              <p style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', marginTop: '1rem', lineHeight: 1.7 }}>
                Hours subject to change. Check our Events page or give us a call.
              </p>
            </div>

            {/* Location */}
            <div>
              <div style={labelStyle}>Find Us</div>
              <h2 className="display" style={h2Style}>Location</h2>

              <iframe
                src="https://maps.google.com/maps?q=2550+Brownsville+Rd,+South+Park,+PA+15129&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="220"
                style={{ border: 0, display: 'block', marginBottom: '1.5rem', filter: 'grayscale(30%) contrast(1.05)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Just The Tip Cigars location"
              />

              <p style={{ color: 'var(--color-cream)', fontWeight: 600, marginBottom: '0.25rem' }}>Just The Tip Cigars</p>
              <p style={bodyStyle}>2550 Brownsville Rd, South Park, PA 15129</p>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=2550+Brownsville+Rd,+South+Park,+PA+15129"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-terracotta)', fontSize: '0.875rem', letterSpacing: '0.05em', textDecoration: 'none', display: 'inline-block', marginTop: '0.75rem' }}
              >
                Get Directions →
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h2 className="display" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 600, lineHeight: 1.2, marginBottom: '1rem' }}>
            <span style={{ color: 'var(--color-terracotta)' }}>Come as you are,</span><br />
            <span style={{ color: 'var(--color-cream)' }}>stay as you want to be.</span>
          </h2>
          <p style={{ color: 'var(--color-smoke)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto 2.5rem' }}>
            No jacket required. No pretense. Just good people, good smoke, and an open chair
            with your name on it.
          </p>
          <a
            href="/events"
            style={{
              display: 'inline-block',
              padding: '0.85rem 2.5rem',
              background: 'var(--color-terracotta)',
              color: 'var(--color-cream)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            See Upcoming Events
          </a>
        </section>

      </main>
      <Footer />
    </>
  );
}

/* ─── Data ─── */

const amenities = [
  { icon: '🚪', title: 'Guided Humidor Experience', desc: 'We walk you through the humidor personally — no guessing, no pressure. Whether you\'re a first-timer or a regular, we help you find exactly the right stick.' },
  { icon: '🪑', title: 'Premium Seating', desc: 'Kick back in the main lounge or claim a seat in the conference room. Find your spot and settle in.' },
  { icon: '📺', title: 'Two Big Screens', desc: 'One TV in the main lounge, one in the conference/poker room. Catch the game while you enjoy your smoke.' },
  { icon: '🎱', title: 'Conference & Poker Room', desc: 'A dedicated room for a more private hang — perfect for poker nights, watch parties, or just a quieter corner.' },
  { icon: '🥃', title: 'BYOB', desc: 'We are a bring-your-own-bottle establishment. Grab your favorite whiskey, beer, or whatever you\'re in the mood for and make yourself at home.' },
  { icon: '🎵', title: 'Curated Atmosphere', desc: 'The music is right, the lighting is low, and the vibe is exactly what you needed after a long week.' },
];

const hours = [
  { day: 'Monday',    time: '12:00 PM – 9:00 PM' },
  { day: 'Tuesday',   time: '12:00 PM – 9:00 PM' },
  { day: 'Wednesday', time: '10:00 AM – 9:00 PM' },
  { day: 'Thursday',  time: '10:00 AM – 9:00 PM' },
  { day: 'Friday',    time: '10:00 AM – 9:00 PM' },
  { day: 'Saturday',  time: '10:00 AM – 9:00 PM' },
  { day: 'Sunday',    time: '12:00 PM – 9:00 PM' },
];

const rules = [
  'If you didn\'t buy it here, you can\'t smoke it here.',
  'You have to buy something to hang out here.',
  'No politics. Don\'t talk about it. Don\'t put it on my TV. This is sanctuary.',
];

/* ─── Styles ─── */

const labelStyle: React.CSSProperties = {
  color: 'var(--color-terracotta)',
  fontSize: '0.7rem',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  marginBottom: '0.75rem',
};

const h2Style: React.CSSProperties = {
  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
  fontWeight: 600,
  color: 'var(--color-cream)',
  lineHeight: 1.1,
  marginBottom: '1.5rem',
};

const bodyStyle: React.CSSProperties = {
  color: 'var(--color-smoke)',
  fontSize: '1rem',
  lineHeight: 1.9,
};

const photoCellStyle: React.CSSProperties = {
  borderRadius: '2px',
  overflow: 'hidden',
};

const photoPlaceholderStyle: React.CSSProperties = {
  background: 'var(--color-charcoal)',
  border: '1px dashed var(--color-charcoal-light)',
  height: '320px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const photoLabelStyle: React.CSSProperties = {
  color: 'var(--color-charcoal-light)',
  fontSize: '0.8rem',
  letterSpacing: '0.05em',
};

const amenityCardStyle: React.CSSProperties = {
  background: 'var(--color-charcoal)',
  border: '1px solid var(--color-charcoal-mid)',
  padding: '1.75rem',
};

