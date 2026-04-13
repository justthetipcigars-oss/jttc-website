'use client';

import { useState, useEffect, useCallback } from 'react';
import { JTTEvent, EventSubcategory } from '@/lib/events';

const STORAGE_KEY = 'jttc_admin_pw';

function formatDateDisplay(dateStr: string) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  date: '',
  time: '',
  endTime: '',
  category: 'on-site' as 'on-site' | 'off-site',
  subcategory: 'non-recurring' as EventSubcategory,
  recurringPattern: '',
  location: '',
  imageUrl: '',
  facebookEventUrl: '',
  ticketed: false,
  ticketUrl: '',
};

export default function AdminClient() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [events, setEvents] = useState<JTTEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [fbUrl, setFbUrl] = useState('');
  const [fbLoading, setFbLoading] = useState(false);
  const [fbError, setFbError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [storedPw, setStoredPw] = useState('');

  useEffect(() => {
    const pw = sessionStorage.getItem(STORAGE_KEY);
    if (pw) { setStoredPw(pw); setAuthed(true); }
  }, []);

  const fetchEvents = useCallback(async (pw: string) => {
    setLoading(true);
    const res = await fetch('/api/events');
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) fetchEvents(storedPw);
  }, [authed, storedPw, fetchEvents]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    fetch('/api/admin/check', {
      method: 'POST',
      headers: { 'x-admin-password': password },
    }).then(res => {
      if (res.ok) {
        sessionStorage.setItem(STORAGE_KEY, password);
        setStoredPw(password);
        setAuthed(true);
        setAuthError('');
      } else {
        setAuthError('Incorrect password.');
      }
    });
  }

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError('');
    setFbUrl('');
    setFbError('');
    setUploadError('');
    setView('form');
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setUploadError('');
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-password': storedPw },
        body: data,
      });
      const json = await res.json();
      if (res.ok) {
        setForm(f => ({ ...f, imageUrl: json.url }));
      } else {
        setUploadError(json.error || 'Upload failed.');
      }
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function importFromFacebook() {
    if (!fbUrl.trim()) return;
    setFbLoading(true);
    setFbError('');
    const res = await fetch('/api/admin/facebook-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': storedPw },
      body: JSON.stringify({ url: fbUrl.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFbError(data.error || 'Import failed.');
    } else {
      setForm(f => ({
        ...f,
        title: data.title || f.title,
        description: data.description || f.description,
        imageUrl: data.imageUrl || f.imageUrl,
        facebookEventUrl: data.facebookEventUrl || f.facebookEventUrl,
      }));
      setFbUrl('');
    }
    setFbLoading(false);
  }

  function openEdit(ev: JTTEvent) {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      description: ev.description,
      date: ev.date,
      time: ev.time,
      endTime: ev.endTime || '',
      category: ev.category,
      subcategory: ev.subcategory || 'non-recurring',
      recurringPattern: ev.recurringPattern || '',
      location: ev.location || '',
      imageUrl: ev.imageUrl || '',
      facebookEventUrl: ev.facebookEventUrl || '',
      ticketed: ev.ticketed,
      ticketUrl: ev.ticketUrl || '',
    });
    setSaveError('');
    setView('form');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date || !form.time) {
      setSaveError('Title, date, and time are required.');
      return;
    }
    setSaving(true);
    setSaveError('');

    const payload = {
      ...form,
      subcategory: form.category === 'on-site' ? form.subcategory : undefined,
      recurringPattern: form.category === 'on-site' && form.subcategory === 'recurring' ? form.recurringPattern : undefined,
    };

    const url = editingId ? `/api/events/${editingId}` : '/api/events';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-password': storedPw },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await fetchEvents(storedPw);
      setView('list');
    } else {
      setSaveError('Failed to save. Please try again.');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    await fetch(`/api/events/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': storedPw },
    });
    await fetchEvents(storedPw);
  }

  // ── Login screen ──
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-pitch)' }}>
        <div style={{ width: '100%', maxWidth: 360, padding: '2.5rem', background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)' }}>
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Admin
          </div>
          <h1 style={{ color: 'var(--color-cream)', fontSize: '1.4rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            Just The Tip Cigars
          </h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...inputStyle }}
              autoFocus
            />
            {authError && <p style={{ color: '#f87171', fontSize: '0.8rem' }}>{authError}</p>}
            <button type="submit" style={primaryBtn}>Enter</button>
          </form>
        </div>
      </div>
    );
  }

  // ── Event form ──
  if (view === 'form') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-pitch)', paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 1.5rem' }}>
          <button onClick={() => setView('list')} style={{ ...ghostBtn, marginBottom: '1.5rem' }}>
            ← Back
          </button>
          <h1 style={{ color: 'var(--color-cream)', fontSize: '1.4rem', fontWeight: 600, marginBottom: '2rem' }}>
            {editingId ? 'Edit Event' : 'New Event'}
          </h1>

          {/* Facebook Import */}
          <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Import from Facebook Event
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Paste Facebook event URL..."
                value={fbUrl}
                onChange={e => setFbUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), importFromFacebook())}
              />
              <button
                type="button"
                onClick={importFromFacebook}
                disabled={fbLoading || !fbUrl.trim()}
                style={{ ...primaryBtn, opacity: fbLoading || !fbUrl.trim() ? 0.5 : 1 }}
              >
                {fbLoading ? 'Importing…' : 'Import'}
              </button>
            </div>
            {fbError && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.5rem' }}>{fbError}</p>}
            <p style={{ color: 'var(--color-charcoal-light)', fontSize: '0.7rem', marginTop: '0.5rem' }}>
              Pulls title, description, and cover image. Date & time must be set manually.
            </p>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <Field label="Title *">
              <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </Field>

            <Field label="Description">
              <textarea
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <Field label="Date *">
                <input type="date" style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </Field>
              <Field label="Start Time *">
                <input type="time" style={inputStyle} value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </Field>
              <Field label="End Time">
                <input type="time" style={inputStyle} value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
              </Field>
            </div>

            <Field label="Category">
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {(['on-site', 'off-site'] as const).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: c }))}
                    style={{
                      flex: 1, padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      background: form.category === c ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)',
                      color: 'var(--color-cream)', border: 'none', cursor: 'pointer',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>

            {form.category === 'on-site' && (
              <Field label="Type">
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {(['recurring', 'non-recurring', 'pop-up'] as EventSubcategory[]).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, subcategory: s }))}
                      style={{
                        flex: 1, padding: '0.5rem', fontSize: '0.7rem', fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        background: form.subcategory === s ? 'var(--color-charcoal-light)' : 'var(--color-charcoal-mid)',
                        color: 'var(--color-cream)', border: 'none', cursor: 'pointer',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
            )}

            {form.category === 'on-site' && form.subcategory === 'recurring' && (
              <Field label="Recurring Pattern (e.g. Every Saturday)">
                <input style={inputStyle} value={form.recurringPattern} onChange={e => setForm(f => ({ ...f, recurringPattern: e.target.value }))} />
              </Field>
            )}

            {form.category === 'off-site' && (
              <Field label="Location / Venue">
                <input style={inputStyle} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Venue name and address" />
              </Field>
            )}

            <Field label="Event Image">
              {/* File upload */}
              <label
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', padding: '0.75rem', cursor: 'pointer',
                  border: '2px dashed var(--color-charcoal-mid)',
                  color: uploading ? 'var(--color-terracotta)' : 'var(--color-smoke)',
                  fontSize: '0.8rem', letterSpacing: '0.08em',
                  background: 'var(--color-charcoal)',
                }}
              >
                {uploading ? 'Uploading…' : '⬆ Upload from PC'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  disabled={uploading}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </label>
              {uploadError && <p style={{ color: '#f87171', fontSize: '0.75rem' }}>{uploadError}</p>}
              {/* Or paste URL */}
              <input
                style={{ ...inputStyle, marginTop: '0.5rem' }}
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="Or paste image URL directly..."
              />
              {form.imageUrl && (
                <img src={form.imageUrl} alt="preview" style={{ marginTop: '0.5rem', maxHeight: 160, objectFit: 'contain', border: '1px solid var(--color-charcoal-mid)' }} />
              )}
            </Field>

            <Field label="Facebook Event URL (optional — image becomes a link)">
              <input
                style={inputStyle}
                value={form.facebookEventUrl}
                onChange={e => setForm(f => ({ ...f, facebookEventUrl: e.target.value }))}
                placeholder="https://www.facebook.com/events/..."
              />
            </Field>

            {saveError && <p style={{ color: '#f87171', fontSize: '0.8rem' }}>{saveError}</p>}

            <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
              <button type="submit" disabled={saving} style={primaryBtn}>
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Event'}
              </button>
              <button type="button" onClick={() => setView('list')} style={ghostBtn}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── Event list ──
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-pitch)', paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ background: 'var(--color-charcoal)', borderBottom: '1px solid var(--color-charcoal-mid)', padding: '1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Admin
            </div>
            <h1 style={{ color: 'var(--color-cream)', fontSize: '1.3rem', fontWeight: 600 }}>Events</h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={openNew} style={primaryBtn}>+ New Event</button>
            <button onClick={() => { sessionStorage.removeItem(STORAGE_KEY); setAuthed(false); }} style={ghostBtn}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1.5rem' }}>
        {loading ? (
          <p style={{ color: 'var(--color-smoke)', textAlign: 'center', paddingTop: '4rem' }}>Loading…</p>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--color-smoke)' }}>
            <p style={{ marginBottom: '1.5rem' }}>No events yet.</p>
            <button onClick={openNew} style={primaryBtn}>Create Your First Event</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--color-charcoal-mid)' }}>
            {events.map(ev => (
              <div
                key={ev.id}
                style={{ background: 'var(--color-charcoal)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
              >
                {/* Date */}
                <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 52 }}>
                  <div style={{ color: 'var(--color-terracotta)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    {ev.date.slice(5, 7)}/{ev.date.slice(8, 10)}
                  </div>
                  <div style={{ color: 'var(--color-cream)', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}>
                    {ev.date.slice(8, 10)}
                  </div>
                  <div style={{ color: 'var(--color-smoke)', fontSize: '0.6rem' }}>{ev.date.slice(0, 4)}</div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={tagStyle}>{ev.category}</span>
                    {ev.subcategory && <span style={tagStyle}>{ev.subcategory}</span>}
                  </div>
                  <div style={{ color: 'var(--color-cream)', fontWeight: 600, fontSize: '0.95rem' }}>{ev.title}</div>
                  <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    {ev.time}{ev.endTime ? ` – ${ev.endTime}` : ''}
                    {ev.location ? ` · ${ev.location}` : ''}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                  <button onClick={() => openEdit(ev)} style={ghostBtn}>Edit</button>
                  <button onClick={() => handleDelete(ev.id)} style={{ ...ghostBtn, color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ color: 'var(--color-smoke)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  background: 'var(--color-charcoal)',
  border: '1px solid var(--color-charcoal-mid)',
  color: 'var(--color-cream)',
  fontSize: '0.9rem',
  outline: 'none',
};

const primaryBtn: React.CSSProperties = {
  padding: '0.6rem 1.25rem',
  background: 'var(--color-terracotta)',
  color: 'var(--color-cream)',
  border: 'none',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const ghostBtn: React.CSSProperties = {
  padding: '0.6rem 1.25rem',
  background: 'transparent',
  color: 'var(--color-smoke)',
  border: '1px solid var(--color-charcoal-mid)',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const tagStyle: React.CSSProperties = {
  padding: '0.15rem 0.5rem',
  background: 'rgba(196,98,45,0.12)',
  color: 'var(--color-terracotta)',
  fontSize: '0.6rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};
