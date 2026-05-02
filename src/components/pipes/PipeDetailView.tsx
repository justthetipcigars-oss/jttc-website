'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ProductGroup } from '@/lib/productGroups';
import { nameToSlug } from '@/lib/slug';
import WishlistHeart from '@/components/shop/WishlistHeart';

type Props = {
  group: ProductGroup;
  inCollection: boolean;
};

export default function PipeDetailView({ group, inCollection }: Props) {
  const slug = nameToSlug(group.name);
  const firstVariant = group.variants[0];
  const images = [...new Set(group.variants.flatMap(v => v.allImages))];
  const fallbackImage = group.imageUrl;
  const gallery = images.length > 0 ? images : (fallbackImage ? [fallbackImage] : []);
  const [active, setActive] = useState(0);

  const description = group.variants.find(v => v.description)?.description || '';
  const priceDisplay = group.minPrice === group.maxPrice
    ? `$${group.minPrice.toFixed(2)}`
    : `From $${group.minPrice.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <div style={{ aspectRatio: '1 / 1', background: 'var(--color-charcoal-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '1rem' }}>
          {gallery.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gallery[active]} alt={group.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ color: 'var(--color-charcoal-light)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Photo Coming Soon</span>
          )}
        </div>
        {gallery.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {gallery.map((img, i) => (
              <button
                key={img}
                onClick={() => setActive(i)}
                style={{
                  width: 64, height: 64, padding: 4,
                  background: 'var(--color-charcoal-mid)',
                  border: i === active ? '2px solid var(--color-terracotta)' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {group.brand && (
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
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
          <div
            style={{ color: 'var(--color-smoke)', fontSize: '0.9rem', lineHeight: 1.7, marginTop: '0.5rem' }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.75rem' }}>
          <WishlistHeart
            variant={{
              id: firstVariant.id,
              name: group.name,
              brand: group.brand,
              size: firstVariant.size,
              imageUrl: group.imageUrl,
            }}
            size={36}
          />
          {inCollection ? (
            <div style={{ flex: 1, textAlign: 'center', padding: '0.7rem 1rem', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-smoke)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              In Your Pipe Rack
            </div>
          ) : (
            <Link
              href={`/account/pipes/collection/add?product_slug=${slug}`}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '0.7rem 1rem',
                background: 'var(--color-terracotta)',
                border: '1px solid var(--color-terracotta)',
                color: 'var(--color-cream)',
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              + Add to Pipe Rack
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
