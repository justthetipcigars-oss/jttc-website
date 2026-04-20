'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Pipe = {
  id: string;
  product_id: string | null;
  pipe_name: string;
  brand: string;
  sub_category: string | null;
  acquisition_source: string | null;
  date_purchased: string | null;
  price_paid: number | null;
  estimated_value: number | null;
  status: string;
  rotation_frequency: string | null;
  dedicated_tobacco_product_id: string | null;
  dedicated_tobacco_name: string | null;
  length: string | null;
  weight: string | null;
  bowl_height: string | null;
  chamber_depth: string | null;
  chamber_diameter: string | null;
  outside_diameter: string | null;
  stem_material: string | null;
  filter: string | null;
  shape: string | null;
  finish: string | null;
  material: string | null;
  country: string | null;
  notes: string | null;
  stock_image_url: string | null;
};

type Photo = { id: string; pipe_id: string; url: string; is_primary: boolean };

type TobaccoOption = { id: string; name: string; brand: string };

const SPEC_FIELDS: Array<[keyof Pipe, string]> = [
  ['length',           'Length'],
  ['weight',           'Weight'],
  ['bowl_height',      'Bowl Height'],
  ['chamber_depth',    'Chamber Depth'],
  ['chamber_diameter', 'Chamber Diameter'],
  ['outside_diameter', 'Outside Diameter'],
  ['stem_material',    'Stem Material'],
  ['filter',           'Filter'],
  ['shape',            'Shape'],
  ['finish',           'Finish'],
  ['material',         'Material'],
  ['country',          'Country'],
];

export default function PipeEditClient({
  pipe: initial, photos: initialPhotos, tobaccoOptions,
}: {
  pipe: Pipe; photos: Photo[]; tobaccoOptions: TobaccoOption[];
}) {
  const router = useRouter();
  const [pipe, setPipe] = useState<Pipe>(initial);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Pipe>(k: K, v: Pipe[K]) => setPipe(p => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/account/pipes/${pipe.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pipe),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      fd.append('pipe_id', pipe.id);
      if (photos.length === 0) fd.append('primary', '1');
      const res = await fetch('/api/account/upload-pipe-photo', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setPhotos(prev => {
        const next = json.photo.is_primary ? prev.map(p => ({ ...p, is_primary: false })) : prev;
        return [...next, json.photo];
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function setPrimary(photoId: string) {
    const res = await fetch(`/api/account/pipes/photos/${photoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_primary: true }),
    });
    if (res.ok) {
      setPhotos(prev => prev.map(p => ({ ...p, is_primary: p.id === photoId })));
    }
  }

  async function deletePhoto(photoId: string) {
    if (!confirm('Delete this photo?')) return;
    const res = await fetch(`/api/account/pipes/photos/${photoId}`, { method: 'DELETE' });
    if (res.ok) setPhotos(prev => prev.filter(p => p.id !== photoId));
  }

  async function deletePipe() {
    if (!confirm(`Delete "${pipe.pipe_name}" from your collection? This cannot be undone.`)) return;
    const res = await fetch(`/api/account/pipes/${pipe.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/account/pipes/collection');
    else setError('Delete failed');
  }

  const displayPhotos: Array<{ id: string | null; url: string; is_primary: boolean; stock: boolean }> = [
    ...(pipe.stock_image_url ? [{ id: null, url: pipe.stock_image_url, is_primary: false, stock: true }] : []),
    ...photos.map(p => ({ id: p.id, url: p.url, is_primary: p.is_primary, stock: false })),
  ];

  return (
    <div>
      {/* Photos */}
      <Section title="Photos">
        {displayPhotos.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--color-charcoal-mid)' }}>
            <p style={{ color: 'var(--color-smoke)', fontSize: '0.85rem' }}>No photos yet. Upload one below.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {displayPhotos.map((p, i) => (
              <div key={p.id ?? `stock-${i}`} style={{ position: 'relative', aspectRatio: '1 / 1', background: 'var(--color-charcoal)', border: p.is_primary ? '2px solid var(--color-terracotta)' : '1px solid var(--color-charcoal-mid)', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {p.stock && (
                  <div style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,0.75)', color: 'var(--color-smoke)', fontSize: '0.6rem', padding: '2px 6px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Stock
                  </div>
                )}
                {!p.stock && p.is_primary && (
                  <div style={{ position: 'absolute', top: 4, left: 4, background: 'var(--color-terracotta)', color: 'var(--color-pitch)', fontSize: '0.6rem', padding: '2px 6px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                    Primary
                  </div>
                )}
                {!p.stock && p.id && (
                  <div style={{ position: 'absolute', bottom: 4, left: 4, right: 4, display: 'flex', gap: 4 }}>
                    {!p.is_primary && (
                      <button onClick={() => setPrimary(p.id!)} style={tinyBtn}>Set primary</button>
                    )}
                    <button onClick={() => deletePhoto(p.id!)} style={{ ...tinyBtn, marginLeft: 'auto' }}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: '0.85rem' }}>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} style={{ color: 'var(--color-smoke)', fontSize: '0.8rem' }} disabled={uploading} />
          {uploading && <span style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>Uploading…</span>}
        </div>
      </Section>

      {/* Identity */}
      <Section title="Identity">
        <Grid>
          <Field label="Pipe Name">
            <Input value={pipe.pipe_name} onChange={v => set('pipe_name', v)} />
          </Field>
          <Field label="Brand / Carver">
            <Input value={pipe.brand} onChange={v => set('brand', v)} />
          </Field>
          <Field label="Sub-Category">
            <Input value={pipe.sub_category ?? ''} onChange={v => set('sub_category', v)} placeholder="Briar, Meerschaum, Cob…" />
          </Field>
        </Grid>
      </Section>

      {/* Acquisition */}
      <Section title="Acquisition">
        <Grid>
          <Field label="Source">
            <Select value={pipe.acquisition_source ?? ''} onChange={v => set('acquisition_source', v || null)} options={['', 'New', 'Estate']} />
          </Field>
          <Field label="Date Purchased">
            <Input type="date" value={pipe.date_purchased ?? ''} onChange={v => set('date_purchased', v || null)} />
          </Field>
          <Field label="Price Paid">
            <Input type="number" value={pipe.price_paid?.toString() ?? ''} onChange={v => set('price_paid', v === '' ? null : Number(v))} placeholder="0.00" />
          </Field>
          <Field label="Est. Value">
            <Input type="number" value={pipe.estimated_value?.toString() ?? ''} onChange={v => set('estimated_value', v === '' ? null : Number(v))} placeholder="0.00" />
          </Field>
        </Grid>
      </Section>

      {/* Status */}
      <Section title="Status">
        <Grid>
          <Field label="Status">
            <Select value={pipe.status} onChange={v => set('status', v)} options={['Active', 'Resting', 'Retired']} />
          </Field>
          <Field label="Rotation">
            <Select value={pipe.rotation_frequency ?? ''} onChange={v => set('rotation_frequency', v || null)} options={['', 'Daily', 'Weekly', 'Special occasion']} />
          </Field>
          <Field label="Dedicated Tobacco">
            <select
              value={pipe.dedicated_tobacco_product_id ?? ''}
              onChange={e => {
                const id = e.target.value || null;
                const opt = tobaccoOptions.find(o => o.id === id);
                setPipe(p => ({ ...p, dedicated_tobacco_product_id: id, dedicated_tobacco_name: opt?.name ?? null }));
              }}
              style={inputStyle}
            >
              <option value="">— None —</option>
              {tobaccoOptions.map(o => (
                <option key={o.id} value={o.id}>{o.brand ? `${o.brand} — ${o.name}` : o.name}</option>
              ))}
            </select>
          </Field>
        </Grid>
      </Section>

      {/* Specs */}
      <Section title="Specs">
        <Grid>
          {SPEC_FIELDS.map(([key, label]) => (
            <Field key={key} label={label}>
              <Input
                value={(pipe[key] as string | null) ?? ''}
                onChange={v => set(key, (v === '' ? null : v) as Pipe[typeof key])}
              />
            </Field>
          ))}
        </Grid>
      </Section>

      {/* Notes */}
      <Section title="Notes">
        <textarea
          value={pipe.notes ?? ''}
          onChange={e => set('notes', e.target.value || null)}
          rows={5}
          style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
        />
      </Section>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: '0.7rem 2rem',
            background: 'var(--color-terracotta)',
            color: 'var(--color-pitch)',
            border: 'none',
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            cursor: saving ? 'wait' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {savedAt && <span style={{ color: 'var(--color-smoke)', fontSize: '0.8rem' }}>Saved {savedAt}</span>}
        {error && <span style={{ color: '#c94444', fontSize: '0.8rem' }}>{error}</span>}
        <button
          onClick={deletePipe}
          style={{
            marginLeft: 'auto',
            padding: '0.7rem 1.25rem',
            background: 'transparent',
            color: 'var(--color-smoke)',
            border: '1px solid var(--color-charcoal-mid)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Delete Pipe
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-charcoal)',
  border: '1px solid var(--color-charcoal-mid)',
  color: 'var(--color-cream)',
  padding: '0.5rem 0.75rem',
  fontSize: '0.85rem',
  outline: 'none',
};

const tinyBtn: React.CSSProperties = {
  background: 'rgba(0,0,0,0.75)',
  color: 'var(--color-cream)',
  border: '1px solid var(--color-charcoal-mid)',
  fontSize: '0.6rem',
  padding: '3px 6px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ color: 'var(--color-cream)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid var(--color-charcoal-mid)', paddingBottom: '0.5rem' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
        {label}
      </div>
      {children}
    </label>
  );
}

function Input({ value, onChange, type = 'text', placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />;
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
      {options.map(o => <option key={o} value={o}>{o || '—'}</option>)}
    </select>
  );
}
