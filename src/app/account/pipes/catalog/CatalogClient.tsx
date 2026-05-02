'use client';

import { useMemo, useState } from 'react';
import { nameToSlug } from '@/lib/slug';
import WishlistHeart from '@/components/shop/WishlistHeart';
import type { ProductGroup } from '@/lib/productGroups';

type CatalogGroup = ProductGroup & { shape: string | null };

type Props = {
  groups: CatalogGroup[];
  ownedIds: string[];
};

type Sort = 'name' | 'price-asc' | 'price-desc';

const inputStyle: React.CSSProperties = {
  background: 'var(--color-charcoal)',
  border: '1px solid var(--color-charcoal-mid)',
  color: 'var(--color-cream)',
  padding: '0.55rem 0.75rem',
  fontSize: '0.875rem',
  outline: 'none',
};

export default function CatalogClient({ groups, ownedIds }: Props) {
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [shape, setShape] = useState('');
  const [sort, setSort] = useState<Sort>('name');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const owned = useMemo(() => new Set(ownedIds), [ownedIds]);

  const brandOptions = useMemo(() => {
    const set = new Set<string>();
    for (const g of groups) if (g.brand) set.add(g.brand);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [groups]);

  const shapeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const g of groups) if (g.shape) set.add(g.shape);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [groups]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    const hasMin = !isNaN(min);
    const hasMax = !isNaN(max);

    const result = groups.filter(g => {
      if (brand && g.brand !== brand) return false;
      if (shape && g.shape !== shape) return false;
      if (hasMin && g.maxPrice < min) return false;
      if (hasMax && g.minPrice > max) return false;
      if (q && !(g.name.toLowerCase().includes(q) || g.brand.toLowerCase().includes(q))) return false;
      return true;
    });

    if (sort === 'price-asc') result.sort((a, b) => a.minPrice - b.minPrice);
    else if (sort === 'price-desc') result.sort((a, b) => b.minPrice - a.minPrice);
    else result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [groups, search, brand, shape, sort, minPrice, maxPrice]);

  const activeFilterCount = (brand ? 1 : 0) + (shape ? 1 : 0) + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);
  const clearAll = () => { setBrand(''); setShape(''); setMinPrice(''); setMaxPrice(''); setSearch(''); };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or brand…"
          style={{ ...inputStyle, flex: '1 1 260px', maxWidth: 400 }}
        />
        <select value={brand} onChange={e => setBrand(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
          <option value="">All Brands</option>
          {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={shape} onChange={e => setShape(e.target.value)} style={{ ...inputStyle, minWidth: 140 }}>
          <option value="">All Shapes</option>
          {shapeOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as Sort)} style={{ ...inputStyle, minWidth: 160 }}>
          <option value="name">Sort: Name (A–Z)</option>
          <option value="price-asc">Sort: Price (Low → High)</option>
          <option value="price-desc">Sort: Price (High → Low)</option>
        </select>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>$</span>
          <input
            type="number" min="0" step="1"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            placeholder="Min"
            style={{ ...inputStyle, width: 80 }}
          />
          <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>–</span>
          <input
            type="number" min="0" step="1"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            placeholder="Max"
            style={{ ...inputStyle, width: 80 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem' }}>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-charcoal-mid)',
              color: 'var(--color-smoke)',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '0.35rem 0.8rem',
              cursor: 'pointer',
            }}
          >
            Clear filters
          </button>
        )}
        <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', marginLeft: 'auto' }}>
          {filtered.length} of {groups.length} · {brandOptions.length} brands
        </span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--color-charcoal-mid)' }}>
          <p style={{ color: 'var(--color-smoke)' }}>No pipes match those filters.</p>
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

function CatalogTile({ group, inCollection }: { group: CatalogGroup; inCollection: boolean }) {
  const slug = nameToSlug(group.name);
  const firstVariant = group.variants[0];

  const priceDisplay = group.minPrice === group.maxPrice
    ? `$${group.minPrice.toFixed(2)}`
    : `From $${group.minPrice.toFixed(2)}`;

  return (
    <div style={{ background: 'var(--color-charcoal)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
      <div style={{ aspectRatio: '3 / 2', background: 'var(--color-charcoal-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '0.5rem' }}>
        {group.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={group.imageUrl} alt={group.name} loading="lazy" decoding="async" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }} />
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
          {priceDisplay}
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
