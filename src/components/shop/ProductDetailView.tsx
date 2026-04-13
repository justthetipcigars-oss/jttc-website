'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { LightspeedProduct } from '@/lib/lightspeed';
import { ProductGroup } from '@/lib/productGroups';

/* ── shared table helpers (duplicated from CigarModal to keep files independent) ── */
function packRank(quantity: string): number {
  const q = quantity.toLowerCase();
  if (q.startsWith('box') || q.startsWith('case')) return 0;
  if (q.startsWith('bundle')) return 1;
  if (q.startsWith('pack')) return 2;
  return 3;
}

type TableRow = {
  variant: LightspeedProduct;
  showSize: boolean;
  sizeRowSpan: number;
};

function buildRows(variants: LightspeedProduct[]): TableRow[] {
  const sizeMap = new Map<string, LightspeedProduct[]>();
  for (const v of variants) {
    const key = v.size || '—';
    const list = sizeMap.get(key) ?? [];
    list.push(v);
    sizeMap.set(key, list);
  }
  for (const [key, list] of sizeMap) {
    sizeMap.set(key, list.sort((a, b) => packRank(a.quantity) - packRank(b.quantity)));
  }
  const sorted = [...sizeMap.entries()].sort(([a], [b]) => a.localeCompare(b));
  const rows: TableRow[] = [];
  for (const [, list] of sorted) {
    list.forEach((v, i) => {
      rows.push({ variant: v, showSize: i === 0, sizeRowSpan: list.length });
    });
  }
  return rows;
}

/* ── Image gallery ── */
function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return (
      <div
        className="w-full aspect-square flex items-center justify-center"
        style={{ background: 'var(--color-charcoal-mid)' }}
      >
        <span style={{ color: 'var(--color-charcoal-light)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          Photo Coming Soon
        </span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="relative w-full aspect-square"
        style={{ background: 'var(--color-charcoal-mid)' }}
      >
        <Image
          src={images[active]}
          alt={name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: 60, height: 60,
                position: 'relative',
                padding: 0,
                background: 'var(--color-charcoal-mid)',
                border: i === active
                  ? '2px solid var(--color-terracotta)'
                  : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              <Image src={img} alt={`View ${i + 1}`} fill className="object-contain p-1" sizes="60px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main detail view ── */
interface Props {
  group: ProductGroup;
}

export default function ProductDetailView({ group }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const init: Record<string, number> = {};
    group.variants.forEach(v => { init[v.id] = 1; });
    setQuantities(init);
  }, [group]);

  const rows = buildRows(group.variants);
  const hasSize = group.variants.some(v => v.size);

  // Collect all unique images across all variants
  const allImages = [...new Set(group.variants.flatMap(v => v.allImages))];

  // Use the first non-empty description across variants
  const description = group.variants.find(v => v.description)?.description || '';

  const priceDisplay = group.minPrice === group.maxPrice
    ? `$${group.minPrice.toFixed(2)}`
    : `From $${group.minPrice.toFixed(2)}`;

  return (
    <>
      {/* Product header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Gallery */}
        <Gallery images={allImages} name={group.name} />

        {/* Info */}
        <div className="flex flex-col gap-4">
          {group.brand && (
            <div style={{
              color: 'var(--color-terracotta)',
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
            }}>
              {group.brand}
            </div>
          )}
          <h1 style={{ color: 'var(--color-cream)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 600, lineHeight: 1.2 }}>
            {group.name}
          </h1>
          <div style={{ color: 'var(--color-amber)', fontSize: '1.2rem', fontWeight: 700 }}>
            {priceDisplay}
          </div>
          {description && (
            <p style={{ color: 'var(--color-smoke)', fontSize: '0.9rem', lineHeight: 1.7, marginTop: '0.5rem' }}>
              {description}
            </p>
          )}
          <div
            className="mt-auto pt-4"
            style={{ borderTop: '1px solid var(--color-charcoal-mid)', color: 'var(--color-charcoal-light)', fontSize: '0.75rem' }}
          >
            Available in store · Just The Tip Cigars · (724) 957-9229
          </div>
        </div>
      </div>

      {/* Variant table */}
      <div style={{ borderTop: '1px solid var(--color-charcoal-mid)', paddingTop: '2rem', marginBottom: '4rem' }}>
        <div style={{
          color: 'var(--color-terracotta)',
          fontSize: '0.65rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          marginBottom: '1.25rem',
        }}>
          Available Options
        </div>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-charcoal-mid)' }}>
                {hasSize && <th style={thStyle}>Size</th>}
                <th style={thStyle}>Pack</th>
                <th style={thStyle}>Available Stock</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>Cart</th>
                <th style={thStyle}>Wishlist</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ variant, showSize, sizeRowSpan }, i) => (
                <tr
                  key={variant.id}
                  style={{
                    borderBottom: '1px solid var(--color-charcoal-mid)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.018)',
                  }}
                >
                  {hasSize && showSize && (
                    <td
                      rowSpan={sizeRowSpan}
                      style={{
                        ...tdStyle,
                        color: 'var(--color-cream)',
                        fontWeight: 500,
                        verticalAlign: 'top',
                        paddingTop: '0.8rem',
                        borderRight: '1px solid var(--color-charcoal-mid)',
                        minWidth: 130,
                      }}
                    >
                      {variant.size || '—'}
                    </td>
                  )}
                  <td style={{ ...tdStyle, color: 'var(--color-smoke)' }}>
                    {variant.quantity || 'Single'}
                  </td>
                  <td style={tdStyle}>
                    {variant.stockAmount === 0 ? (
                      <span style={oosStyle}>OOS</span>
                    ) : (
                      <span style={inStockStyle}>{variant.stockAmount}</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--color-amber)', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                    ${variant.price.toFixed(2)}
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={quantities[variant.id] ?? 1}
                      onChange={e => setQuantities(prev => ({
                        ...prev,
                        [variant.id]: Math.max(1, parseInt(e.target.value) || 1),
                      }))}
                      style={{
                        width: 52,
                        padding: '0.3rem 0.4rem',
                        textAlign: 'center',
                        background: 'var(--color-charcoal-mid)',
                        border: '1px solid var(--color-charcoal-light)',
                        color: 'var(--color-cream)',
                        fontSize: '0.85rem',
                      }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <button style={cartBtnStyle}>+ Cart</button>
                  </td>
                  <td style={tdStyle}>
                    <button aria-label="Add to wishlist" style={wishlistBtnStyle}>♡</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Similar Products — placeholder */}
      <div style={{ borderTop: '1px solid var(--color-charcoal-mid)', paddingTop: '2rem' }}>
        <div style={{
          color: 'var(--color-terracotta)',
          fontSize: '0.65rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}>
          Similar Products
        </div>
        <div
          className="py-12 text-center"
          style={{
            border: '1px dashed var(--color-charcoal-mid)',
            color: 'var(--color-charcoal-light)',
            fontSize: '0.8rem',
            letterSpacing: '0.05em',
          }}
        >
          Coming soon
        </div>
      </div>
    </>
  );
}

const thStyle: React.CSSProperties = {
  padding: '0.6rem 1rem',
  textAlign: 'left',
  fontSize: '0.65rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  fontWeight: 700,
  color: 'var(--color-terracotta)',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '0.65rem 1rem',
  fontSize: '0.82rem',
  verticalAlign: 'middle',
};

const inStockStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.15rem 0.5rem',
  fontSize: '0.7rem',
  fontWeight: 700,
  color: '#4ade80',
  background: 'rgba(74,222,128,0.1)',
  border: '1px solid rgba(74,222,128,0.3)',
};

const oosStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.15rem 0.5rem',
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: '#f87171',
  background: 'rgba(248,113,113,0.1)',
  border: '1px solid rgba(248,113,113,0.35)',
};

const cartBtnStyle: React.CSSProperties = {
  padding: '0.35rem 0.7rem',
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  background: 'var(--color-terracotta)',
  color: 'var(--color-cream)',
  border: 'none',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const wishlistBtnStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: '1px solid var(--color-charcoal-mid)',
  color: 'var(--color-smoke)',
  fontSize: '1rem',
  cursor: 'pointer',
};
