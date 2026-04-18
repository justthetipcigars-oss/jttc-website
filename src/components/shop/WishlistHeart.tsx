'use client';

import { useEffect, useState } from 'react';

type Variant = {
  id: string;
  name: string;
  brand?: string | null;
  size?: string | null;
  imageUrl?: string | null;
};

// Shared across all heart instances so one GET covers the whole page.
let cache: Set<string> | null = null;
let inflight: Promise<Set<string>> | null = null;
const subs = new Set<() => void>();

function notify() { subs.forEach(fn => fn()); }

async function loadIds(): Promise<Set<string>> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch('/api/account/wishlist', { cache: 'no-store' })
    .then(r => (r.ok ? r.json() : []))
    .then((items: Array<{ product_id: string }>) => {
      cache = new Set(items.map(i => i.product_id));
      notify();
      return cache;
    })
    .catch(() => {
      cache = new Set();
      return cache;
    });
  return inflight;
}

export default function WishlistHeart({
  variant,
  size = 34,
}: {
  variant: Variant;
  size?: number;
}) {
  const [, setTick] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sub = () => setTick(t => t + 1);
    subs.add(sub);
    loadIds().then(sub);
    return () => { subs.delete(sub); };
  }, []);

  const hearted = cache?.has(variant.id) ?? false;

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);

    // Optimistic flip
    if (cache) {
      if (hearted) cache.delete(variant.id); else cache.add(variant.id);
      notify();
    }

    try {
      const res = await fetch('/api/account/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: variant.id,
          product_name: variant.name,
          brand: variant.brand ?? null,
          size: variant.size ?? null,
          image_url: variant.imageUrl ?? null,
        }),
      });
      if (res.status === 401) {
        window.location.href = '/account/login';
        return;
      }
      const data = await res.json();
      if (cache) {
        if (data.hearted) cache.add(variant.id); else cache.delete(variant.id);
        notify();
      }
    } catch {
      // Roll back optimistic flip on network failure
      if (cache) {
        if (hearted) cache.add(variant.id); else cache.delete(variant.id);
        notify();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={hearted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={hearted}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: `1px solid ${hearted ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)'}`,
        color: hearted ? 'var(--color-terracotta)' : 'var(--color-smoke)',
        fontSize: '1rem',
        cursor: busy ? 'wait' : 'pointer',
        fontFamily: 'inherit',
        transition: 'color 120ms, border-color 120ms',
      }}
    >
      {hearted ? '♥' : '♡'}
    </button>
  );
}
