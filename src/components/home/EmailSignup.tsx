'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function EmailSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'homepage' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('success');
      setEmail('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'var(--color-charcoal)', borderTop: '1px solid var(--color-charcoal-mid)', borderBottom: '1px solid var(--color-charcoal-mid)' }}
    >
      {/* Warm glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(196,98,45,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-20 text-center">
        <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          The Lounge List
        </div>

        <h2
          className="display mb-4"
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 600,
            color: 'var(--color-cream)',
            lineHeight: 1.2,
          }}
        >
          First Access. Event Invites.<br />
          <span style={{ color: 'var(--color-terracotta)' }}>Deals You Won&apos;t See on the Shelf.</span>
        </h2>

        <p className="mb-10" style={{ color: 'var(--color-smoke)', fontSize: '0.95rem', lineHeight: 1.8 }}>
          New arrivals, private tastings, and member-only offers — straight to your inbox.
          No fluff. Unsubscribe any time.
        </p>

        {status === 'success' ? (
          <div
            className="px-8 py-5 max-w-md mx-auto"
            style={{ border: '1px solid var(--color-terracotta)' }}
          >
            <span className="display" style={{ fontSize: '1.1rem', color: 'var(--color-cream)' }}>
              You&apos;re in. See you at the lounge.
            </span>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={status === 'sending'}
                className="flex-1 px-5 py-4 text-sm focus:outline-none"
                style={{
                  background: 'var(--color-pitch)',
                  border: '1px solid var(--color-charcoal-mid)',
                  borderRight: 'none',
                  color: 'var(--color-cream)',
                }}
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="px-6 py-4 text-sm font-semibold uppercase whitespace-nowrap transition-all"
                style={{
                  background: status === 'sending' ? 'var(--color-charcoal-light)' : 'var(--color-terracotta)',
                  color: 'var(--color-cream)',
                  letterSpacing: '0.15em',
                  border: '1px solid var(--color-terracotta)',
                  cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                }}
              >
                {status === 'sending' ? 'Joining...' : 'Join Up'}
              </button>
            </form>

            {status === 'error' && (
              <p style={{ color: '#e07070', fontSize: '0.8rem', marginTop: '0.75rem' }}>{errorMsg}</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
