'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { LightspeedProduct } from '@/lib/lightspeed';

export type GroupedSwag = {
  name: string;
  typeName: string;
  imageUrl: string | null;
  allImages: string[];
  minPrice: number;
  maxPrice: number;
  variants: LightspeedProduct[];
  optionNames: string[]; // e.g. ['Size', 'Shirt Color', 'Logo Color']
};

export function groupSwagProducts(products: LightspeedProduct[]): GroupedSwag[] {
  const map = new Map<string, LightspeedProduct[]>();
  for (const p of products) {
    const list = map.get(p.name) ?? [];
    list.push(p);
    map.set(p.name, list);
  }

  return Array.from(map.entries()).map(([name, variants]) => {
    const prices = variants.map(v => v.price);
    const imageUrl = variants.find(v => v.imageUrl)?.imageUrl ?? null;
    const allImages = [...new Set(variants.flatMap(v => v.allImages))];
    const optionNames = variants[0]?.variantOptions.map(o => o.name) ?? [];
    const typeName = variants[0]?.variantOptions.find(o => ['Shirt Color', 'Hat Color'].includes(o.name))
      ? variants[0].variantOptions.find(o => ['Shirt Color', 'Hat Color'].includes(o.name))?.name?.replace(' Color', '') + ' options'
      : '';

    return {
      name,
      typeName: variants[0]?.size || '',
      imageUrl,
      allImages,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      variants,
      optionNames,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

interface SwagModalProps {
  group: GroupedSwag;
  onClose: () => void;
}

const SIZE_ORDER = ['XS', 'S', 'S/M', 'M', 'L/XL', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', 'One Size'];

function sortSizes(sizes: string[]) {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default function SwagModal({ group, onClose }: SwagModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState(0);

  // Init defaults from first variant
  useEffect(() => {
    const defaults: Record<string, string> = {};
    group.optionNames.forEach(name => {
      // Pick first available value for each option
      const values = [...new Set(group.variants.map(v =>
        v.variantOptions.find(o => o.name === name)?.value ?? ''
      ))].filter(Boolean);
      if (values.length > 0) defaults[name] = values[0];
    });
    setSelectedOptions(defaults);
    setActiveImage(0);
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

  // Find matching variant for current selections
  const matchedVariant = group.variants.find(v =>
    group.optionNames.every(name => {
      const val = v.variantOptions.find(o => o.name === name)?.value;
      return !selectedOptions[name] || val === selectedOptions[name];
    })
  );

  const price = matchedVariant?.price ?? group.minPrice;
  const images = group.allImages.length > 0 ? group.allImages : (group.imageUrl ? [group.imageUrl] : []);

  // Get unique values for each option, filtered by compatible selections
  function getValuesForOption(optionName: string): { value: string; available: boolean }[] {
    const otherSelected = { ...selectedOptions };
    delete otherSelected[optionName];

    const allValues = [...new Set(group.variants.map(v =>
      v.variantOptions.find(o => o.name === optionName)?.value ?? ''
    ))].filter(Boolean);

    const sortedValues = optionName === 'Size' ? sortSizes(allValues) : allValues;

    return sortedValues.map(value => {
      const available = group.variants.some(v => {
        const matchesThis = v.variantOptions.find(o => o.name === optionName)?.value === value;
        const matchesOthers = Object.entries(otherSelected).every(([k, sel]) =>
          !sel || v.variantOptions.find(o => o.name === k)?.value === sel
        );
        return matchesThis && matchesOthers;
      });
      return { value, available };
    });
  }

  const priceDisplay = group.minPrice === group.maxPrice
    ? `$${group.minPrice.toFixed(2)}`
    : `$${group.minPrice.toFixed(2)} – $${group.maxPrice.toFixed(2)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8"
          style={{ color: 'var(--color-smoke)', fontSize: '1.25rem', background: 'var(--color-charcoal-mid)', border: 'none', cursor: 'pointer' }}
          aria-label="Close"
        >
          ×
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Image panel */}
          <div className="sm:w-1/2 shrink-0">
            <div className="aspect-square relative" style={{ background: 'var(--color-charcoal-mid)' }}>
              {images.length > 0 ? (
                <Image
                  src={images[activeImage] ?? images[0]}
                  alt={group.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{ color: 'var(--color-charcoal-light)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                    Photo Coming Soon
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-1 p-2" style={{ background: 'var(--color-charcoal-mid)' }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className="relative shrink-0"
                    style={{
                      width: 56, height: 56,
                      border: i === activeImage ? '2px solid var(--color-terracotta)' : '2px solid transparent',
                      background: 'var(--color-charcoal)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill className="object-contain p-1" sizes="56px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details panel */}
          <div className="flex-1 p-6 flex flex-col gap-5">
            <div>
              <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                JTTC Swag
              </div>
              <h2 style={{ color: 'var(--color-cream)', fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.2 }}>
                {group.name}
              </h2>
              <div style={{ color: 'var(--color-amber)', fontSize: '1.1rem', fontWeight: 600, marginTop: '0.5rem' }}>
                {matchedVariant ? `$${matchedVariant.price.toFixed(2)}` : priceDisplay}
              </div>
            </div>

            {/* Option selectors */}
            {group.optionNames.map(optionName => {
              const values = getValuesForOption(optionName);
              if (values.length <= 1) return null;
              return (
                <div key={optionName}>
                  <div style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    {optionName}: <span style={{ color: 'var(--color-cream)' }}>{selectedOptions[optionName] || '—'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {values.map(({ value, available }) => (
                      <button
                        key={value}
                        onClick={() => available && setSelectedOptions(prev => ({ ...prev, [optionName]: value }))}
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          letterSpacing: '0.05em',
                          fontWeight: 600,
                          border: selectedOptions[optionName] === value
                            ? '1px solid var(--color-terracotta)'
                            : '1px solid var(--color-charcoal-mid)',
                          background: selectedOptions[optionName] === value
                            ? 'rgba(196,98,45,0.15)'
                            : 'transparent',
                          color: !available
                            ? 'var(--color-charcoal-light)'
                            : selectedOptions[optionName] === value
                              ? 'var(--color-terracotta)'
                              : 'var(--color-smoke)',
                          cursor: available ? 'pointer' : 'not-allowed',
                          textDecoration: !available ? 'line-through' : 'none',
                        }}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* In-store note */}
            <div
              className="mt-auto pt-4"
              style={{ borderTop: '1px solid var(--color-charcoal-mid)', color: 'var(--color-smoke)', fontSize: '0.75rem', lineHeight: 1.6 }}
            >
              Available in store at Just The Tip Cigars.
              <br />
              <span style={{ color: 'var(--color-charcoal-light)' }}>(724) 957-9229</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
