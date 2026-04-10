'use client';

import { useState, useEffect } from 'react';

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('age-verified');
    setVerified(stored === 'true');
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const m = parseInt(month), d = parseInt(day), y = parseInt(year);
    if (!m || !d || !y || y < 1900 || y > new Date().getFullYear()) {
      setError('Please enter a valid date of birth.');
      return;
    }

    const dob = new Date(y, m - 1, d);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    if (
      now.getMonth() < dob.getMonth() ||
      (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())
    ) age--;

    if (age >= 21) {
      sessionStorage.setItem('age-verified', 'true');
      setVerified(true);
    } else {
      setError('You must be 21 or older to enter this site.');
    }
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
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(ellipse at 30% 50%, var(--color-terracotta-dark) 0%, transparent 60%),
                           radial-gradient(ellipse at 70% 50%, var(--color-amber) 0%, transparent 50%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">

        {/* Logo placeholder */}
        <div
          className="w-24 h-24 rounded-full mb-8 flex items-center justify-center border-2"
          style={{ borderColor: 'var(--color-terracotta)', background: 'var(--color-charcoal)' }}
        >
          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            JTT<br />CIGARS
          </span>
        </div>

        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cream)' }}
        >
          Just The Tip Cigars
        </h1>
        <p className="mb-1" style={{ color: 'var(--color-smoke)', fontSize: '0.875rem' }}>
          Premium Cigar Lounge · South Park Township, PA
        </p>

        <div className="w-12 h-px my-6" style={{ background: 'var(--color-terracotta)' }} />

        <p className="mb-6" style={{ color: 'var(--color-cream-dark)', fontSize: '0.95rem' }}>
          You must be <strong style={{ color: 'var(--color-cream)' }}>21 years of age or older</strong> to enter this site.
          Please verify your date of birth.
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-3 mb-4">
            <div className="flex flex-col flex-1">
              <label className="text-xs mb-1" style={{ color: 'var(--color-smoke)', letterSpacing: '0.1em' }}>
                MONTH
              </label>
              <input
                type="number" min="1" max="12" placeholder="MM"
                value={month} onChange={e => setMonth(e.target.value)}
                className="text-center py-3 rounded text-lg focus:outline-none"
                style={{
                  background: 'var(--color-charcoal)',
                  border: '1px solid var(--color-charcoal-light)',
                  color: 'var(--color-cream)',
                }}
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-xs mb-1" style={{ color: 'var(--color-smoke)', letterSpacing: '0.1em' }}>
                DAY
              </label>
              <input
                type="number" min="1" max="31" placeholder="DD"
                value={day} onChange={e => setDay(e.target.value)}
                className="text-center py-3 rounded text-lg focus:outline-none"
                style={{
                  background: 'var(--color-charcoal)',
                  border: '1px solid var(--color-charcoal-light)',
                  color: 'var(--color-cream)',
                }}
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="text-xs mb-1" style={{ color: 'var(--color-smoke)', letterSpacing: '0.1em' }}>
                YEAR
              </label>
              <input
                type="number" min="1900" max="2099" placeholder="YYYY"
                value={year} onChange={e => setYear(e.target.value)}
                className="text-center py-3 rounded text-lg focus:outline-none"
                style={{
                  background: 'var(--color-charcoal)',
                  border: '1px solid var(--color-charcoal-light)',
                  color: 'var(--color-cream)',
                }}
              />
            </div>
          </div>

          {error && (
            <p className="mb-4 text-sm" style={{ color: '#E05A5A' }}>{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 font-semibold tracking-widest uppercase text-sm transition-all"
            style={{
              background: 'var(--color-terracotta)',
              color: 'var(--color-cream)',
              letterSpacing: '0.15em',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-terracotta-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-terracotta)')}
          >
            Enter
          </button>
        </form>

        <p className="mt-6 text-xs" style={{ color: 'var(--color-charcoal-light)' }}>
          By entering you confirm you are of legal smoking age in your jurisdiction.
        </p>
      </div>
    </div>
  );
}
