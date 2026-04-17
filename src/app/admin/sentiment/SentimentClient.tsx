'use client';

import { useMemo, useState } from 'react';
import type { CigarSentiment } from '@/lib/sentiment';

type SortKey = 'entries' | 'avgOverall' | 'wouldTryAgainPct' | 'ratingVariance';
type FilterView = 'all' | 'loved' | 'polarizing' | 'sleepers' | 'declining';

const filterLabels: Record<FilterView, string> = {
  all: 'All Cigars',
  loved: 'Most Loved',
  polarizing: 'Polarizing',
  sleepers: 'Sleepers',
  declining: 'Trending Down',
};

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span style={{ color: 'var(--color-amber)', letterSpacing: '1px' }}>
      {'★'.repeat(full)}
      <span style={{ color: 'var(--color-charcoal-light)' }}>{'★'.repeat(5 - full)}</span>
    </span>
  );
}

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  const map = {
    up: { char: '↑', color: '#7db97d' },
    down: { char: '↓', color: '#d97a5e' },
    flat: { char: '→', color: 'var(--color-smoke)' },
  };
  return <span style={{ color: map[trend].color, fontSize: '0.95rem' }}>{map[trend].char}</span>;
}

function MiniBar({ pct, color = 'var(--color-terracotta)' }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 4, background: 'var(--color-charcoal-mid)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function SentimentClient({ cigars }: { cigars: CigarSentiment[] }) {
  const [view, setView]         = useState<FilterView>('all');
  const [sort, setSort]         = useState<SortKey>('avgOverall');
  const [query, setQuery]       = useState('');
  const [expandedId, setExpId]  = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = cigars.slice();
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q));
    }
    switch (view) {
      case 'loved':
        list = list.filter(c => c.avgOverall >= 4.5 && c.entries >= 20); break;
      case 'polarizing':
        list = list.filter(c => c.ratingVariance >= 0.8); break;
      case 'sleepers':
        list = list.filter(c => c.entries < 25 && c.avgOverall >= 4.5); break;
      case 'declining':
        list = list.filter(c => c.recentTrend === 'down'); break;
    }
    list.sort((a, b) => {
      const av = a[sort] as number, bv = b[sort] as number;
      return bv - av;
    });
    return list;
  }, [cigars, view, sort, query]);

  const totals = useMemo(() => ({
    cigars: cigars.length,
    entries: cigars.reduce((s, c) => s + c.entries, 0),
    avgRating: cigars.reduce((s, c) => s + c.avgOverall * c.entries, 0) / cigars.reduce((s, c) => s + c.entries, 0),
    pctReorder: cigars.reduce((s, c) => s + c.wouldTryAgainPct * c.entries, 0) / cigars.reduce((s, c) => s + c.entries, 0),
  }), [cigars]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Admin</div>
          <h1 style={{ color: 'var(--color-cream)', fontSize: '1.6rem', fontWeight: 600 }}>Customer Sentiment</h1>
          <div style={{ color: 'var(--color-smoke)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
            What the Tasting Journal is telling us about every cigar on the shelf.
          </div>
        </div>
        <a
          href="/admin/events"
          style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-smoke)', fontSize: '0.72rem', letterSpacing: '0.1em', textDecoration: 'none', fontFamily: 'inherit' }}
        >
          ← Admin Home
        </a>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        <Kpi label="Cigars Tracked" value={String(totals.cigars)} />
        <Kpi label="Total Journal Entries" value={String(totals.entries)} />
        <Kpi label="Weighted Avg Rating" value={totals.avgRating.toFixed(2)} suffix=" / 5" />
        <Kpi label="Would Try Again" value={totals.pctReorder.toFixed(0) + '%'} />
      </div>

      {/* Signal filter chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {(Object.keys(filterLabels) as FilterView[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '0.5rem 1rem',
              background: view === v ? 'var(--color-terracotta)' : 'transparent',
              color: view === v ? 'var(--color-cream)' : 'var(--color-smoke)',
              border: '1px solid',
              borderColor: view === v ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)',
              fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {filterLabels[v]}
          </button>
        ))}
      </div>

      {/* Search + sort */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Search cigar or brand…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            flex: '1 1 240px',
            background: 'var(--color-pitch)',
            border: '1px solid var(--color-charcoal-mid)',
            color: 'var(--color-cream)',
            padding: '0.6rem 0.85rem',
            fontSize: '0.85rem',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortKey)}
          style={{
            background: 'var(--color-pitch)',
            border: '1px solid var(--color-charcoal-mid)',
            color: 'var(--color-cream)',
            padding: '0.6rem 0.85rem',
            fontSize: '0.85rem',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <option value="avgOverall">Sort: Highest Rated</option>
          <option value="entries">Sort: Most Entries</option>
          <option value="wouldTryAgainPct">Sort: % Would Try Again</option>
          <option value="ratingVariance">Sort: Most Polarizing</option>
        </select>
      </div>

      {/* Leaderboard */}
      <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)' }}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,2.2fr) 80px 110px 90px 110px 32px',
          gap: '0.85rem',
          padding: '0.7rem 1.1rem',
          borderBottom: '1px solid var(--color-charcoal-mid)',
          color: 'var(--color-smoke)',
          fontSize: '0.62rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          <div>Cigar</div>
          <div style={{ textAlign: 'center' }}>Entries</div>
          <div>Overall</div>
          <div style={{ textAlign: 'center' }}>Re-try</div>
          <div>Top Notes</div>
          <div></div>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-smoke)', fontSize: '0.85rem' }}>
            No cigars match that view.
          </div>
        )}

        {filtered.map(c => {
          const expanded = expandedId === c.productId;
          const topTags = Object.entries(c.tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
          return (
            <div key={c.productId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <button
                onClick={() => setExpId(expanded ? null : c.productId)}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0,2.2fr) 80px 110px 90px 110px 32px',
                  gap: '0.85rem',
                  padding: '0.95rem 1.1rem',
                  background: expanded ? 'rgba(196,98,45,0.06)' : 'transparent',
                  border: 'none',
                  color: 'var(--color-cream)',
                  cursor: 'pointer',
                  alignItems: 'center',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: 'var(--color-cream)', fontSize: '0.92rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </div>
                  <div style={{ color: 'var(--color-smoke)', fontSize: '0.72rem', marginTop: '2px' }}>
                    {c.brand} · {c.size} <TrendArrow trend={c.recentTrend} />
                  </div>
                </div>
                <div style={{ textAlign: 'center', color: 'var(--color-cream-dark)', fontSize: '0.9rem' }}>{c.entries}</div>
                <div>
                  <div style={{ fontSize: '0.82rem' }}><Stars value={c.avgOverall} /></div>
                  <div style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', marginTop: '2px' }}>{c.avgOverall.toFixed(1)} / 5</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: c.wouldTryAgainPct >= 80 ? 'var(--color-amber-light)' : c.wouldTryAgainPct >= 60 ? 'var(--color-cream-dark)' : '#d97a5e', fontSize: '0.88rem', fontWeight: 600 }}>
                    {c.wouldTryAgainPct}%
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <MiniBar pct={c.wouldTryAgainPct} color={c.wouldTryAgainPct >= 80 ? 'var(--color-amber-light)' : c.wouldTryAgainPct >= 60 ? 'var(--color-cream-dark)' : '#d97a5e'} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {topTags.map(([tag]) => (
                    <span key={tag} style={{ fontSize: '0.62rem', padding: '2px 6px', background: 'var(--color-charcoal-mid)', color: 'var(--color-cream-dark)', letterSpacing: '0.04em' }}>{tag}</span>
                  ))}
                </div>
                <div style={{ color: 'var(--color-smoke)', fontSize: '1rem', textAlign: 'center' }}>{expanded ? '▾' : '▸'}</div>
              </button>

              {expanded && <CigarDetail c={c} />}
            </div>
          );
        })}
      </div>

    </div>
  );
}

function Kpi({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '1rem 1.1rem' }}>
      <div style={{ color: 'var(--color-smoke)', fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{label}</div>
      <div style={{ color: 'var(--color-cream)', fontSize: '1.4rem', fontWeight: 600 }}>
        {value}{suffix && <span style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', marginLeft: '2px' }}>{suffix}</span>}
      </div>
    </div>
  );
}

function CigarDetail({ c }: { c: CigarSentiment }) {
  const tagMax = Math.max(...Object.values(c.tagCounts));
  const tags = Object.entries(c.tagCounts).sort((a, b) => b[1] - a[1]);
  const distMax = Math.max(...c.ratingDistribution);

  return (
    <div style={{ padding: '1.25rem 1.5rem 1.75rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--color-charcoal-mid)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Rating breakdown */}
        <div>
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Rating Breakdown</div>
          {[
            ['Overall', c.avgOverall],
            ['Flavor', c.avgFlavor],
            ['Value', c.avgValue],
            ['Appearance', c.avgAppearance],
          ].map(([lbl, val]) => (
            <div key={lbl as string} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 40px', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ color: 'var(--color-smoke)', fontSize: '0.72rem' }}>{lbl}</div>
              <MiniBar pct={(val as number) * 20} />
              <div style={{ color: 'var(--color-cream-dark)', fontSize: '0.74rem', textAlign: 'right' }}>{(val as number).toFixed(1)}</div>
            </div>
          ))}
        </div>

        {/* Flavor profile */}
        <div>
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Flavor Profile</div>
          {[
            ['Body', c.avgBody],
            ['Strength', c.avgStrength],
          ].map(([lbl, val]) => (
            <div key={lbl as string} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 40px', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ color: 'var(--color-smoke)', fontSize: '0.72rem' }}>{lbl}</div>
              <MiniBar pct={(val as number) * 20} color="var(--color-amber)" />
              <div style={{ color: 'var(--color-cream-dark)', fontSize: '0.74rem', textAlign: 'right' }}>{(val as number).toFixed(1)}</div>
            </div>
          ))}
          <div style={{ marginTop: '1rem', color: 'var(--color-smoke)', fontSize: '0.7rem' }}>
            Would Try Again: <span style={{ color: 'var(--color-cream)', fontWeight: 600 }}>{c.wouldTryAgainPct}%</span>
            &nbsp;·&nbsp; Rating σ: <span style={{ color: 'var(--color-cream)' }}>{c.ratingVariance.toFixed(2)}</span>
          </div>
        </div>

        {/* Rating distribution */}
        <div>
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Rating Distribution</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: 80 }}>
            {c.ratingDistribution.map((n, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ color: 'var(--color-cream-dark)', fontSize: '0.65rem' }}>{n}</div>
                <div style={{
                  width: '100%', height: `${(n / Math.max(distMax, 1)) * 60}px`,
                  background: 'var(--color-terracotta)', minHeight: 2,
                }} />
                <div style={{ color: 'var(--color-smoke)', fontSize: '0.65rem' }}>{i + 1}★</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tag cloud */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ color: 'var(--color-terracotta)', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>Flavor Tags Mentioned</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {tags.map(([tag, count]) => {
            const weight = count / tagMax;
            return (
              <span
                key={tag}
                style={{
                  fontSize: `${0.68 + weight * 0.35}rem`,
                  padding: '4px 10px',
                  background: `rgba(196,98,45,${0.12 + weight * 0.35})`,
                  border: '1px solid rgba(196,98,45,0.25)',
                  color: 'var(--color-cream)',
                  letterSpacing: '0.03em',
                }}
              >
                {tag} <span style={{ color: 'var(--color-smoke)', fontSize: '0.65rem' }}>· {count}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Notes stream */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.7rem' }}>
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            Recent Notes ({c.notes.length} of {c.entries})
          </div>
          <a href="#" style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', textDecoration: 'none' }}>View all →</a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {c.notes.map((n, i) => (
            <div key={i} style={{ padding: '0.85rem 1rem', background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--color-cream)', fontSize: '0.78rem', fontWeight: 600 }}>{n.userHandle}</span>
                  <span style={{ color: 'var(--color-smoke)', fontSize: '0.68rem' }}>· {n.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem' }}>
                  <Stars value={n.overall} />
                  {n.wouldTryAgain
                    ? <span style={{ color: '#7db97d', fontSize: '0.65rem', letterSpacing: '0.08em' }}>● WILL RE-TRY</span>
                    : <span style={{ color: '#d97a5e', fontSize: '0.65rem', letterSpacing: '0.08em' }}>● NOT AGAIN</span>}
                </div>
              </div>
              <div style={{ color: 'var(--color-cream-dark)', fontSize: '0.82rem', lineHeight: 1.55, marginBottom: '0.5rem' }}>
                &ldquo;{n.text}&rdquo;
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {n.tags.map(t => (
                  <span key={t} style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'var(--color-charcoal-mid)', color: 'var(--color-smoke)', letterSpacing: '0.04em' }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
