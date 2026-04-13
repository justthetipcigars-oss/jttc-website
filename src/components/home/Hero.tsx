import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--color-pitch)' }}
    >
      {/* 📸 PHOTO PLACEHOLDER — Replace with full-screen lounge interior shot.
          Ideal shot: wide angle from the entrance looking in — leather chairs,
          warm amber lighting, terracotta walls, smoke haze in the air. Dark & moody. */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg,
            var(--color-pitch) 0%,
            var(--color-charcoal) 40%,
            #3D2010 70%,
            var(--color-charcoal) 100%)`,
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(14,12,10,0.8) 100%)',
        }}
      />

      {/* Warm light bloom — simulates lounge lighting */}
      <div
        className="absolute"
        style={{
          top: '20%', right: '20%', width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(196,98,45,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Cowboy watermark */}
      <div
        className="absolute right-0 bottom-0 pointer-events-none select-none"
        style={{ opacity: 0.07, width: 'clamp(300px, 45vw, 650px)' }}
      >
        <Image
          src="/images/23.svg"
          alt=""
          width={650}
          height={430}
          style={{ width: '100%', height: 'auto' }}
          aria-hidden
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-3 mb-8"
          style={{ color: 'var(--color-terracotta)' }}
        >
          <span className="w-8 h-px" style={{ background: 'var(--color-terracotta)' }} />
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            South Park Township, PA
          </span>
          <span className="w-8 h-px" style={{ background: 'var(--color-terracotta)' }} />
        </div>

        {/* Headline — Cazon-Gris, big display only */}
        <h1
          className="display mb-6"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 600,
            color: 'var(--color-cream)',
            lineHeight: 1.1,
          }}
        >
          Just The Tip<br />
          <span style={{ color: 'var(--color-terracotta)' }}>Cigars</span>
        </h1>

        {/* Tagline — body font, italic */}
        <p
          className="mb-10 max-w-xl mx-auto"
          style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            color: 'var(--color-cream-dark)',
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}
        >
          "Can't wait to smoke with y'all."
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/lounge"
            className="px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-all"
            style={{
              background: 'var(--color-terracotta)',
              color: 'var(--color-cream)',
              letterSpacing: '0.15em',
              minWidth: '180px',
              textAlign: 'center',
            }}
          >
            Visit the Lounge
          </Link>
          <Link
            href="/shop"
            className="px-8 py-4 text-sm font-semibold tracking-widest uppercase transition-all"
            style={{
              border: '1px solid var(--color-cream-dark)',
              color: 'var(--color-cream-dark)',
              letterSpacing: '0.15em',
              minWidth: '180px',
              textAlign: 'center',
            }}
          >
            Browse the Shop
          </Link>
        </div>

        {/* Hours teaser */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
          <span style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
            MON–TUE 12PM–9PM
          </span>
          <span className="hidden sm:block w-1 h-1 rounded-full" style={{ background: 'var(--color-terracotta)' }} />
          <span style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
            WED–SAT 10AM–9PM
          </span>
          <span className="hidden sm:block w-1 h-1 rounded-full" style={{ background: 'var(--color-terracotta)' }} />
          <span style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
            SUN 12PM–9PM
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span style={{ color: 'var(--color-smoke)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <div className="w-px h-10 overflow-hidden" style={{ background: 'var(--color-charcoal-mid)' }}>
          <div
            className="w-full h-1/2"
            style={{
              background: 'var(--color-terracotta)',
              animation: 'scrollDrop 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scrollDrop {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </section>
  );
}
