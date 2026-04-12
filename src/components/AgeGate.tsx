'use client';

import { useState, useEffect } from 'react';

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('age-verified');
    setVerified(stored === 'true');
  }, []);

  function confirm() {
    sessionStorage.setItem('age-verified', 'true');
    setVerified(true);
  }

  // Still checking storage
  if (verified === null) return null;

  // Verified — show site
  if (verified) return <>{children}</>;

  // Age gate screen
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--color-pitch)' }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(ellipse at 30% 50%, var(--color-terracotta-dark) 0%, transparent 60%),
                           radial-gradient(ellipse at 70% 50%, var(--color-amber) 0%, transparent 50%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">

        <img
          src="/images/JTTC-LOGO-CIRCLE-CREAM.png"
          alt="Just The Tip Cigars"
          className="w-56 h-56 mb-8"
        />

        <h1
          className="text-3xl mb-2"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-cream)' }}
        >
          Just The Tip Cigars
        </h1>
        <p className="mb-1" style={{ color: 'var(--color-smoke)', fontSize: '0.875rem' }}>
          Premium Cigar Lounge · South Park Township, PA
        </p>

        <div className="w-12 h-px my-6" style={{ background: 'var(--color-terracotta)' }} />

        {denied ? (
          <p style={{ color: 'var(--color-smoke)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Sorry, you must be 21 or older to visit this site.
          </p>
        ) : (
          <>
            <p className="mb-8" style={{ color: 'var(--color-cream-dark)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              You must be <strong style={{ color: 'var(--color-cream)' }}>21 years of age or older</strong> to enter this site.
            </p>

            <div className="flex gap-4 w-full">
              <button
                onClick={confirm}
                className="flex-1 py-3 font-semibold tracking-widest uppercase text-sm"
                style={{
                  background: 'var(--color-terracotta)',
                  color: 'var(--color-cream)',
                  letterSpacing: '0.15em',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Yes, I&apos;m 21+
              </button>
              <button
                onClick={() => setDenied(true)}
                className="flex-1 py-3 font-semibold tracking-widest uppercase text-sm"
                style={{
                  background: 'transparent',
                  color: 'var(--color-smoke)',
                  letterSpacing: '0.15em',
                  border: '1px solid var(--color-smoke)',
                  cursor: 'pointer',
                }}
              >
                No
              </button>
            </div>
          </>
        )}

        <p className="mt-6 text-xs" style={{ color: 'var(--color-charcoal-light)' }}>
          By entering you confirm you are of legal smoking age in your jurisdiction.
        </p>
      </div>
    </div>
  );
}
