'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCustomPipeClient() {
  const router = useRouter();
  const [photoFile, setPhotoFile]     = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [brand, setBrand]             = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [pipeName, setPipeName]       = useState('');
  const [busy, setBusy]               = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  const canSubmit = !!photoFile && brand.trim() !== '' && subCategory.trim() !== '' && !busy;

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      // 1. Create pipe row (sans photo)
      const createRes = await fetch('/api/account/pipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pipe_name: pipeName.trim() || `${brand.trim()} Pipe`,
          brand: brand.trim(),
          sub_category: subCategory.trim(),
          status: 'Active',
        }),
      });
      const pipe = await createRes.json();
      if (!createRes.ok) throw new Error(pipe.error || 'Create failed');

      // 2. Upload photo against the new pipe id, mark primary
      const fd = new FormData();
      fd.append('photo', photoFile!);
      fd.append('pipe_id', pipe.id);
      fd.append('primary', '1');
      const upRes = await fetch('/api/account/upload-pipe-photo', { method: 'POST', body: fd });
      const upJson = await upRes.json();
      if (!upRes.ok) throw new Error(upJson.error || 'Photo upload failed');

      router.push(`/account/pipes/collection/${pipe.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add pipe');
      setBusy(false);
    }
  }

  return (
    <div>
      {/* Step 1: Photo */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Step 1 — Photo <span style={{ color: 'var(--color-terracotta)' }}>*</span>
        </div>
        {photoPreview ? (
          <div style={{ position: 'relative', width: 200, aspectRatio: '1 / 1', border: '1px solid var(--color-charcoal-mid)', overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              onClick={() => { setPhotoFile(null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
              style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.8)', color: 'var(--color-cream)', border: '1px solid var(--color-charcoal-mid)', fontSize: '0.65rem', padding: '2px 6px', cursor: 'pointer' }}
            >
              Remove
            </button>
          </div>
        ) : (
          <label style={{ display: 'inline-block', padding: '2rem 2.5rem', border: '1px dashed var(--color-charcoal-mid)', cursor: 'pointer', color: 'var(--color-smoke)', fontSize: '0.85rem' }}>
            Choose a photo
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} style={{ display: 'none' }} />
          </label>
        )}
      </div>

      {/* Step 2: basics */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ color: 'var(--color-smoke)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Step 2 — Basics
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <label>
            <div style={labelStyle}>Brand / Carver <span style={{ color: 'var(--color-terracotta)' }}>*</span></div>
            <input type="text" value={brand} onChange={e => setBrand(e.target.value)} style={inputStyle} />
          </label>
          <label>
            <div style={labelStyle}>Category <span style={{ color: 'var(--color-terracotta)' }}>*</span></div>
            <input type="text" value={subCategory} onChange={e => setSubCategory(e.target.value)} placeholder="Briar, Meerschaum, Cob…" style={inputStyle} />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            <div style={labelStyle}>Pipe Name (optional)</div>
            <input type="text" value={pipeName} onChange={e => setPipeName(e.target.value)} placeholder={brand ? `${brand} Pipe` : 'e.g. Bent Billiard'} style={inputStyle} />
          </label>
        </div>
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={submit}
          disabled={!canSubmit}
          style={{
            padding: '0.75rem 2rem',
            background: canSubmit ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)',
            color: canSubmit ? 'var(--color-pitch)' : 'var(--color-smoke)',
            border: 'none',
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {busy ? 'Adding…' : 'Add & Continue'}
        </button>
        <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>
          You&apos;ll fill in specs and notes on the next screen.
        </span>
        {error && <span style={{ color: '#c94444', fontSize: '0.8rem' }}>{error}</span>}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-charcoal)',
  border: '1px solid var(--color-charcoal-mid)',
  color: 'var(--color-cream)',
  padding: '0.55rem 0.85rem',
  fontSize: '0.9rem',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  color: 'var(--color-smoke)',
  fontSize: '0.7rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '0.35rem',
};
