'use client';

import { useEffect, useMemo, useState } from 'react';
import { nameToSlug } from '@/lib/slug';

type Pipe = {
  id: string;
  pipe_name: string;
  brand: string;
  sub_category: string | null;
  status: string;
  rotation_frequency: string | null;
  shape: string | null;
  material: string | null;
  date_purchased: string | null;
  price_paid: number | null;
  estimated_value: number | null;
  stock_image_url: string | null;
  product_id: string | null;
};

type Photo = {
  id: string;
  pipe_id: string;
  url: string;
  is_primary: boolean;
};

type HistoryPipe = { name: string; totalQty: number; macro: string };

export default function CollectionClient({ pipes, photos }: { pipes: Pipe[]; photos: Photo[] }) {
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<HistoryPipe[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/account/history')
      .then(r => r.json())
      .then(j => {
        if (j.error) setHistoryError(j.error);
        else setHistory(j.pipes ?? []);
      })
      .catch(() => { /* non-fatal */ })
      .finally(() => setHistoryLoaded(true));
  }, []);

  const ownedNames = useMemo(() => new Set(pipes.map(p => p.pipe_name.toLowerCase())), [pipes]);
  const unloggedHistory = useMemo(
    () => history.filter(h => !ownedNames.has(h.name.toLowerCase())),
    [history, ownedNames]
  );

  const primaryPhotoByPipe = useMemo(() => {
    const m = new Map<string, string>();
    const grouped = new Map<string, Photo[]>();
    for (const p of photos) {
      if (!grouped.has(p.pipe_id)) grouped.set(p.pipe_id, []);
      grouped.get(p.pipe_id)!.push(p);
    }
    for (const [pipeId, list] of grouped) {
      const primary = list.find(p => p.is_primary) ?? list[0];
      if (primary) m.set(pipeId, primary.url);
    }
    return m;
  }, [photos]);

  const filtered = useMemo(() => {
    if (!search) return pipes;
    const q = search.toLowerCase();
    return pipes.filter(p =>
      p.pipe_name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.shape ?? '').toLowerCase().includes(q) ||
      (p.material ?? '').toLowerCase().includes(q)
    );
  }, [pipes, search]);

  const active  = filtered.filter(p => p.status !== 'Retired');
  const retired = filtered.filter(p => p.status === 'Retired');

  const groups = useMemo(() => {
    const m = new Map<string, Pipe[]>();
    for (const p of active) {
      const key = p.sub_category || 'Other';
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(p);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [active]);

  const stats = useMemo(() => {
    const total = pipes.length;
    const activeCount = pipes.filter(p => p.status === 'Active').length;
    const totalValue = pipes.reduce((s, p) => s + (Number(p.estimated_value) || 0), 0);
    const shapes = pipes.map(p => p.shape).filter(Boolean) as string[];
    const shapeCount = new Map<string, number>();
    for (const s of shapes) shapeCount.set(s, (shapeCount.get(s) ?? 0) + 1);
    const favorite = [...shapeCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const dates = pipes.map(p => p.date_purchased).filter(Boolean) as string[];
    const oldest = dates.sort()[0] ?? null;
    return { total, activeCount, totalValue, favorite, oldest };
  }, [pipes]);

  return (
    <div>
      {/* Stats */}
      {pipes.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1px', background: 'var(--color-charcoal-mid)', marginBottom: '2.5rem',
        }}>
          <StatBox label="Pipes"         value={String(stats.total)} sub={`${stats.activeCount} active`} />
          <StatBox label="Est. Value"    value={stats.totalValue > 0 ? `$${stats.totalValue.toFixed(0)}` : '—'} />
          <StatBox label="Favorite Shape" value={stats.favorite ?? '—'} />
          <StatBox label="Oldest Acquisition" value={stats.oldest ? new Date(stats.oldest).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'} />
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search collection…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: '1 1 240px', maxWidth: '400px',
            background: 'var(--color-charcoal)',
            border: '1px solid var(--color-charcoal-mid)',
            color: 'var(--color-cream)',
            padding: '0.55rem 1rem',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
        <a
          href="/account/pipes/collection/new"
          style={{
            padding: '0.55rem 1.25rem',
            background: 'var(--color-terracotta)',
            color: 'var(--color-pitch)',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          + Add Custom Pipe
        </a>
      </div>

      {pipes.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--color-charcoal-mid)' }}>
          <p style={{ color: 'var(--color-smoke)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            No pipes in your collection yet.
          </p>
          <p style={{ color: 'var(--color-smoke)', fontSize: '0.8rem' }}>
            Browse <a href="/shop" style={{ color: 'var(--color-terracotta)' }}>the shop</a> and add from our catalog, or add a custom pipe above.
          </p>
        </div>
      )}

      {groups.map(([sub, list]) => (
        <section key={sub} style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-charcoal-mid)', paddingBottom: '0.75rem' }}>
            <h2 style={{ color: 'var(--color-cream)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
              {sub}
            </h2>
            <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>
              {list.length} pipe{list.length !== 1 ? 's' : ''}
            </span>
          </div>
          <TileGrid pipes={list} primaryPhotoByPipe={primaryPhotoByPipe} />
        </section>
      ))}

      {retired.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-charcoal-mid)', paddingBottom: '0.75rem' }}>
            <h2 style={{ color: 'var(--color-smoke)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
              Retired
            </h2>
            <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>
              {retired.length} pipe{retired.length !== 1 ? 's' : ''}
            </span>
          </div>
          <TileGrid pipes={retired} primaryPhotoByPipe={primaryPhotoByPipe} dim />
        </section>
      )}

      {/* From Purchase History */}
      {historyLoaded && historyError !== 'not_linked' && unloggedHistory.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-charcoal-mid)', paddingBottom: '0.75rem' }}>
            <h2 style={{ color: 'var(--color-cream)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
              From Your Purchase History
            </h2>
            <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>
              {unloggedHistory.length} pipe{unloggedHistory.length !== 1 ? 's' : ''} not yet in your collection
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: 'var(--color-charcoal-mid)' }}>
            {unloggedHistory.map(h => (
              <HistoryCard key={h.name} history={h} />
            ))}
          </div>
        </section>
      )}

      {historyError === 'not_linked' && pipes.length === 0 && (
        <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '1.5rem', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--color-smoke)', fontSize: '0.85rem', lineHeight: 1.7 }}>
            Link your in-store account in{' '}
            <a href="/account/profile" style={{ color: 'var(--color-terracotta)' }}>My Profile</a>{' '}
            to pull pipes from your purchase history into your collection.
          </p>
        </div>
      )}
    </div>
  );
}

function HistoryCard({ history }: { history: HistoryPipe }) {
  const slug = nameToSlug(history.name);
  return (
    <div style={{ background: 'var(--color-charcoal)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
      <div>
        <div style={{ color: 'var(--color-cream)', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3, marginBottom: '0.35rem' }}>
          {history.name}
        </div>
        <div style={{ color: 'var(--color-smoke)', fontSize: '0.72rem' }}>
          {history.totalQty} unit{history.totalQty !== 1 ? 's' : ''} purchased
        </div>
      </div>
      <a
        href={`/account/pipes/collection/add?product_slug=${slug}&fallback_name=${encodeURIComponent(history.name)}`}
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '0.55rem 1rem',
          background: 'transparent',
          border: '1px solid var(--color-charcoal-mid)',
          color: 'var(--color-smoke)',
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-terracotta)'; e.currentTarget.style.color = 'var(--color-terracotta)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-charcoal-mid)'; e.currentTarget.style.color = 'var(--color-smoke)'; }}
      >
        Add to Collection →
      </a>
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: 'var(--color-charcoal)', padding: '1.25rem' }}>
      <div style={{ color: 'var(--color-smoke)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
        {label}
      </div>
      <div style={{ color: 'var(--color-cream)', fontSize: '1.1rem', fontWeight: 600 }}>
        {value}
      </div>
      {sub && <div style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  );
}

function TileGrid({ pipes, primaryPhotoByPipe, dim }: { pipes: Pipe[]; primaryPhotoByPipe: Map<string, string>; dim?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1px', background: 'var(--color-charcoal-mid)' }}>
      {pipes.map(p => (
        <PipeTile key={p.id} pipe={p} photoUrl={primaryPhotoByPipe.get(p.id) ?? p.stock_image_url} dim={dim} />
      ))}
    </div>
  );
}

function PipeTile({ pipe, photoUrl, dim }: { pipe: Pipe; photoUrl: string | null | undefined; dim?: boolean }) {
  return (
    <a
      href={`/account/pipes/collection/${pipe.id}`}
      style={{
        display: 'block',
        background: 'var(--color-charcoal)',
        padding: '1.25rem',
        textDecoration: 'none',
        opacity: dim ? 0.65 : 1,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-charcoal-mid)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-charcoal)')}
    >
      <div style={{ aspectRatio: '1 / 1', background: 'var(--color-pitch)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={pipe.pipe_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>No Photo</span>
        )}
      </div>
      <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
        {pipe.brand}
      </div>
      <div style={{ color: 'var(--color-cream)', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3, marginBottom: '0.35rem' }}>
        {pipe.pipe_name}
      </div>
      <div style={{ color: 'var(--color-smoke)', fontSize: '0.72rem' }}>
        {[pipe.shape, pipe.material].filter(Boolean).join(' · ') || '—'}
      </div>
      {pipe.status !== 'Active' && (
        <div style={{ color: 'var(--color-smoke)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.5rem' }}>
          {pipe.status}
        </div>
      )}
    </a>
  );
}
