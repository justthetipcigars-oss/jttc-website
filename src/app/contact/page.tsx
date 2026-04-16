import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from './ContactForm';

export const metadata = {
  title: 'Contact | Just The Tip Cigars',
  description: 'Get in touch with Just The Tip Cigars. Find us at 2550 Brownsville Rd, South Park Township, PA — or reach out directly. We\'d love to hear from you.',
};

const hours = [
  { day: 'Monday',    time: '12:00 PM – 9:00 PM' },
  { day: 'Tuesday',   time: '12:00 PM – 9:00 PM' },
  { day: 'Wednesday', time: '10:00 AM – 9:00 PM' },
  { day: 'Thursday',  time: '10:00 AM – 9:00 PM' },
  { day: 'Friday',    time: '10:00 AM – 9:00 PM' },
  { day: 'Saturday',  time: '10:00 AM – 9:00 PM' },
  { day: 'Sunday',    time: '12:00 PM – 9:00 PM' },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', paddingTop: '80px' }}>

        {/* Page header */}
        <div style={{
          background: 'var(--color-charcoal)',
          borderBottom: '1px solid var(--color-charcoal-mid)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(ellipse at 70% 50%, var(--color-terracotta-dark) 0%, transparent 60%)`,
            }}
          />
          <div className="max-w-5xl mx-auto px-6 py-16 relative">
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              We'd Love to Hear From You
            </div>
            <h1
              className="display"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 600, color: 'var(--color-cream)', lineHeight: 1.1, marginBottom: '1rem' }}
            >
              Get In Touch
            </h1>
            <p style={{ color: 'var(--color-smoke)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '500px' }}>
              Questions, private events, product inquiries — or just want to know what's
              on tap for the weekend. We'll get back to you fast.
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '5rem', alignItems: 'start' }}
               className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]">

            {/* Left — Form */}
            <div>
              <div style={labelStyle}>Send Us a Message</div>
              <h2 className="display" style={h2Style}>Say Hello</h2>
              <p style={{ color: 'var(--color-smoke)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                Fill out the form and we'll respond within one business day. For same-day questions,
                just give us a call — we pick up.
              </p>
              <ContactForm />
            </div>

            {/* Right — Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* Phone */}
              <div style={infoCardStyle}>
                <div style={infoIconRowStyle}>
                  <span style={{ fontSize: '1.1rem' }}>📞</span>
                  <span style={infoLabelStyle}>Phone</span>
                </div>
                <a
                  href="tel:+17249579229"
                  style={{ color: 'var(--color-cream)', fontSize: '1.1rem', fontWeight: 600, textDecoration: 'none', display: 'block', marginBottom: '0.25rem' }}
                >
                  (724) 957-9229
                </a>
                <p style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
                  Call or text anytime during business hours.
                </p>
              </div>

              {/* Address */}
              <div style={infoCardStyle}>
                <div style={infoIconRowStyle}>
                  <span style={{ fontSize: '1.1rem' }}>📍</span>
                  <span style={infoLabelStyle}>Location</span>
                </div>
                <p style={{ color: 'var(--color-cream)', fontWeight: 600, margin: '0 0 0.25rem', fontSize: '0.95rem' }}>
                  Just The Tip Cigars
                </p>
                <p style={{ color: 'var(--color-smoke)', fontSize: '0.875rem', lineHeight: 1.7, margin: '0 0 0.75rem' }}>
                  2550 Brownsville Road<br />
                  South Park Township, PA 15129
                </p>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=2550+Brownsville+Rd,+South+Park,+PA+15129"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-terracotta)', fontSize: '0.8rem', letterSpacing: '0.05em', textDecoration: 'none' }}
                >
                  Get Directions →
                </a>
              </div>

              {/* Hours */}
              <div style={infoCardStyle}>
                <div style={infoIconRowStyle}>
                  <span style={{ fontSize: '1.1rem' }}>🕐</span>
                  <span style={infoLabelStyle}>Hours</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {hours.map(h => (
                    <div
                      key={h.day}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid var(--color-charcoal-mid)',
                        paddingBottom: '0.5rem',
                        gap: '1rem',
                      }}
                    >
                      <span style={{ color: 'var(--color-cream-dark)', fontSize: '0.8rem' }}>{h.day}</span>
                      <span style={{ color: 'var(--color-terracotta)', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div style={infoCardStyle}>
                <div style={infoIconRowStyle}>
                  <span style={{ fontSize: '1.1rem' }}>📲</span>
                  <span style={infoLabelStyle}>Follow Along</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <a
                    href="https://www.facebook.com/justthetipcigars"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={socialLinkStyle}
                  >
                    Facebook — @justthetipcigars
                  </a>
                  <a
                    href="https://www.instagram.com/justthetipcigars"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={socialLinkStyle}
                  >
                    Instagram — @justthetipcigars
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Map */}
        <div style={{ borderTop: '1px solid var(--color-charcoal-mid)' }}>
          <iframe
            src="https://maps.google.com/maps?q=2550+Brownsville+Rd,+South+Park,+PA+15129&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="340"
            style={{ border: 0, display: 'block', filter: 'grayscale(40%) contrast(1.05) brightness(0.85)' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Just The Tip Cigars location map"
          />
        </div>

        {/* Bottom CTA strip */}
        <div style={{ background: 'var(--color-charcoal)', borderTop: '1px solid var(--color-charcoal-mid)' }}>
          <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="display" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-cream)', marginBottom: '0.3rem' }}>
                Rather talk in person?
              </div>
              <p style={{ color: 'var(--color-smoke)', fontSize: '0.875rem', margin: 0 }}>
                Pull up a chair. We&apos;re open every day of the week.
              </p>
            </div>
            <a
              href="/lounge"
              style={{
                display: 'inline-block',
                padding: '0.85rem 2.25rem',
                background: 'var(--color-terracotta)',
                color: 'var(--color-cream)',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Visit The Lounge
            </a>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}

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
  marginBottom: '1rem',
};

const infoCardStyle: React.CSSProperties = {
  background: 'var(--color-charcoal)',
  border: '1px solid var(--color-charcoal-mid)',
  padding: '1.5rem',
};

const infoIconRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '0.75rem',
};

const infoLabelStyle: React.CSSProperties = {
  color: 'var(--color-terracotta)',
  fontSize: '0.65rem',
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
};

const socialLinkStyle: React.CSSProperties = {
  color: 'var(--color-smoke)',
  fontSize: '0.85rem',
  textDecoration: 'none',
  transition: 'color 0.2s',
};
