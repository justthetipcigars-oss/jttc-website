import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Out of the Lounge | Just The Tip Cigars',
  description: 'Bring the Just The Tip Cigars experience to your next off-site event.',
};

export default function OutOfTheLoungePage() {
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
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(ellipse at 20% 50%, var(--color-terracotta-dark) 0%, transparent 55%),
                               radial-gradient(ellipse at 80% 50%, var(--color-amber) 0%, transparent 50%)`,
            }}
          />
          <div className="max-w-5xl mx-auto px-6 py-20 relative">
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Off-Site Events
            </div>
            <h1
              className="display"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 600, color: 'var(--color-cream)', lineHeight: 1.1, marginBottom: '1.25rem' }}
            >
              Out of the Lounge
            </h1>
            <p style={{ color: 'var(--color-smoke)', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '560px' }}>
              The same experience. Your location. We bring the cigars, the knowledge, and the vibe — you bring the occasion.
            </p>
          </div>
        </div>

        {/* Content — coming soon */}
        <section className="max-w-5xl mx-auto px-6 py-20 text-center">
          <p style={{ color: 'var(--color-smoke)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto 2.5rem' }}>
            More details coming soon. In the meantime, reach out directly and we will put something together for you.
          </p>
          <a
            href="/contact"
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
            Get in Touch
          </a>
        </section>

      </main>
      <Footer />
    </>
  );
}
