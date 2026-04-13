'use client';

import { useState } from 'react';
import reviews from '@/data/reviews.json';

type Review = { id: string | number; name: string; text: string };

const Stars = () => (
  <div className="flex gap-0.5 mb-3" aria-label="5 stars">
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#C4622D">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ))}
  </div>
);

const LargeStars = () => (
  <div className="flex gap-1 mb-4" aria-label="5 stars">
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#C4622D">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ))}
  </div>
);

const written = reviews.filter(r => r.text && r.text.trim().length > 0);
const track = [...written, ...written];

export default function ReviewsScroller() {
  const [active, setActive] = useState<Review | null>(null);

  if (written.length === 0) return null;

  return (
    <>
      <section
        style={{
          background: 'var(--color-pitch)',
          borderTop: '1px solid var(--color-charcoal-mid)',
          borderBottom: '1px solid var(--color-charcoal-mid)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Fade edges */}
        <div
          className="absolute inset-y-0 left-0 z-10 w-24 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--color-pitch), transparent)' }}
        />
        <div
          className="absolute inset-y-0 right-0 z-10 w-24 pointer-events-none"
          style={{ background: 'linear-gradient(to left, var(--color-pitch), transparent)' }}
        />

        <div
          className="reviews-track py-8 flex gap-8"
          style={{ width: 'max-content', animationPlayState: active ? 'paused' : undefined }}
        >
          {track.map((review, i) => (
            <button
              key={`${review.id}-${i}`}
              onClick={() => setActive(review as Review)}
              // On desktop: click opens modal. On touch devices: same tap opens modal.
              // Hover-pause is handled purely by CSS (.reviews-track:hover) on desktop.
              className="shrink-0 flex flex-col text-left"
              style={{
                width: 320,
                padding: '1.25rem 1.5rem',
                background: 'var(--color-charcoal)',
                border: '1px solid var(--color-charcoal-mid)',
                cursor: 'pointer',
              }}
            >
              <Stars />
              <p
                style={{
                  color: 'var(--color-smoke)',
                  fontSize: '0.875rem',
                  lineHeight: 1.7,
                  flex: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                "{review.text}"
              </p>
              <div
                className="mt-3 text-xs font-semibold tracking-wide"
                style={{ color: 'var(--color-cream-dark)', letterSpacing: '0.08em' }}
              >
                — {review.name}
              </div>
              {review.text.length > 180 && (
                <div style={{ color: 'var(--color-terracotta)', fontSize: '0.75rem', marginTop: '0.5rem', letterSpacing: '0.05em' }}>
                  Read more →
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(14,12,10,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={() => setActive(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--color-charcoal)',
              border: '1px solid var(--color-charcoal-mid)',
              padding: '2.5rem',
              maxWidth: '520px',
              width: '100%',
              position: 'relative',
            }}
          >
            {/* Close */}
            <button
              onClick={() => setActive(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: 'var(--color-smoke)',
                fontSize: '1.25rem',
                cursor: 'pointer',
                lineHeight: 1,
              }}
              aria-label="Close"
            >
              ✕
            </button>

            <LargeStars />

            <p style={{ color: 'var(--color-smoke)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              "{active.text}"
            </p>

            <div
              style={{
                borderTop: '1px solid var(--color-charcoal-mid)',
                paddingTop: '1rem',
                color: 'var(--color-cream-dark)',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
              }}
            >
              — {active.name}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
