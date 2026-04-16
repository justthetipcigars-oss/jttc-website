'use client';

import { useState, useRef } from 'react';

const FLAVOR_CATEGORIES = [
  { label: 'Earth & Wood',    tags: ['Leather', 'Cedar', 'Oak', 'Earth', 'Hay', 'Tobacco'] },
  { label: 'Spice',           tags: ['Black Pepper', 'White Pepper', 'Cinnamon', 'Nutmeg', 'Clove'] },
  { label: 'Sweet',           tags: ['Chocolate', 'Dark Chocolate', 'Coffee', 'Espresso', 'Vanilla', 'Caramel', 'Honey', 'Molasses'] },
  { label: 'Fruit',           tags: ['Citrus', 'Cherry', 'Fig', 'Raisin', 'Dried Fruit', 'Plum'] },
  { label: 'Floral & Herbal', tags: ['Floral', 'Grass', 'Herbal', 'Mint', 'Tea'] },
  { label: 'Nut & Cream',     tags: ['Almond', 'Walnut', 'Peanut', 'Cream', 'Butter', 'Toast', 'Bread'] },
];

const METER_LABELS = ['Very Mild', 'Mild', 'Medium', 'Med-Full', 'Full'];

type JournalEntry = Record<string, unknown> & {
  id: string;
  product_id: string;
  cigar_name: string;
  brand: string;
  size: string;
  wrapper: string;
  binder: string;
  filler: string;
  date_smoked: string | null;
  body: number | null;
  flavor_intensity: number | null;
  strength: number | null;
  flavor_tags: string[] | null;
  notes: string | null;
  appearance_rating: number | null;
  value_rating: number | null;
  flavor_rating: number | null;
  overall_rating: number | null;
  band_photo_url: string | null;
  would_try_again: boolean | null;
};

type Prefill = {
  product_id: string;
  cigar_name: string;
  brand: string;
  size: string;
  wrapper: string;
  binder: string;
  filler: string;
};

type Revision = {
  id: string;
  saved_at: string;
  snapshot: Record<string, unknown>;
};

const sectionHead: React.CSSProperties = {
  color: 'var(--color-terracotta)',
  fontSize: '0.68rem',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  marginBottom: '1.25rem',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid var(--color-charcoal-mid)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: 'var(--color-smoke)',
  fontSize: '0.72rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  marginBottom: '0.4rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-charcoal)',
  border: '1px solid var(--color-charcoal-mid)',
  color: 'var(--color-cream)',
  padding: '0.65rem 0.85rem',
  fontSize: '0.9rem',
  outline: 'none',
};

function StarRating({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value ?? 0;
  return (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n === value ? 0 : n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            color: n <= display ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)',
            padding: '0 2px',
            lineHeight: 1,
            transition: 'color 0.1s',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function FlavorMeter({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', minWidth: '120px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: '2px' }}>
        {METER_LABELS.map((lbl, i) => {
          const val = i + 1;
          const active = value === val;
          return (
            <button
              key={lbl}
              type="button"
              onClick={() => onChange(active ? 0 : val)}
              style={{
                padding: '0.4rem 0.65rem',
                fontSize: '0.68rem',
                letterSpacing: '0.05em',
                background: active ? 'var(--color-terracotta)' : 'var(--color-charcoal)',
                color: active ? 'var(--color-cream)' : 'var(--color-smoke)',
                border: '1px solid',
                borderColor: active ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.1s',
                whiteSpace: 'nowrap',
              }}
            >
              {lbl}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function JournalEntryClient({
  entry,
  prefill,
  revisions,
}: {
  entry: JournalEntry | null;
  prefill: Prefill | null;
  revisions: Revision[];
}) {
  const source = entry ?? prefill;

  const [form, setForm] = useState({
    product_id:        entry?.product_id        ?? prefill?.product_id        ?? '',
    cigar_name:        entry?.cigar_name        ?? prefill?.cigar_name        ?? '',
    brand:             entry?.brand             ?? prefill?.brand             ?? '',
    size:              entry?.size              ?? prefill?.size              ?? '',
    wrapper:           entry?.wrapper           ?? prefill?.wrapper           ?? '',
    binder:            entry?.binder            ?? prefill?.binder            ?? '',
    filler:            entry?.filler            ?? prefill?.filler            ?? '',
    date_smoked:       entry?.date_smoked       ?? new Date().toISOString().split('T')[0],
    body:              entry?.body              ?? null as number | null,
    flavor_intensity:  entry?.flavor_intensity  ?? null as number | null,
    strength:          entry?.strength          ?? null as number | null,
    flavor_tags:       entry?.flavor_tags       ?? [] as string[],
    notes:             entry?.notes             ?? '',
    appearance_rating: entry?.appearance_rating ?? null as number | null,
    value_rating:      entry?.value_rating      ?? null as number | null,
    flavor_rating:     entry?.flavor_rating     ?? null as number | null,
    overall_rating:    entry?.overall_rating    ?? null as number | null,
    would_try_again:   entry?.would_try_again   ?? null as boolean | null,
    band_photo_url:    entry?.band_photo_url    ?? null as string | null,
  });

  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [errMsg, setErrMsg]               = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoErr, setPhotoErr]           = useState('');
  const [showRevisions, setShowRevisions] = useState(false);
  const [viewingRevision, setViewingRevision] = useState<Revision | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function toggleTag(tag: string) {
    set('flavor_tags', form.flavor_tags.includes(tag)
      ? form.flavor_tags.filter(t => t !== tag)
      : [...form.flavor_tags, tag]
    );
  }

  async function handleSave() {
    setSaving(true);
    setErrMsg('');
    setSaved(false);
    try {
      const method = entry ? 'PATCH' : 'POST';
      const body   = entry ? { id: entry.id, ...form } : form;
      const res    = await fetch('/api/account/journal', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.error) { setErrMsg(json.error); return; }
      setSaved(true);
    } catch {
      setErrMsg('Save failed — please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoErr('');
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      if (entry?.id) fd.append('journal_id', entry.id);
      const res = await fetch('/api/account/upload-band-photo', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.error) { setPhotoErr(json.error); return; }
      set('band_photo_url', json.url);
    } catch {
      setPhotoErr('Upload failed — please try again.');
    } finally {
      setPhotoUploading(false);
    }
  }

  if (!source && !entry) {
    return (
      <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '2rem' }}>
        <p style={{ color: 'var(--color-smoke)' }}>
          This cigar wasn&apos;t found in the shop catalog. You can still create an entry manually.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

      {/* Cigar Details */}
      <section>
        <div style={sectionHead}>Cigar Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Cigar Name</label>
            <input value={form.cigar_name} onChange={e => set('cigar_name', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Brand</label>
            <input value={form.brand} onChange={e => set('brand', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Size</label>
            <input value={form.size} onChange={e => set('size', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Wrapper</label>
            <input value={form.wrapper} onChange={e => set('wrapper', e.target.value)} style={inputStyle} placeholder="e.g. Ecuador" />
          </div>
          <div>
            <label style={labelStyle}>Binder</label>
            <input value={form.binder} onChange={e => set('binder', e.target.value)} style={inputStyle} placeholder="e.g. Nicaragua" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Filler</label>
            <input value={form.filler} onChange={e => set('filler', e.target.value)} style={inputStyle} placeholder="e.g. Dominican, Honduras" />
          </div>
          <div>
            <label style={labelStyle}>Date Smoked</label>
            <input type="date" value={form.date_smoked ?? ''} onChange={e => set('date_smoked', e.target.value)} style={inputStyle} />
          </div>
        </div>
      </section>

      {/* Flavor Meter */}
      <section>
        <div style={sectionHead}>Flavor Meter</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <FlavorMeter label="Body"             value={form.body}             onChange={v => set('body', v || null)} />
          <FlavorMeter label="Flavor Intensity" value={form.flavor_intensity} onChange={v => set('flavor_intensity', v || null)} />
          <FlavorMeter label="Strength"         value={form.strength}         onChange={v => set('strength', v || null)} />
        </div>
      </section>

      {/* Flavor Tags */}
      <section>
        <div style={{ ...sectionHead, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Flavor Notes</span>
          <a
            href="https://www.aromadictionary.com/cigar-flavor-wheel/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.1em', textDecoration: 'none', textTransform: 'none' }}
          >
            Open Flavor Wheel ↗
          </a>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {FLAVOR_CATEGORIES.map(cat => (
            <div key={cat.label}>
              <div style={{ color: 'var(--color-smoke)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {cat.label}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {cat.tags.map(tag => {
                  const active = form.flavor_tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.75rem',
                        background: active ? 'var(--color-terracotta)' : 'var(--color-charcoal)',
                        color: active ? 'var(--color-cream)' : 'var(--color-smoke)',
                        border: '1px solid',
                        borderColor: active ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.1s',
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section>
        <div style={sectionHead}>Notes</div>
        <textarea
          value={form.notes ?? ''}
          onChange={e => set('notes', e.target.value)}
          rows={5}
          placeholder="Your personal tasting notes…"
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
        />
      </section>

      {/* Ratings */}
      <section>
        <div style={sectionHead}>Ratings</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {([
            ['Appearance',      'appearance_rating'],
            ['Value for Money', 'value_rating'],
            ['Flavor',          'flavor_rating'],
            ['Overall',         'overall_rating'],
          ] as const).map(([lbl, key]) => (
            <div key={key}>
              <label style={labelStyle}>{lbl}</label>
              <StarRating value={form[key]} onChange={v => set(key, v || null)} />
            </div>
          ))}
        </div>
      </section>

      {/* Would You Try Again */}
      <section>
        <div style={sectionHead}>Would You Try Again?</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {([['Yes', true], ['No', false]] as const).map(([lbl, val]) => {
            const active = form.would_try_again === val;
            return (
              <button
                key={lbl}
                type="button"
                onClick={() => set('would_try_again', active ? null : val)}
                style={{
                  padding: '0.55rem 2rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: active ? 'var(--color-terracotta)' : 'var(--color-charcoal)',
                  color: active ? 'var(--color-cream)' : 'var(--color-smoke)',
                  border: '1px solid',
                  borderColor: active ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.1s',
                }}
              >
                {lbl}
              </button>
            );
          })}
        </div>
      </section>

      {/* Band Photo */}
      <section>
        <div style={sectionHead}>Cigar Band Photo</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {form.band_photo_url && (
            <div style={{ maxWidth: '280px', border: '1px solid var(--color-charcoal-mid)', overflow: 'hidden' }}>
              <img src={form.band_photo_url} alt="Cigar band" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
              style={{
                padding: '0.55rem 1.25rem',
                background: 'transparent',
                border: '1px solid var(--color-charcoal-mid)',
                color: 'var(--color-cream)',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: photoUploading ? 'wait' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {photoUploading ? 'Uploading…' : form.band_photo_url ? 'Replace Photo' : 'Upload Band Photo'}
            </button>
            {form.band_photo_url && (
              <button
                type="button"
                onClick={() => set('band_photo_url', null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-smoke)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Remove
              </button>
            )}
          </div>
          {photoErr && <p style={{ color: '#e74c3c', fontSize: '0.75rem', margin: 0 }}>{photoErr}</p>}
        </div>
      </section>

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-charcoal-mid)' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '0.85rem 2.5rem',
            background: saving ? 'var(--color-charcoal-mid)' : 'var(--color-terracotta)',
            color: 'var(--color-cream)',
            border: 'none',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: saving ? 'wait' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {saving ? 'Saving…' : entry ? 'Save Changes' : 'Create Entry'}
        </button>
        {saved  && <span style={{ color: 'var(--color-terracotta)', fontSize: '0.85rem' }}>✓ Saved</span>}
        {errMsg && <span style={{ color: '#e74c3c', fontSize: '0.85rem' }}>{errMsg}</span>}
      </div>

      {/* Revision History */}
      {revisions.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setShowRevisions(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-smoke)',
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: 0,
            }}
          >
            {showRevisions ? '▲' : '▼'} Revision History ({revisions.length})
          </button>

          {showRevisions && (
            <div style={{ marginTop: '1rem', background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)' }}>
              {revisions.map((rev, i) => (
                <div
                  key={rev.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1.25rem',
                    borderBottom: i < revisions.length - 1 ? '1px solid var(--color-charcoal-mid)' : 'none',
                  }}
                >
                  <span style={{ color: 'var(--color-cream-dark)', fontSize: '0.8rem' }}>
                    {new Date(rev.saved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewingRevision(viewingRevision?.id === rev.id ? null : rev)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--color-charcoal-mid)',
                      color: 'var(--color-smoke)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      padding: '0.3rem 0.75rem',
                      fontFamily: 'inherit',
                    }}
                  >
                    {viewingRevision?.id === rev.id ? 'Hide' : 'View'}
                  </button>
                </div>
              ))}

              {viewingRevision && (
                <div style={{ padding: '1.25rem', borderTop: '1px solid var(--color-charcoal-mid)', background: 'var(--color-pitch)' }}>
                  <div style={{ color: 'var(--color-smoke)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                    Snapshot — read only
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem', fontSize: '0.82rem' }}>
                    {(['cigar_name', 'brand', 'size', 'wrapper', 'binder', 'filler', 'date_smoked', 'notes', 'body', 'flavor_intensity', 'strength', 'overall_rating', 'would_try_again'] as const).map(k => {
                      const val = viewingRevision.snapshot[k];
                      if (val === null || val === undefined || val === '') return null;
                      return (
                        <div key={k} style={{ gridColumn: k === 'notes' ? '1 / -1' : 'auto' }}>
                          <span style={{ color: 'var(--color-smoke)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            {k.replace(/_/g, ' ')}:{' '}
                          </span>
                          <span style={{ color: 'var(--color-cream-dark)' }}>
                            {String(val)}
                          </span>
                        </div>
                      );
                    })}
                    {Array.isArray(viewingRevision.snapshot.flavor_tags) && (viewingRevision.snapshot.flavor_tags as string[]).length > 0 && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: 'var(--color-smoke)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Flavors: </span>
                        <span style={{ color: 'var(--color-cream-dark)' }}>{(viewingRevision.snapshot.flavor_tags as string[]).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
