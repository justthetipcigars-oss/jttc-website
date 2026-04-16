'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { LightspeedProduct } from '@/lib/lightspeed';
import { groupByName, ProductGroup } from '@/lib/productGroups';
import CigarModal from '@/components/shop/CigarModal';
import AshtrayModal, { AshtrayEntry } from '@/components/AshtrayModal';
import { nameToSlug } from '@/lib/slug';

type AshtrayItem = AshtrayEntry & { smoked_at: string };

const STATUS_LABEL: Record<string, string> = {
  pending:   'Review Pending',
  rated:     'Quick Rated',
  journaled: 'Journal Entry',
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span style={{ color: 'var(--color-terracotta)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function AshtrayClient({
  initialItems,
  products,
}: {
  initialItems: AshtrayItem[];
  products: LightspeedProduct[];
}) {
  const [items, setItems] = useState<AshtrayItem[]>(initialItems);
  const [showBrowse, setShowBrowse] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [openProduct, setOpenProduct] = useState<ProductGroup | null>(null);
  const [pendingItem, setPendingItem] = useState<{ product_id: string; product_name: string; brand: string; size: string; image_url: string | null } | null>(null);

  const cigarGroups = useMemo(() => groupByName(products.filter(p => p.isCigar)), [products]);

  const brands = useMemo(
    () => [...new Set(cigarGroups.map(g => g.brand).filter(Boolean))].sort(),
    [cigarGroups]
  );

  const filteredGroups = useMemo(() => {
    let groups = cigarGroups;
    if (selectedBrand) groups = groups.filter(g => g.brand === selectedBrand);
    if (search) {
      const q = search.toLowerCase();
      groups = groups.filter(g => g.name.toLowerCase().includes(q) || g.brand.toLowerCase().includes(q));
    }
    return groups;
  }, [cigarGroups, selectedBrand, search]);

  async function removeItem(id: string) {
    await fetch('/api/account/ashtray', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const pending   = items.filter(i => i.status === 'pending');
  const reviewed  = items.filter(i => i.status !== 'pending');

  return (
    <div>
      {/* Add cigar button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setShowBrowse(!showBrowse)}
          style={{
            padding: '0.75rem 1.75rem',
            background: 'var(--color-terracotta)',
            color: 'var(--color-cream)',
            border: 'none',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '0.85rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {showBrowse ? '× Close Catalog' : '+ Add a Smoke'}
        </button>
      </div>

      {/* Catalog browse panel */}
      {showBrowse && (
        <div style={{ marginBottom: '3rem', background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or brand..."
              style={{
                flex: 1, minWidth: 200,
                padding: '0.6rem 1rem',
                background: 'var(--color-pitch)',
                border: '1px solid var(--color-charcoal-mid)',
                color: 'var(--color-cream)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              style={{
                padding: '0.6rem 1rem',
                background: 'var(--color-pitch)',
                border: '1px solid var(--color-charcoal-mid)',
                color: selectedBrand ? 'var(--color-cream)' : 'var(--color-smoke)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            >
              <option value="">All Brands</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', letterSpacing: '0.08em', marginBottom: '1rem' }}>
            {filteredGroups.length} product{filteredGroups.length !== 1 ? 's' : ''}
          </div>

          {filteredGroups.length === 0 ? (
            <p style={{ color: 'var(--color-smoke)', fontSize: '0.85rem' }}>No products match your search.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '1px',
              background: 'var(--color-charcoal-mid)',
              maxHeight: '520px',
              overflowY: 'auto',
            }}>
              {filteredGroups.map(g => (
                <CatalogTile key={g.name} group={g} onSelect={() => setOpenProduct(g)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--color-charcoal-mid)' }}>
          <p style={{ color: 'var(--color-smoke)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Nothing in the ashtray yet. Move smoked cigars from your humidor or add them directly above.
          </p>
        </div>
      )}

      {/* Pending review section */}
      {pending.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-charcoal-mid)' }}>
            Review Pending — {pending.length}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {pending.map(item => (
              <AshtrayCard key={item.id} item={item} onRemove={removeItem} />
            ))}
          </div>
        </div>
      )}

      {/* Reviewed section */}
      {reviewed.length > 0 && (
        <div>
          {pending.length > 0 && (
            <div style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-charcoal-mid)' }}>
              Reviewed — {reviewed.length}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {reviewed.map(item => (
              <AshtrayCard key={item.id} item={item} onRemove={removeItem} />
            ))}
          </div>
        </div>
      )}

      {/* Variant picker modal */}
      {openProduct && (
        <CigarModal
          group={openProduct}
          onClose={() => setOpenProduct(null)}
          onAddToHumidor={variant => {
            setPendingItem({
              product_id: variant.id,
              product_name: variant.name,
              brand: variant.brand,
              size: variant.size,
              image_url: variant.imageUrl,
            });
            setOpenProduct(null);
            setShowBrowse(false);
          }}
        />
      )}

      {/* Ashtray modal */}
      {pendingItem && (
        <AshtrayModal
          item={pendingItem}
          onDone={(entry: AshtrayEntry) => {
            setItems(prev => [entry as AshtrayItem, ...prev]);
            setPendingItem(null);
          }}
          onClose={() => setPendingItem(null)}
        />
      )}
    </div>
  );
}

function AshtrayCard({ item, onRemove }: { item: AshtrayItem; onRemove: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false);

  const smokedDate = item.smoked_at
    ? new Date(item.smoked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '1.5rem' }}>

      {/* Image */}
      {item.image_url && (
        <div style={{ width: '100%', aspectRatio: '3/2', position: 'relative', marginBottom: '1rem', background: 'var(--color-pitch)', overflow: 'hidden' }}>
          <Image src={item.image_url} alt={item.product_name} fill className="object-contain" style={{ padding: '0.5rem' }} sizes="300px" />
        </div>
      )}

      {/* Name / brand / size */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--color-cream)', fontSize: '0.95rem', lineHeight: 1.4, marginBottom: '0.2rem' }}>
          {item.product_name}
        </div>
        <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>
          {item.brand}{item.brand && item.size ? ' · ' : ''}{item.size}
        </div>
        {smokedDate && (
          <div style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', marginTop: '0.2rem' }}>
            {smokedDate}
          </div>
        )}
      </div>

      {/* Status / rating */}
      <div style={{ marginBottom: '1rem' }}>
        {item.status === 'rated' && item.quick_rating ? (
          <StarDisplay rating={item.quick_rating} />
        ) : (
          <span style={{
            display: 'inline-block',
            padding: '0.2rem 0.5rem',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            border: '1px solid var(--color-charcoal-mid)',
            color: item.status === 'pending' ? 'var(--color-smoke)' : 'var(--color-terracotta)',
          }}>
            {STATUS_LABEL[item.status] ?? item.status}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <a
          href={`/account/journal/${nameToSlug(item.product_name)}`}
          style={{
            display: 'block', width: '100%', padding: '0.55rem',
            background: 'var(--color-terracotta)',
            color: 'var(--color-cream)',
            fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase', textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          {item.status === 'journaled' ? 'View Journal Entry' : 'Open Journal Entry'}
        </a>

        {confirming ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onRemove(item.id)}
              style={{ flex: 1, padding: '0.5rem', background: '#7A1A0A', border: 'none', color: 'var(--color-cream)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              Confirm Remove
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-smoke)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            style={{
              width: '100%', padding: '0.55rem',
              background: 'transparent',
              border: '1px solid var(--color-charcoal-mid)',
              color: 'var(--color-smoke)',
              fontSize: '0.72rem', letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-terracotta)'; e.currentTarget.style.color = 'var(--color-terracotta)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-charcoal-mid)'; e.currentTarget.style.color = 'var(--color-smoke)'; }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function CatalogTile({ group, onSelect }: { group: ProductGroup; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{ display: 'flex', flexDirection: 'column', background: 'var(--color-pitch)', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-charcoal-mid)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-pitch)')}
    >
      <div style={{ width: '100%', aspectRatio: '3/2', position: 'relative', background: 'var(--color-charcoal-mid)', overflow: 'hidden' }}>
        {group.imageUrl ? (
          <Image src={group.imageUrl} alt={group.name} fill className="object-contain" style={{ padding: '0.5rem' }} sizes="200px" />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: '0.4rem' }}>
            <span style={{ color: 'var(--color-charcoal-light)', fontSize: '0.6rem', letterSpacing: '0.08em' }}>No Image</span>
          </div>
        )}
      </div>
      <div style={{ padding: '0.65rem 0.75rem', flex: 1 }}>
        {group.brand && (
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            {group.brand}
          </div>
        )}
        <div style={{ color: 'var(--color-cream)', fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3 }}>{group.name}</div>
        <div style={{ color: 'var(--color-smoke)', fontSize: '0.65rem', marginTop: '0.2rem' }}>
          {group.variants.length} variant{group.variants.length !== 1 ? 's' : ''}
        </div>
      </div>
    </button>
  );
}
