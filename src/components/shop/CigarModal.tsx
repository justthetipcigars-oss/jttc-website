'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LightspeedProduct } from '@/lib/lightspeed';
import { nameToSlug } from '@/lib/slug';
import WishlistHeart from './WishlistHeart';
export type { ProductGroup, CigarGroup } from '@/lib/productGroups';
export { groupByName } from '@/lib/productGroups';
import type { ProductGroup } from '@/lib/productGroups';

function packRank(quantity: string): number {
  const q = quantity.toLowerCase();
  if (q.startsWith('box') || q.startsWith('case')) return 0;
  if (q.startsWith('bundle')) return 1;
  if (q.startsWith('pack')) return 2;
  return 3; // single or empty
}

function packLabel(quantity: string): string {
  return quantity || 'Single';
}

type TableRow = {
  variant: LightspeedProduct;
  showSize: boolean;
  sizeRowSpan: number;
};

function buildRows(variants: LightspeedProduct[]): TableRow[] {
  // Group by size, preserving order
  const sizeMap = new Map<string, LightspeedProduct[]>();
  for (const v of variants) {
    const key = v.size || '—';
    const list = sizeMap.get(key) ?? [];
    list.push(v);
    sizeMap.set(key, list);
  }
  // Sort packs within each size by Box→Bundle→Pack→Single
  for (const [key, list] of sizeMap) {
    sizeMap.set(key, list.sort((a, b) => packRank(a.quantity) - packRank(b.quantity)));
  }
  // Sort sizes alphabetically
  const sorted = [...sizeMap.entries()].sort(([a], [b]) => a.localeCompare(b));

  const rows: TableRow[] = [];
  for (const [, list] of sorted) {
    list.forEach((v, i) => {
      rows.push({ variant: v, showSize: i === 0, sizeRowSpan: list.length });
    });
  }
  return rows;
}

interface Props {
  group: ProductGroup;
  onClose: () => void;
  onAddToHumidor?: (variant: LightspeedProduct) => void;
}

export default function CigarModal({ group, onClose, onAddToHumidor }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const init: Record<string, number> = {};
    group.variants.forEach(v => { init[v.id] = 1; });
    setQuantities(init);
  }, [group]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  const rows = buildRows(group.variants);
  const hasSize = group.variants.some(v => v.size);

  const priceDisplay = group.minPrice === group.maxPrice
    ? `$${group.minPrice.toFixed(2)}`
    : `From $${group.minPrice.toFixed(2)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.82)', padding: '5vh 1rem 2rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full"
        style={{
          maxWidth: 820,
          background: 'var(--color-charcoal)',
          border: '1px solid var(--color-charcoal-mid)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center"
          style={{
            width: 32, height: 32,
            background: 'var(--color-charcoal-mid)',
            border: 'none',
            color: 'var(--color-smoke)',
            fontSize: '1.2rem',
            cursor: 'pointer',
          }}
          aria-label="Close"
        >×</button>

        {/* Header */}
        <div className="flex items-center gap-5 p-6" style={{ borderBottom: '1px solid var(--color-charcoal-mid)' }}>
          {group.imageUrl && (
            <div
              className="relative shrink-0"
              style={{ width: 88, height: 88, background: 'var(--color-charcoal-mid)' }}
            >
              <Image
                src={group.imageUrl}
                alt={group.name}
                fill
                className="object-contain p-1"
                sizes="88px"
              />
            </div>
          )}
          <div>
            {group.brand && (
              <div style={{
                color: 'var(--color-terracotta)',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '0.3rem',
              }}>
                {group.brand}
              </div>
            )}
            <h2 style={{ color: 'var(--color-cream)', fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.2 }}>
              {group.name}
            </h2>
            <div style={{ color: 'var(--color-amber)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.35rem' }}>
              {priceDisplay}
            </div>
            <Link
              href={`/account/ashtray/${nameToSlug(group.name)}?new=1`}
              onClick={onClose}
              style={{
                display: 'inline-block',
                marginTop: '0.65rem',
                padding: '0.4rem 0.85rem',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'transparent',
                color: 'var(--color-terracotta)',
                border: '1px solid var(--color-terracotta)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              + Add to My Ashtray
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-charcoal-mid)' }}>
                {hasSize && (
                  <th style={thStyle}>Size</th>
                )}
                <th style={thStyle}>Pack</th>
                <th style={thStyle}>Available Stock</th>
                <th style={thStyle}>Price</th>
                {!onAddToHumidor && <th style={thStyle}>Qty</th>}
                {onAddToHumidor
                  ? <th style={thStyle}>My Humidor</th>
                  : <><th style={thStyle}>Cart</th><th style={thStyle}>Wishlist</th></>
                }
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

                  {/* Pack */}
                  <td style={{ ...tdStyle, color: 'var(--color-smoke)' }}>
                    {packLabel(variant.quantity)}
                  </td>

                  {/* Available Stock */}
                  <td style={tdStyle}>
                    {variant.stockAmount === 0 ? (
                      <span style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: '#f87171',
                        background: 'rgba(248,113,113,0.1)',
                        border: '1px solid rgba(248,113,113,0.35)',
                      }}>
                        OOS
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        color: '#4ade80',
                        background: 'rgba(74,222,128,0.1)',
                        border: '1px solid rgba(74,222,128,0.3)',
                      }}>
                        {variant.stockAmount}
                      </span>
                    )}
                  </td>

                  {/* Price */}
                  <td style={{ ...tdStyle, color: 'var(--color-amber)', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                    ${variant.price.toFixed(2)}
                  </td>

                  {/* Qty — only shown in shop context */}
                  {!onAddToHumidor && (
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
                  )}

                  {onAddToHumidor ? (
                    /* Add to Humidor action */
                    <td style={tdStyle}>
                      <button
                        onClick={() => { onAddToHumidor(variant); onClose(); }}
                        style={{
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
                        }}
                      >
                        Add to My Humidor
                      </button>
                    </td>
                  ) : (
                    <>
                      {/* Cart – placeholder */}
                      <td style={tdStyle}>
                        <button style={{
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
                        }}>
                          + Cart
                        </button>
                      </td>

                      {/* Wishlist */}
                      <td style={tdStyle}>
                        <WishlistHeart
                          variant={{
                            id: variant.id,
                            name: variant.name,
                            brand: variant.brand,
                            size: variant.size,
                            imageUrl: variant.imageUrl,
                          }}
                        />
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <div style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid var(--color-charcoal-mid)',
          color: 'var(--color-charcoal-light)',
          fontSize: '0.7rem',
          letterSpacing: '0.05em',
        }}>
          Available in store · Just The Tip Cigars · (724) 957-9229
        </div>
      </div>
    </div>
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
