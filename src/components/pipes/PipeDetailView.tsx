'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ProductGroup } from '@/lib/productGroups';
import type { PipeSpecs } from '@/lib/pipeSpecs';
import { nameToSlug } from '@/lib/slug';
import WishlistHeart from '@/components/shop/WishlistHeart';

type Props = {
  group: ProductGroup;
  specs: PipeSpecs;
  inCollection: boolean;
};

const SPEC_LABELS: Array<[keyof PipeSpecs, string]> = [
  ['shape', 'Shape'],
  ['finish', 'Finish'],
  ['material', 'Material'],
  ['country', 'Country'],
  ['length', 'Length'],
  ['weight', 'Weight'],
  ['bowl_height', 'Bowl Height'],
  ['chamber_depth', 'Chamber Depth'],
  ['chamber_diameter', 'Chamber Diameter'],
  ['outside_diameter', 'Outside Diameter'],
  ['stem_material', 'Stem Material'],
  ['filter', 'Filter'],
];

export default function PipeDetailView({ group, specs, inCollection }: Props) {
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

  const specRows = SPEC_LABELS.filter(([k]) => specs[k]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '3rem' }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {group.brand && (
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            {group.brand}
          </div>
        )}
        <h1 style={{ color: 'var(--color-cream)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 600, lineHeight: 1.2 }}>
          {group.name}
        </h1>
        <div style={{ color: 'var(--color-amber)', fontSize: '1.2rem', fontWeight: 700 }}>
          {priceDisplay}
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.5rem' }}>
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

        {specRows.length > 0 && (
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-charcoal-mid)', paddingTop: '1rem' }}>
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Specs
            </div>
            <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.4rem 1.25rem', margin: 0, fontSize: '0.85rem' }}>
              {specRows.map(([k, label]) => (
                <div key={k} style={{ display: 'contents' }}>
                  <dt style={{ color: 'var(--color-smoke)' }}>{label}</dt>
                  <dd style={{ color: 'var(--color-cream)', margin: 0 }}>{specs[k]}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {description && (
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-charcoal-mid)', paddingTop: '1rem' }}>
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Details
            </div>
            <div
              style={{ color: 'var(--color-smoke)', fontSize: '0.9rem', lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
