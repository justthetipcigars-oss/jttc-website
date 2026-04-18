'use client';

import { useState } from 'react';
import Link from 'next/link';
import { nameToSlug } from '@/lib/slug';

type WishlistItem = {
  id: string;
  product_id: string;
  product_name: string;
  brand: string | null;
  size: string | null;
  image_url: string | null;
  added_at: string;
};

type View = 'tile' | 'list';

export default function WishlistClient({ initialItems }: { initialItems: WishlistItem[] }) {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [view, setView] = useState<View>('tile');

  async function remove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
    await fetch('/api/account/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  }

  if (items.length === 0) {
    return (
      <div style={emptyStyle}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>♡</div>
        <p style={{ color: 'var(--color-cream-dark)', fontSize: '1rem', marginBottom: '0.5rem' }}>
          Your wishlist is empty.
        </p>
        <p style={{ color: 'var(--color-smoke)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Browse the shop and tap the heart on anything that catches your eye.
        </p>
        <Link href="/shop" style={ctaStyle}>Browse Shop</Link>
      </div>
    );
  }

  return (
    <>
      {/* View toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem', gap: '0.5rem' }}>
        <button
          onClick={() => setView('tile')}
          style={toggleBtnStyle(view === 'tile')}
          aria-pressed={view === 'tile'}
        >
          Tiles
        </button>
        <button
          onClick={() => setView('list')}
          style={toggleBtnStyle(view === 'list')}
          aria-pressed={view === 'list'}
        >
          List
        </button>
      </div>

      {view === 'tile' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map(item => <Tile key={item.id} item={item} onRemove={() => remove(item.id)} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--color-charcoal-mid)' }}>
          {items.map(item => <Row key={item.id} item={item} onRemove={() => remove(item.id)} />)}
        </div>
      )}
    </>
  );
}

function Tile({ item, onRemove }: { item: WishlistItem; onRemove: () => void }) {
  const slug = nameToSlug(item.product_name);
  return (
    <div style={tileStyle}>
      <Link href={`/shop/${slug}`} style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{ aspectRatio: '1 / 1', background: 'var(--color-charcoal-mid)', overflow: 'hidden' }}>
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-charcoal-light)', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
              No Photo
            </div>
          )}
        </div>
        <div style={{ padding: '0.75rem 0.85rem' }}>
          {item.brand && (
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              {item.brand}
            </div>
          )}
          <div style={{ color: 'var(--color-cream)', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.3, marginBottom: '0.25rem' }}>
            {item.product_name}
          </div>
          {item.size && (
            <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>{item.size}</div>
          )}
        </div>
      </Link>
      <button onClick={onRemove} style={removeBtnStyle} aria-label="Remove from wishlist">Remove</button>
    </div>
  );
}

function Row({ item, onRemove }: { item: WishlistItem; onRemove: () => void }) {
  const slug = nameToSlug(item.product_name);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--color-charcoal)' }}>
      <Link href={`/shop/${slug}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', flex: 1, minWidth: 0 }}>
        <div style={{ width: 56, height: 56, flexShrink: 0, background: 'var(--color-charcoal-mid)', overflow: 'hidden' }}>
          {item.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          {item.brand && (
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {item.brand}
            </div>
          )}
          <div style={{ color: 'var(--color-cream)', fontSize: '0.95rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.product_name}
          </div>
          {item.size && (
            <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>{item.size}</div>
          )}
        </div>
      </Link>
      <button onClick={onRemove} style={{ ...removeBtnStyle, position: 'static', padding: '0.4rem 0.85rem' }}>Remove</button>
    </div>
  );
}

const emptyStyle: React.CSSProperties = {
  background: 'var(--color-charcoal)',
  border: '1px dashed var(--color-charcoal-mid)',
  padding: '3rem 1.5rem',
  textAlign: 'center',
};

const ctaStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.75rem 2rem',
  background: 'var(--color-terracotta)',
  color: 'var(--color-cream)',
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: '0.8rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  textDecoration: 'none',
};

const tileStyle: React.CSSProperties = {
  position: 'relative',
  background: 'var(--color-charcoal)',
  border: '1px solid var(--color-charcoal-mid)',
};

const removeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: '0.5rem',
  right: '0.5rem',
  background: 'rgba(14,12,10,0.75)',
  border: '1px solid var(--color-charcoal-mid)',
  color: 'var(--color-cream-dark)',
  fontSize: '0.65rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '0.3rem 0.6rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

function toggleBtnStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? 'var(--color-terracotta)' : 'transparent',
    border: '1px solid ' + (active ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)'),
    color: active ? 'var(--color-cream)' : 'var(--color-cream-dark)',
    padding: '0.4rem 0.9rem',
    fontSize: '0.7rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}
