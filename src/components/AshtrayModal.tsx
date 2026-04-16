'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nameToSlug } from '@/lib/slug';

export type AshtrayEntry = {
  id: string;
  product_id: string;
  product_name: string;
  brand: string;
  size: string;
  image_url: string | null;
  quick_rating: number | null;
  status: string;
  smoked_at: string;
};

type Props = {
  item: {
    product_id: string;
    product_name: string;
    brand: string;
    size: string;
    image_url: string | null;
  };
  onDone: (entry: AshtrayEntry) => void;
  onClose: () => void;
};

export default function AshtrayModal({ item, onDone, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<'choose' | 'rate'>('choose');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);

  async function postToAshtray(status: string): Promise<AshtrayEntry> {
    const res = await fetch('/api/account/ashtray', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, status }),
    });
    return res.json();
  }

  async function handleJournal() {
    setLoading(true);
    const entry = await postToAshtray('journaled');
    onDone(entry);
    router.push(`/account/journal/${nameToSlug(item.product_name)}`);
  }

  async function handleLater() {
    setLoading(true);
    const entry = await postToAshtray('pending');
    onDone(entry);
    onClose();
  }

  async function handleConfirmRating() {
    if (rating === 0 || loading) return;
    setLoading(true);
    const entry = await postToAshtray('rated');
    const res = await fetch('/api/account/ashtray', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: entry.id, quick_rating: rating, status: 'rated' }),
    });
    const rated = await res.json();
    onDone(rated);
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--color-charcoal)',
        border: '1px solid var(--color-charcoal-mid)',
        width: '100%', maxWidth: '420px',
        padding: '2rem',
      }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Moved to Ashtray
          </div>
          <div style={{ color: 'var(--color-cream)', fontWeight: 600, fontSize: '1rem', lineHeight: 1.3 }}>
            {item.product_name}
          </div>
          {item.size && (
            <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              {item.brand}{item.brand && item.size ? ' · ' : ''}{item.size}
            </div>
          )}
        </div>

        {step === 'choose' && (
          <>
            <div style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              How would you like to log this smoke?
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

              {/* Full Journal Entry */}
              <button
                onClick={handleJournal}
                disabled={loading}
                style={{
                  padding: '1rem 1.25rem',
                  background: 'var(--color-terracotta)',
                  border: 'none',
                  color: 'var(--color-cream)',
                  textAlign: 'left',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontFamily: 'var(--font-body)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                  Full Tasting Journal Entry
                </div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                  Ratings, flavor notes, photos & detailed tasting notes
                </div>
              </button>

              {/* Quick Rate */}
              <button
                onClick={() => setStep('rate')}
                disabled={loading}
                style={{
                  padding: '1rem 1.25rem',
                  background: 'var(--color-pitch)',
                  border: '1px solid var(--color-charcoal-mid)',
                  color: 'var(--color-cream)',
                  textAlign: 'left',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-terracotta)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-charcoal-mid)'; }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                  Quick Rate
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-smoke)' }}>
                  Give it a quick star rating and move on
                </div>
              </button>

              {/* Take Care of it Later */}
              <button
                onClick={handleLater}
                disabled={loading}
                style={{
                  padding: '1rem 1.25rem',
                  background: 'transparent',
                  border: '1px solid var(--color-charcoal-mid)',
                  color: 'var(--color-smoke)',
                  textAlign: 'left',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-smoke)'; e.currentTarget.style.color = 'var(--color-cream)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-charcoal-mid)'; e.currentTarget.style.color = 'var(--color-smoke)'; }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                  Take Care of it Later
                </div>
                <div style={{ fontSize: '0.72rem' }}>
                  Save to ashtray and come back to review
                </div>
              </button>
            </div>
          </>
        )}

        {step === 'rate' && (
          <>
            <div style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              How many stars?
            </div>

            {/* Stars */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '2.25rem', lineHeight: 1, padding: '0.25rem',
                    color: n <= (hovered || rating) ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)',
                    transition: 'color 0.1s',
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setStep('choose')}
                disabled={loading}
                style={{
                  flex: 1, padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid var(--color-charcoal-mid)',
                  color: 'var(--color-smoke)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Back
              </button>
              <button
                onClick={handleConfirmRating}
                disabled={rating === 0 || loading}
                style={{
                  flex: 2, padding: '0.75rem',
                  background: rating > 0 ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)',
                  border: 'none',
                  color: 'var(--color-cream)',
                  cursor: rating > 0 && !loading ? 'pointer' : 'not-allowed',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-body)',
                  transition: 'background 0.15s',
                }}
              >
                {loading ? 'Saving...' : 'Save Rating'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
