'use client';

import { useState } from 'react';

const subjects = [
  'General Inquiry',
  'Event / Private Party Inquiry',
  'Product Question',
  'Membership & Aficionado Corner',
  'Media & Press',
  'Other',
];

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: subjects[0], message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('success');
      setForm({ name: '', email: '', phone: '', subject: subjects[0], message: '' });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div style={{
        background: 'var(--color-charcoal)',
        border: '1px solid var(--color-charcoal-mid)',
        padding: '3rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤙</div>
        <h3 className="display" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-cream)', marginBottom: '0.75rem' }}>
          Message Received
        </h3>
        <p style={{ color: 'var(--color-smoke)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '2rem' }}>
          We'll get back to you shortly. In the meantime, come see us — the door's always open.
        </p>
        <button
          onClick={() => setStatus('idle')}
          style={{
            background: 'transparent',
            border: '1px solid var(--color-charcoal-mid)',
            color: 'var(--color-cream-dark)',
            padding: '0.6rem 1.5rem',
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Name + Email */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid grid-cols-1 sm:grid-cols-2">
        <div>
          <label style={labelStyle}>Name <span style={{ color: 'var(--color-terracotta)' }}>*</span></label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="Your name"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Email <span style={{ color: 'var(--color-terracotta)' }}>*</span></label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => update('email', e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Phone + Subject */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid grid-cols-1 sm:grid-cols-2">
        <div>
          <label style={labelStyle}>Phone <span style={{ color: 'var(--color-charcoal-light)', fontWeight: 400 }}>(optional)</span></label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => update('phone', e.target.value)}
            placeholder="(724) 000-0000"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Subject</label>
          <select
            value={form.subject}
            onChange={e => update('subject', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label style={labelStyle}>Message <span style={{ color: 'var(--color-terracotta)' }}>*</span></label>
        <textarea
          required
          value={form.message}
          onChange={e => update('message', e.target.value)}
          placeholder="What's on your mind?"
          rows={6}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '140px' }}
        />
      </div>

      {/* Error */}
      {status === 'error' && (
        <p style={{ color: '#e07070', fontSize: '0.875rem', margin: 0 }}>{errorMsg}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'sending'}
        style={{
          background: status === 'sending' ? 'var(--color-charcoal-mid)' : 'var(--color-terracotta)',
          color: 'var(--color-cream)',
          border: 'none',
          padding: '0.9rem 2.5rem',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          cursor: status === 'sending' ? 'not-allowed' : 'pointer',
          alignSelf: 'flex-start',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => { if (status !== 'sending') e.currentTarget.style.background = 'var(--color-terracotta-light)'; }}
        onMouseLeave={e => { if (status !== 'sending') e.currentTarget.style.background = 'var(--color-terracotta)'; }}
      >
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>

    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: 'var(--color-cream-dark)',
  fontSize: '0.75rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: '0.5rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-charcoal)',
  border: '1px solid var(--color-charcoal-mid)',
  color: 'var(--color-cream)',
  padding: '0.7rem 0.9rem',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'inherit',
};
