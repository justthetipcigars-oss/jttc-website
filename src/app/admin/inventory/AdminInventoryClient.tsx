'use client';

import { Fragment, useMemo, useState } from 'react';

type Product = {
  id: string;
  name: string;
  variantName: string;
  brand: string;
  sku: string;
  stockAmount: number;
  category: string;
  imageUrl: string | null;
};

const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--color-pitch)',
  border: '1px solid var(--color-charcoal-mid)',
  color: 'var(--color-cream)',
  padding: '0.6rem 0.85rem',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'inherit',
};

const lbl: React.CSSProperties = {
  display: 'block',
  color: 'var(--color-smoke)',
  fontSize: '0.68rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  marginBottom: '0.3rem',
};

export default function AdminInventoryClient({ products }: { products: Product[] }) {
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.brand));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const [brand, setBrand]                 = useState<string>('');
  const [search, setSearch]               = useState('');
  const [expectedOnly, setExpectedOnly]   = useState(false);
  const [edits, setEdits]                 = useState<Record<string, string>>({});
  const [saving, setSaving]               = useState(false);
  const [msg, setMsg]                     = useState('');
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [productState, setProductState]   = useState<Product[]>(products);
  const [expanded, setExpanded]           = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    if (!brand) return [];
    const q = search.trim().toLowerCase();
    return productState
      .filter(p => p.brand === brand)
      .filter(p => !expectedOnly || p.stockAmount > 0)
      .filter(p => {
        if (!q) return true;
        return p.sku.toLowerCase().includes(q) ||
               p.name.toLowerCase().includes(q) ||
               (p.variantName || '').toLowerCase().includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name) || a.variantName.localeCompare(b.variantName));
  }, [productState, brand, search, expectedOnly]);

  // Grouped view (used when expectedOnly is OFF) — collapses variants under a single product name
  const groups = useMemo(() => {
    if (expectedOnly) return [];
    const byName = new Map<string, Product[]>();
    for (const p of visible) {
      const arr = byName.get(p.name) ?? [];
      arr.push(p);
      byName.set(p.name, arr);
    }
    return Array.from(byName.entries())
      .map(([name, variants]) => ({
        name,
        variants: variants.sort((a, b) => a.variantName.localeCompare(b.variantName)),
        totalStock: variants.reduce((s, v) => s + v.stockAmount, 0),
        imageUrl: variants.find(v => v.imageUrl)?.imageUrl ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [visible, expectedOnly]);

  function toggleGroup(name: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }

  const pendingChanges = useMemo(() => {
    const list: Array<{ productId: string; sku: string; name: string; oldAmount: number; newAmount: number }> = [];
    for (const [productId, raw] of Object.entries(edits)) {
      const p = productState.find(x => x.id === productId);
      if (!p) continue;
      if (raw.trim() === '') continue;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) continue;
      const newAmount = Math.floor(n);
      if (newAmount === p.stockAmount) continue;
      list.push({
        productId: p.id,
        sku: p.sku,
        name: `${p.name}${p.variantName ? ' — ' + p.variantName : ''}`,
        oldAmount: p.stockAmount,
        newAmount,
      });
    }
    return list;
  }, [edits, productState]);

  function setEdit(id: string, value: string) {
    setEdits(prev => ({ ...prev, [id]: value }));
  }

  function clearEditsForBrand() {
    if (!brand) return;
    const ids = new Set(productState.filter(p => p.brand === brand).map(p => p.id));
    setEdits(prev => {
      const next: Record<string, string> = {};
      for (const k of Object.keys(prev)) if (!ids.has(k)) next[k] = prev[k];
      return next;
    });
  }

  function changeBrand(b: string) {
    if (pendingChanges.length > 0 && !confirm('You have unsaved changes for this brand. Discard them?')) return;
    clearEditsForBrand();
    setBrand(b);
    setSearch('');
    setMsg('');
  }

  async function handleSave() {
    if (pendingChanges.length === 0) return;
    setSaving(true); setMsg('');
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, changes: pendingChanges }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setMsg(`Error: ${json.error || res.status}`);
        setSaving(false);
        setConfirmOpen(false);
        return;
      }

      // Update local stock to reflect the committed values
      const committedIds = new Set(pendingChanges.map(c => c.productId));
      setProductState(prev =>
        prev.map(p =>
          committedIds.has(p.id)
            ? { ...p, stockAmount: pendingChanges.find(c => c.productId === p.id)!.newAmount }
            : p,
        ),
      );
      clearEditsForBrand();

      const failNote = json.failures?.length ? ` (${json.failures.length} failed)` : '';
      setMsg(`Committed ${json.committed} change${json.committed === 1 ? '' : 's'} to Lightspeed${failNote}. Consignment ${json.consignmentId.slice(0, 8)}…`);
    } catch (err) {
      setMsg(`Error: ${(err as Error).message}`);
    } finally {
      setSaving(false);
      setConfirmOpen(false);
    }
  }

  async function handleSignOut() {
    const { createClient } = await import('@/lib/supabase/client');
    await createClient().auth.signOut();
    window.location.href = '/admin/login';
  }

  const brandTotal = brand ? productState.filter(p => p.brand === brand).length : 0;
  const brandInStock = brand ? productState.filter(p => p.brand === brand && p.stockAmount > 0).length : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Admin</div>
          <h1 style={{ color: 'var(--color-cream)', fontSize: '1.6rem', fontWeight: 600 }}>Inventory</h1>
          <div style={{ color: 'var(--color-smoke)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
            Pick a brand, edit counts, save. Each save creates one Lightspeed STOCKTAKE consignment with a full audit trail.
          </div>
        </div>
        <button
          onClick={handleSignOut}
          style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-smoke)', fontSize: '0.72rem', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Sign Out
        </button>
      </div>

      {msg && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(196,98,45,0.12)', border: '1px solid rgba(196,98,45,0.3)', color: 'var(--color-terracotta)', fontSize: '0.82rem' }}>
          {msg}
        </div>
      )}

      {/* Controls */}
      <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '1.25rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
        <div>
          <label style={lbl}>Brand</label>
          <select
            style={{ ...inp, cursor: 'pointer' }}
            value={brand}
            onChange={e => changeBrand(e.target.value)}
          >
            <option value="">— Select brand ({brands.length}) —</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Search SKU or Name</label>
          <input
            style={inp}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={brand ? 'Type to filter…' : 'Pick a brand first'}
            disabled={!brand}
          />
        </div>
        <button
          type="button"
          onClick={() => setExpectedOnly(v => !v)}
          disabled={!brand}
          style={{
            padding: '0.6rem 1.2rem',
            background: expectedOnly ? 'var(--color-terracotta)' : 'transparent',
            color: expectedOnly ? 'var(--color-cream)' : 'var(--color-cream-dark)',
            border: '1px solid',
            borderColor: expectedOnly ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)',
            fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
            cursor: brand ? 'pointer' : 'not-allowed',
            opacity: brand ? 1 : 0.5,
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          Expected Only
        </button>
      </div>

      {brand && (
        <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
          {visible.length} of {brandTotal} shown · {brandInStock} in stock · {pendingChanges.length} pending edit{pendingChanges.length === 1 ? '' : 's'}
        </div>
      )}

      {/* Table */}
      {brand ? (
        <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', overflowX: 'auto' }}>
          {visible.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-smoke)', fontSize: '0.85rem' }}>
              No matches.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-charcoal-mid)' }}>
                  <th style={th}>Product</th>
                  <th style={th}>SKU</th>
                  <th style={{ ...th, textAlign: 'right', width: 100 }}>Current</th>
                  <th style={{ ...th, textAlign: 'right', width: 130 }}>New</th>
                </tr>
              </thead>
              <tbody>
                {expectedOnly
                  ? visible.map(p => renderVariantRow(p, edits, setEdit))
                  : groups.map(g => {
                      const isOpen = expanded.has(g.name);
                      const groupPending = g.variants.filter(v => {
                        const raw = edits[v.id] ?? '';
                        if (raw.trim() === '') return false;
                        const n = Number(raw);
                        return Number.isFinite(n) && n >= 0 && Math.floor(n) !== v.stockAmount;
                      }).length;
                      return (
                        <Fragment key={g.name}>
                          <tr
                            onClick={() => toggleGroup(g.name)}
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: isOpen ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                          >
                            <td style={td}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', width: 12, flexShrink: 0 }}>
                                  {isOpen ? '▾' : '▸'}
                                </div>
                                <div style={{ width: 44, height: 44, flexShrink: 0, background: 'var(--color-pitch)', border: '1px solid var(--color-charcoal-mid)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {g.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={g.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                  ) : (
                                    <span style={{ color: 'var(--color-smoke)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>—</span>
                                  )}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ color: 'var(--color-cream)', fontWeight: 500 }}>{g.name}</div>
                                  <div style={{ color: 'var(--color-smoke)', fontSize: '0.72rem', marginTop: 2 }}>
                                    {g.variants.length} variant{g.variants.length === 1 ? '' : 's'}
                                    {groupPending > 0 && <span style={{ color: 'var(--color-terracotta)', marginLeft: '0.5rem' }}>· {groupPending} pending</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ ...td, color: 'var(--color-smoke)', fontSize: '0.72rem' }}>—</td>
                            <td style={{ ...td, textAlign: 'right', color: g.totalStock === 0 ? 'var(--color-smoke)' : 'var(--color-cream)' }}>
                              {g.totalStock}
                            </td>
                            <td style={{ ...td, textAlign: 'right', color: 'var(--color-smoke)', fontSize: '0.72rem' }}>
                              {isOpen ? 'Editing' : 'Click to edit'}
                            </td>
                          </tr>
                          {isOpen && g.variants.map(v => renderVariantRow(v, edits, setEdit, true))}
                        </Fragment>
                      );
                    })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-cream-dark)', fontSize: '0.95rem' }}>
            Select a brand above to begin.
          </div>
        </div>
      )}

      {/* Save bar */}
      {brand && pendingChanges.length > 0 && (
        <div style={{ position: 'sticky', bottom: '1rem', marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'var(--color-charcoal)', border: '1px solid var(--color-terracotta)', padding: '0.85rem 1.25rem' }}>
          <div style={{ color: 'var(--color-cream)', fontSize: '0.85rem', flex: 1 }}>
            <strong>{pendingChanges.length}</strong> pending change{pendingChanges.length === 1 ? '' : 's'} for <strong>{brand}</strong>
          </div>
          <button
            onClick={clearEditsForBrand}
            disabled={saving}
            style={{ background: 'none', border: 'none', color: 'var(--color-smoke)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', padding: '0.5rem 0.75rem' }}
          >
            Discard
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={saving}
            style={{ padding: '0.65rem 1.5rem', background: 'var(--color-terracotta)', color: 'var(--color-cream)', border: 'none', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit' }}
          >
            {saving ? 'Saving…' : 'Review & Save'}
          </button>
        </div>
      )}

      {/* Confirm modal */}
      {confirmOpen && (
        <div
          onClick={() => !saving && setConfirmOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '1.5rem', maxWidth: 560, width: '100%', maxHeight: '80vh', overflow: 'auto' }}
          >
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Confirm Stock Update
            </div>
            <div style={{ color: 'var(--color-cream)', fontSize: '1rem', marginBottom: '1rem' }}>
              Commit {pendingChanges.length} change{pendingChanges.length === 1 ? '' : 's'} for <strong>{brand}</strong>?
            </div>
            <div style={{ background: 'var(--color-pitch)', border: '1px solid var(--color-charcoal-mid)', padding: '0.5rem', marginBottom: '1rem', maxHeight: 280, overflow: 'auto' }}>
              {pendingChanges.map(c => (
                <div key={c.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--color-cream-dark)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  <span style={{ color: 'var(--color-smoke)', marginLeft: '1rem', fontFamily: 'monospace' }}>
                    {c.oldAmount} → <span style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}>{c.newAmount}</span>
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={saving}
                style={{ background: 'none', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-cream-dark)', padding: '0.6rem 1.25rem', fontSize: '0.75rem', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '0.6rem 1.5rem', background: 'var(--color-terracotta)', color: 'var(--color-cream)', border: 'none', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit' }}
              >
                {saving ? 'Saving…' : 'Confirm & Commit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.65rem 1rem',
  color: 'var(--color-smoke)',
  fontSize: '0.65rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  fontWeight: 500,
};

const td: React.CSSProperties = {
  padding: '0.65rem 1rem',
  verticalAlign: 'middle',
};

function renderVariantRow(
  p: Product,
  edits: Record<string, string>,
  setEdit: (id: string, value: string) => void,
  nested = false,
) {
  const editVal = edits[p.id] ?? '';
  const parsed = editVal === '' ? null : Number(editVal);
  const isPending = parsed !== null && Number.isFinite(parsed) && parsed >= 0 && Math.floor(parsed) !== p.stockAmount;
  return (
    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: nested ? 'rgba(0,0,0,0.18)' : 'transparent' }}>
      <td style={{ ...td, paddingLeft: nested ? '4rem' : td.padding }}>
        {nested ? (
          <div style={{ color: 'var(--color-cream-dark)', fontSize: '0.85rem' }}>
            {p.variantName || p.name}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 44, height: 44, flexShrink: 0, background: 'var(--color-pitch)', border: '1px solid var(--color-charcoal-mid)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <span style={{ color: 'var(--color-smoke)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>—</span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: 'var(--color-cream)', fontWeight: 500 }}>{p.name}</div>
              {p.variantName && (
                <div style={{ color: 'var(--color-smoke)', fontSize: '0.72rem', marginTop: 2 }}>{p.variantName}</div>
              )}
            </div>
          </div>
        )}
      </td>
      <td style={{ ...td, color: 'var(--color-smoke)', fontFamily: 'monospace', fontSize: '0.78rem' }}>{p.sku || '—'}</td>
      <td style={{ ...td, textAlign: 'right', color: p.stockAmount === 0 ? 'var(--color-smoke)' : 'var(--color-cream)' }}>
        {p.stockAmount}
      </td>
      <td style={{ ...td, textAlign: 'right' }}>
        <input
          type="number"
          min={0}
          step={1}
          value={editVal}
          onChange={e => setEdit(p.id, e.target.value)}
          placeholder="—"
          style={{
            ...inp,
            width: 100,
            textAlign: 'right',
            padding: '0.4rem 0.6rem',
            borderColor: isPending ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)',
          }}
        />
      </td>
    </tr>
  );
}
