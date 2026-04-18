'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LightspeedProduct } from '@/lib/lightspeed';
import { groupByName, ProductGroup } from '@/lib/productGroups';
import CigarModal from '@/components/shop/CigarModal';
import { nameToSlug } from '@/lib/slug';

type HumidorItem = {
  id: string;
  product_id: string;
  product_name: string;
  brand: string;
  size: string;
  image_url: string | null;
  quantity: number;
  added_at: string;
};

export default function HumidorClient({
  initialItems,
  products,
}: {
  initialItems: HumidorItem[];
  products: LightspeedProduct[];
}) {
  const [items, setItems] = useState<HumidorItem[]>(initialItems);
  const [showBrowse, setShowBrowse] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [openProduct, setOpenProduct] = useState<ProductGroup | null>(null);
  const router = useRouter();

  async function moveToAshtray(item: HumidorItem) {
    await removeFromHumidor(item);
    router.push(`/account/ashtray/${nameToSlug(item.product_name)}?new=1`);
  }

  // Build cigar groups from the full catalog (no stock filter — you can own anything)
  const cigarGroups = useMemo(() => {
    const cigars = products.filter(p => p.isCigar);
    return groupByName(cigars);
  }, [products]);

  const brands = useMemo(
    () => [...new Set(cigarGroups.map(g => g.brand).filter(Boolean))].sort(),
    [cigarGroups]
  );

  const filteredGroups = useMemo(() => {
    let groups = cigarGroups;
    if (selectedBrand) groups = groups.filter(g => g.brand === selectedBrand);
    if (search) {
      const q = search.toLowerCase();
      groups = groups.filter(
        g => g.name.toLowerCase().includes(q) || g.brand.toLowerCase().includes(q)
      );
    }
    return groups;
  }, [cigarGroups, selectedBrand, search]);

  async function addToHumidor(variant: LightspeedProduct) {
    const res = await fetch('/api/account/humidor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: variant.id,
        product_name: variant.name,
        brand: variant.brand,
        size: variant.size,
        image_url: variant.imageUrl,
      }),
    });
    const item = await res.json();
    if (!item || item.error || !item.id) {
      console.error('Humidor add failed:', item?.error);
      return;
    }
    setItems(prev => {
      const existing = prev.find(i => i.product_id === variant.id);
      if (existing) return prev.map(i => i.product_id === variant.id ? item : i);
      return [item, ...prev];
    });
  }

  async function updateQuantity(id: string, quantity: number) {
    const res = await fetch('/api/account/humidor', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity }),
    });
    const result = await res.json();
    if (result.deleted) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      setItems(prev => prev.map(i => i.id === id ? result : i));
    }
  }

  async function removeFromHumidor(item: HumidorItem) {
    await fetch('/api/account/humidor', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    });
    setItems(prev => prev.filter(i => i.id !== item.id));
  }

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
          {showBrowse ? '× Close Catalog' : '+ Add a Cigar'}
        </button>
      </div>

      {/* Catalog browse panel */}
      {showBrowse && (
        <div style={{ marginBottom: '3rem', background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '1.5rem' }}>

          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or brand..."
              style={{
                flex: 1,
                minWidth: 200,
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

          {/* Product grid */}
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

      {/* Humidor items */}
      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--color-charcoal-mid)' }}>
          <p style={{ color: 'var(--color-smoke)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Your humidor is empty. Browse the catalog above to add cigars.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {items.map(item => (
            <div
              key={item.id}
              style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '1.5rem' }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--color-cream)', fontSize: '0.95rem', lineHeight: 1.4, marginBottom: '0.25rem' }}>
                  {item.product_name}
                </div>
                <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>
                  {item.brand}{item.size ? ` · ${item.size}` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Qty</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{ width: 28, height: 28, background: 'var(--color-pitch)', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-cream)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >−</button>
                  <span style={{ color: 'var(--color-cream)', fontWeight: 600, minWidth: '1.5rem', textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{ width: 28, height: 28, background: 'var(--color-pitch)', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-cream)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                </div>
              </div>

              <button
                onClick={() => moveToAshtray(item)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  background: 'transparent',
                  border: '1px solid var(--color-charcoal-mid)',
                  color: 'var(--color-smoke)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-terracotta)'; e.currentTarget.style.color = 'var(--color-terracotta)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-charcoal-mid)'; e.currentTarget.style.color = 'var(--color-smoke)'; }}
              >
                Move to My Ashtray →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Product detail modal */}
      {openProduct && (
        <CigarModal
          group={openProduct}
          onClose={() => setOpenProduct(null)}
          onAddToHumidor={variant => {
            addToHumidor(variant);
            setOpenProduct(null);
          }}
        />
      )}
    </div>
  );
}

function CatalogTile({ group, onSelect }: { group: ProductGroup; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-pitch)',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        padding: 0,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-charcoal-mid)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-pitch)')}
    >
      {/* Image */}
      <div style={{ width: '100%', aspectRatio: '3/2', position: 'relative', background: 'var(--color-charcoal-mid)', overflow: 'hidden' }}>
        {group.imageUrl ? (
          <Image
            src={group.imageUrl}
            alt={group.name}
            fill
            className="object-contain"
            style={{ padding: '0.5rem' }}
            sizes="200px"
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: '0.4rem' }}>
            <span style={{ color: 'var(--color-charcoal-light)', fontSize: '0.6rem', letterSpacing: '0.08em' }}>No Image</span>
          </div>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: '0.65rem 0.75rem', flex: 1 }}>
        {group.brand && (
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            {group.brand}
          </div>
        )}
        <div style={{ color: 'var(--color-cream)', fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3 }}>
          {group.name}
        </div>
        <div style={{ color: 'var(--color-smoke)', fontSize: '0.65rem', marginTop: '0.2rem' }}>
          {group.variants.length} variant{group.variants.length !== 1 ? 's' : ''}
        </div>
      </div>
    </button>
  );
}
