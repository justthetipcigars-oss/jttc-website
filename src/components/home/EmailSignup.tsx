'use client';

import { useState } from 'react';

export default function EmailSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Wire to Mailchimp / Klaviyo API
    setSubmitted(true);
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'var(--color-pitch)' }}
    >
      {/* Warm glow background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(196,98,45,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-24 text-center">
        <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Stay in the Know
        </div>

        <h2
          className="mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            color: 'var(--color-cream)',
          }}
        >
          New Arrivals. Upcoming Events.<br />
          <span style={{ fontStyle: 'italic', color: 'var(--color-terracotta)' }}>Lounge News.</span>
        </h2>

        <p className="mb-10" style={{ color: 'var(--color-smoke)', fontSize: '0.95rem' }}>
          No fluff. Just the good stuff — straight to your inbox.
        </p>

        {submitted ? (
          <div
            className="px-8 py-5"
            style={{ border: '1px solid var(--color-terracotta)', color: 'var(--color-cream)' }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
              You're in. See you at the lounge.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 px-5 py-4 text-sm focus:outline-none"
              style={{
                background: 'var(--color-charcoal)',
                border: '1px solid var(--color-charcoal-mid)',
                borderRight: 'none',
                color: 'var(--color-cream)',
              }}
            />
            <button
              type="submit"
              className="px-6 py-4 text-sm font-semibold tracking-widest uppercase transition-all whitespace-nowrap"
              style={{
                background: 'var(--color-terracotta)',
                color: 'var(--color-cream)',
                letterSpacing: '0.15em',
                border: '1px solid var(--color-terracotta)',
              }}
            >
              Join Up
            </button>
          </form>
        )}

        <p className="mt-4 text-xs" style={{ color: 'var(--color-charcoal-light)' }}>
          Unsubscribe any time. We don't share your info. Ever.
        </p>
      </div>
    </section>
  );
}
