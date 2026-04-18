'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { nameToSlug } from '@/lib/slug';

type AshtrayEntry = {
  id: string;
  product_id: string;
  cigar_name: string;
  brand: string;
  size: string;
  overall_rating: number | null;
  date_smoked: string | null;
  updated_at: string;
};

type HistoryCigar = {
  name: string;
  totalQty: number;
  macro: string;
};

function StarDisplay({ rating }: { rating: number | null }) {
  if (!rating) return <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>Not rated</span>;
  return (
    <span style={{ color: 'var(--color-terracotta)', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function AshtrayClient() {
  const [entries, setEntries]       = useState<AshtrayEntry[]>([]);
  const [history, setHistory]       = useState<HistoryCigar[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState('');

  const loadEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/account/ashtray');
      const json = await res.json();
      if (json.error) setError(json.error);
      else setEntries(json.entries ?? []);
    } catch {
      setError('Failed to load ashtray');
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/account/history');
      const json = await res.json();
      if (!json.error) setHistory(json.cigars ?? []);
    } catch {
      // non-fatal — unlogged section just won't show
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
    loadHistory();
  }, [loadEntries, loadHistory]);

  const loggedIds = useMemo(() => new Set(entries.map(e => e.cigar_name.toLowerCase())), [entries]);

  const unlogged = useMemo(() =>
    history.filter(c => !loggedIds.has(c.name.toLowerCase())),
    [history, loggedIds]
  );

  const filteredEntries = useMemo(() => {
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter(e => e.cigar_name.toLowerCase().includes(q) || e.brand?.toLowerCase().includes(q));
  }, [entries, search]);

  const filteredUnlogged = useMemo(() => {
    if (!search) return unlogged;
    const q = search.toLowerCase();
    return unlogged.filter(c => c.name.toLowerCase().includes(q));
  }, [unlogged, search]);

  if (error && error !== 'not_linked') {
    return (
      <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '2rem' }}>
        <p style={{ color: 'var(--color-smoke)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: '2.5rem' }}>
        <input
          type="text"
          placeholder="Search your ashtray…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            background: 'var(--color-charcoal)',
            border: '1px solid var(--color-charcoal-mid)',
            color: 'var(--color-cream)',
            padding: '0.55rem 1rem',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Logged entries */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-charcoal-mid)', paddingBottom: '0.75rem' }}>
          <h2 style={{ color: 'var(--color-cream)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            My Entries
          </h2>
          {!loadingEntries && (
            <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>
              {filteredEntries.length} cigar{filteredEntries.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loadingEntries ? (
          <SkeletonGrid count={4} />
        ) : filteredEntries.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--color-charcoal-mid)' }}>
            <p style={{ color: 'var(--color-smoke)', fontSize: '0.9rem' }}>
              {search ? 'No entries match your search.' : 'No ashtray entries yet. Start one below.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: 'var(--color-charcoal-mid)' }}>
            {filteredEntries.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>

      {/* Unlogged cigars */}
      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-charcoal-mid)', paddingBottom: '0.75rem' }}>
          <h2 style={{ color: 'var(--color-cream)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            Start a New Entry
          </h2>
          {!loadingHistory && (
            <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>
              {filteredUnlogged.length} cigar{filteredUnlogged.length !== 1 ? 's' : ''} from your purchase history
            </span>
          )}
        </div>

        {loadingHistory ? (
          <SkeletonGrid count={6} />
        ) : error === 'not_linked' ? (
          <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '1.5rem' }}>
            <p style={{ color: 'var(--color-smoke)', fontSize: '0.875rem', lineHeight: 1.7 }}>
              Link your in-store account in{' '}
              <a href="/account/profile" style={{ color: 'var(--color-terracotta)' }}>My Profile</a>{' '}
              to see cigars from your purchase history here.
            </p>
          </div>
        ) : filteredUnlogged.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--color-charcoal-mid)' }}>
            <p style={{ color: 'var(--color-smoke)', fontSize: '0.9rem' }}>
              {search ? 'No unlogged cigars match your search.' : 'You\'ve logged every cigar you\'ve purchased. Nice work.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: 'var(--color-charcoal-mid)' }}>
            {filteredUnlogged.map(cigar => (
              <UnloggedCard key={cigar.name} cigar={cigar} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EntryCard({ entry }: { entry: AshtrayEntry }) {
  const slug = nameToSlug(entry.cigar_name);
  const dateSuffix = entry.date_smoked
    ? new Date(entry.date_smoked).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <a
      href={`/account/ashtray/${slug}`}
      style={{ display: 'block', background: 'var(--color-charcoal)', padding: '1.5rem', textDecoration: 'none' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-charcoal-mid)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-charcoal)')}
    >
      {entry.brand && (
        <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
          {entry.brand}
        </div>
      )}
      <div style={{ color: 'var(--color-cream)', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3, marginBottom: '0.5rem' }}>
        {entry.cigar_name}
      </div>
      {entry.size && (
        <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
          {entry.size}
        </div>
      )}
      <div style={{ marginBottom: '0.5rem' }}>
        <StarDisplay rating={entry.overall_rating} />
      </div>
      {dateSuffix && (
        <div style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', marginTop: '0.75rem' }}>
          Smoked {dateSuffix}
        </div>
      )}
    </a>
  );
}

function UnloggedCard({ cigar }: { cigar: HistoryCigar }) {
  const slug = nameToSlug(cigar.name);

  return (
    <div style={{ background: 'var(--color-charcoal)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
      <div>
        <div style={{ color: 'var(--color-cream)', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3, marginBottom: '0.35rem' }}>
          {cigar.name}
        </div>
        <div style={{ color: 'var(--color-smoke)', fontSize: '0.72rem' }}>
          {cigar.totalQty} unit{cigar.totalQty !== 1 ? 's' : ''} purchased
        </div>
      </div>
      <a
        href={`/account/ashtray/${slug}?new=1`}
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
        Begin Ashtray Entry →
      </a>
    </div>
  );
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: 'var(--color-charcoal-mid)' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background: 'var(--color-charcoal)', padding: '1.5rem' }}>
          <div style={{ height: '10px', width: '60px', background: 'var(--color-charcoal-mid)', marginBottom: '0.5rem', opacity: 0.6 }} />
          <div style={{ height: '16px', width: '80%', background: 'var(--color-charcoal-mid)', marginBottom: '0.35rem', opacity: 0.5 - i * 0.04 }} />
          <div style={{ height: '12px', width: '40%', background: 'var(--color-charcoal-mid)', opacity: 0.3 }} />
        </div>
      ))}
    </div>
  );
}
