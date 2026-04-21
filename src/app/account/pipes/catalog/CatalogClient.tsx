'use client';

import { useMemo, useState } from 'react';
import { nameToSlug } from '@/lib/slug';
import WishlistHeart from '@/components/shop/WishlistHeart';
import type { ProductGroup } from '@/lib/productGroups';

type Props = {
  groups: ProductGroup[];
  ownedIds: string[];
};

export default function CatalogClient({ groups, ownedIds }: Props) {
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(true);

  const owned = useMemo(() => new Set(ownedIds), [ownedIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups.filter(g => {
      const anyActive = g.variants.some(v => !v.isArchived);
      if (!showArchived && !anyActive) return false;
      if (!q) return true;
      return g.name.toLowerCase().includes(q) || g.brand.toLowerCase().includes(q);
    });
  }, [groups, search, showArchived]);

  const brands = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of groups) m.set(g.brand, (m.get(g.brand) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [groups]);

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or brand…"
          style={{
            flex: '1 1 260px', maxWidth: 400,
            background: 'var(--color-charcoal)',
            border: '1px solid var(--color-charcoal-mid)',
            color: 'var(--color-cream)',
            padding: '0.55rem 1rem',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
        <label style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
          Include discontinued
        </label>
        <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', marginLeft: 'auto' }}>
          {filtered.length} of {groups.length} · {brands.length} brands
        </span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--color-charcoal-mid)' }}>
          <p style={{ color: 'var(--color-smoke)' }}>No pipes match that search.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1px', background: 'var(--color-charcoal-mid)' }}>
          {filtered.map(g => (
            <CatalogTile key={g.name} group={g} inCollection={g.variants.some(v => owned.has(v.id))} />
          ))}
        </div>
      )}
    </div>
  );
}

function CatalogTile({ group, inCollection }: { group: ProductGroup; inCollection: boolean }) {
  const slug = nameToSlug(group.name);
  const firstVariant = group.variants[0];
  const allArchived = group.variants.every(v => v.isArchived);

  const priceDisplay = group.minPrice === group.maxPrice
    ? `$${group.minPrice.toFixed(2)}`
    : `From $${group.minPrice.toFixed(2)}`;

  return (
    <div style={{ background: 'var(--color-charcoal)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', opacity: allArchived ? 0.8 : 1 }}>
      {allArchived && (
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.8)', color: 'var(--color-smoke)', fontSize: '0.6rem', padding: '3px 8px', letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--color-charcoal-mid)' }}>
          Discontinued
        </div>
      )}

      <div style={{ aspectRatio: '3 / 2', background: 'var(--color-charcoal-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '0.5rem' }}>
        {group.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={group.imageUrl} alt={group.name} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }} />
        ) : (
          <span style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>No Image</span>
        )}
      </div>

      <div>
        <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
          {group.brand}
        </div>
        <div style={{ color: 'var(--color-cream)', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3, marginBottom: '0.35rem' }}>
          {group.name}
        </div>
        <div style={{ color: 'var(--color-smoke)', fontSize: '0.72rem' }}>
          {allArchived ? 'Previously carried' : priceDisplay}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem' }}>
        <WishlistHeart
          variant={{
            id: firstVariant.id,
            name: group.name,
            brand: group.brand,
            size: firstVariant.size,
            imageUrl: group.imageUrl,
          }}
          size={30}
        />
        {inCollection ? (
          <div style={{ flex: 1, textAlign: 'center', padding: '0.45rem 0.6rem', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-smoke)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            In Collection
          </div>
        ) : (
          <a
            href={`/account/pipes/collection/add?product_slug=${slug}`}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '0.45rem 0.6rem',
              background: 'transparent',
              border: '1px solid var(--color-terracotta)',
              color: 'var(--color-terracotta)',
              fontSize: '0.68rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            + Collection
          </a>
        )}
      </div>
    </div>
  );
}
