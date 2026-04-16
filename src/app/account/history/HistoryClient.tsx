'use client';

import { useState, useEffect, useCallback } from 'react';
import { nameToSlug } from '@/lib/slug';

type Product = { name: string; totalQty: number; macro: string };
type Data    = { cigars: Product[]; pipes: Product[]; other: Product[] };

const CATS = [
  { key: 'cigars', label: 'Cigars' },
  { key: 'pipes',  label: 'Pipes'  },
  { key: 'other',  label: 'Other'  },
];

export default function HistoryClient() {
  const [data, setData]           = useState<Data | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [cat, setCat]             = useState<'cigars' | 'pipes' | 'other'>('cigars');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<Product | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/account/history');
      const json = await res.json();
      if (json.error) setError(json.error);
      else setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const products = data?.[cat] ?? [];
  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;
  const maxQty = filtered.length > 0 ? Math.max(...filtered.map(p => p.totalQty)) : 1;

  if (error) {
    return (
      <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '2rem' }}>
        {error === 'not_linked' ? (
          <>
            <p style={{ color: 'var(--color-cream)', fontWeight: 600, marginBottom: '0.5rem' }}>
              We couldn&apos;t link your in-store account automatically.
            </p>
            <p style={{ color: 'var(--color-smoke)', fontSize: '0.9rem', lineHeight: 1.8 }}>
              If you signed in with Google, your Google email may differ from what&apos;s on file at the shop.
              Go to <a href="/account/profile" style={{ color: 'var(--color-terracotta)' }}>My Profile</a> and
              set your <strong style={{ color: 'var(--color-cream-dark)' }}>Preferred Email</strong> or <strong style={{ color: 'var(--color-cream-dark)' }}>phone number</strong> to
              match what you use at Just The Tip, then come back here.
            </p>
          </>
        ) : (
          <p style={{ color: 'var(--color-smoke)' }}>{error}</p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Category + Search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '2px', background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '3px' }}>
          {CATS.map(c => (
            <button
              key={c.key}
              onClick={() => { setCat(c.key as typeof cat); setSearch(''); }}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: cat === c.key ? 'var(--color-terracotta)' : 'transparent',
                color: cat === c.key ? 'var(--color-cream)' : 'var(--color-smoke)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {c.label}
              {data && !loading && (
                <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', opacity: 0.7 }}>
                  ({(data[c.key as 'cigars' | 'pipes' | 'other'] as Product[])?.length ?? 0})
                </span>
              )}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '160px',
            background: 'var(--color-charcoal)',
            border: '1px solid var(--color-charcoal-mid)',
            color: 'var(--color-cream)',
            padding: '0.45rem 0.85rem',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Product list */}
      <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--color-charcoal-mid)' }}>
          <span style={{ color: 'var(--color-smoke)', fontSize: '0.78rem' }}>
            {loading ? 'Loading…' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
          </span>
          {!loading && data && (
            <span style={{ color: 'var(--color-smoke)', fontSize: '0.72rem' }}>sorted by units purchased</span>
          )}
        </div>

        {loading ? (
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width: '24px', height: '16px', background: 'var(--color-charcoal-mid)', borderRadius: '2px', opacity: 0.5 }} />
                <div style={{ flex: 1, height: '16px', background: 'var(--color-charcoal-mid)', borderRadius: '2px', opacity: 0.4 - i * 0.04 }} />
                <div style={{ width: '40px', height: '16px', background: 'var(--color-charcoal-mid)', borderRadius: '2px', opacity: 0.3 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-smoke)' }}>
            {search ? 'No products match your search' : `No ${cat} purchased`}
          </div>
        ) : (
          <div>
            {filtered.map((p, i) => {
              const barPct = (p.totalQty / maxQty) * 100;
              const clickable = cat === 'cigars';
              return (
                <div
                  key={p.name}
                  onClick={() => clickable && setSelected(p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.85rem 1.25rem',
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    cursor: clickable ? 'pointer' : 'default',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (clickable) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ width: '24px', textAlign: 'center', fontSize: '0.72rem', color: 'var(--color-smoke)', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--color-cream)', fontSize: '0.88rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ marginTop: '6px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${barPct}%`, background: 'var(--color-terracotta)', opacity: 0.8, borderRadius: '2px' }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: 'var(--color-cream)', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1 }}>{p.totalQty.toLocaleString()}</div>
                    <div style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', marginTop: '2px' }}>units</div>
                  </div>
                  {clickable && (
                    <div style={{ color: 'var(--color-charcoal-mid)', fontSize: '0.75rem', flexShrink: 0 }}>›</div>
                  )}
                </div>
              );
            })}
            {filtered.length > 0 && (
              <div style={{ padding: '0.65rem 1.25rem', borderTop: '1px solid var(--color-charcoal-mid)', fontSize: '0.75rem', color: 'var(--color-smoke)' }}>
                Total units: {filtered.reduce((s, p) => s + p.totalQty, 0).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50, padding: '1.5rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--color-charcoal)',
              border: '1px solid var(--color-charcoal-mid)',
              width: '100%', maxWidth: '380px',
              padding: '2rem',
            }}
          >
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Purchase History
            </div>
            <div style={{ color: 'var(--color-cream)', fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.3, marginBottom: '0.35rem' }}>
              {selected.name}
            </div>
            <div style={{ color: 'var(--color-smoke)', fontSize: '0.78rem', marginBottom: '2rem' }}>
              {selected.totalQty.toLocaleString()} unit{selected.totalQty !== 1 ? 's' : ''} purchased
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <a
                href={`/shop/${nameToSlug(selected.name)}`}
                style={{
                  display: 'block', textAlign: 'center',
                  padding: '0.75rem 1rem',
                  background: 'var(--color-terracotta)',
                  color: 'var(--color-cream)',
                  textDecoration: 'none',
                  fontSize: '0.78rem', fontWeight: 600,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                }}
              >
                View in Shop
              </a>
              <a
                href={`/account/journal/${nameToSlug(selected.name)}`}
                style={{
                  display: 'block', textAlign: 'center',
                  padding: '0.75rem 1rem',
                  background: 'transparent',
                  border: '1px solid var(--color-charcoal-mid)',
                  color: 'var(--color-cream)',
                  textDecoration: 'none',
                  fontSize: '0.78rem', fontWeight: 600,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                }}
              >
                Tasting Journal
              </a>
            </div>

            <button
              onClick={() => setSelected(null)}
              style={{
                display: 'block', width: '100%', marginTop: '1rem',
                background: 'none', border: 'none',
                color: 'var(--color-smoke)', fontSize: '0.72rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'inherit', padding: '0.5rem',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
