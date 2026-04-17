'use client';

import { useState, useRef } from 'react';
import { JTTEvent } from '@/lib/events';

type EventForm = Omit<JTTEvent, 'id' | 'createdAt'>;

const BLANK: EventForm = {
  title: '',
  description: '',
  date: '',
  time: '',
  endTime: '',
  category: 'on-site',
  subcategory: undefined,
  recurringPattern: '',
  location: '',
  imageUrl: '',
  facebookEventUrl: '',
  ticketed: false,
  ticketUrl: '',
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  );
}

function EventFormPanel({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: EventForm;
  onSave: (f: EventForm) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [f, setF]                       = useState<EventForm>(initial);
  const [uploading, setUploading]       = useState(false);
  const [uploadErr, setUploadErr]       = useState('');
  const imageInputRef                   = useRef<HTMLInputElement>(null);

  function set<K extends keyof EventForm>(k: K, v: EventForm[K]) {
    setF(prev => ({ ...prev, [k]: v }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr(''); setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    const res  = await fetch('/api/admin/upload-event-image', { method: 'POST', body: fd });
    const json = await res.json();
    if (json.error) { setUploadErr(json.error); setUploading(false); return; }
    set('imageUrl', json.url);
    setUploading(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1rem' }}>
        <div className="sm:col-span-2">
          <Field label="Title">
            <input style={inp} value={f.title} onChange={e => set('title', e.target.value)} required />
          </Field>
        </div>
        <Field label="Date">
          <input type="date" style={inp} value={f.date} onChange={e => set('date', e.target.value)} required />
        </Field>
        <Field label="Start Time">
          <input type="time" style={inp} value={f.time} onChange={e => set('time', e.target.value)} />
        </Field>
        <Field label="End Time (optional)">
          <input type="time" style={inp} value={f.endTime ?? ''} onChange={e => set('endTime', e.target.value || undefined)} />
        </Field>
        <Field label="Category">
          <select
            style={{ ...inp, cursor: 'pointer' }}
            value={f.category}
            onChange={e => set('category', e.target.value as JTTEvent['category'])}
          >
            <option value="on-site">On-Site</option>
            <option value="off-site">Off-Site</option>
          </select>
        </Field>
        <Field label="Subcategory (on-site)">
          <select
            style={{ ...inp, cursor: 'pointer' }}
            value={f.subcategory ?? ''}
            onChange={e => set('subcategory', (e.target.value as JTTEvent['subcategory']) || undefined)}
          >
            <option value="">None</option>
            <option value="recurring">Recurring</option>
            <option value="non-recurring">Non-Recurring</option>
            <option value="pop-up">Pop-Up</option>
          </select>
        </Field>
        <Field label="Recurring Pattern (e.g. Every Saturday)">
          <input style={inp} value={f.recurringPattern ?? ''} onChange={e => set('recurringPattern', e.target.value || undefined)} />
        </Field>
        <Field label="Location (leave blank for JTTC)">
          <input style={inp} value={f.location ?? ''} onChange={e => set('location', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea
              style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
              rows={3}
              value={f.description}
              onChange={e => set('description', e.target.value)}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Poster Image">
            <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading}
                style={{ padding: '0.5rem 1.25rem', background: 'transparent', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-cream-dark)', fontSize: '0.75rem', letterSpacing: '0.08em', cursor: uploading ? 'wait' : 'pointer', fontFamily: 'inherit' }}
              >
                {uploading ? 'Uploading…' : f.imageUrl ? 'Replace Image' : 'Upload Image'}
              </button>
              {f.imageUrl && (
                <button
                  type="button"
                  onClick={() => set('imageUrl', undefined)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-smoke)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Remove
                </button>
              )}
            </div>
            {uploadErr && <p style={{ color: '#e05555', fontSize: '0.75rem', margin: '0.4rem 0 0' }}>{uploadErr}</p>}
            {f.imageUrl && (
              <div style={{ marginTop: '0.75rem', maxWidth: 160, border: '1px solid var(--color-charcoal-mid)', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.imageUrl} alt="Preview" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
              </div>
            )}
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Facebook Event URL">
            <input style={inp} value={f.facebookEventUrl ?? ''} onChange={e => set('facebookEventUrl', e.target.value || undefined)} placeholder="https://facebook.com/events/…" />
          </Field>
        </div>
        <Field label="Ticketed?">
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
            {([['Yes', true], ['No', false]] as const).map(([lbl2, val]) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => set('ticketed', val)}
                style={{
                  padding: '0.45rem 1.25rem',
                  fontSize: '0.75rem', fontWeight: 600,
                  background: f.ticketed === val ? 'var(--color-terracotta)' : 'transparent',
                  color: f.ticketed === val ? 'var(--color-cream)' : 'var(--color-smoke)',
                  border: '1px solid',
                  borderColor: f.ticketed === val ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >{lbl2}</button>
            ))}
          </div>
        </Field>
        {f.ticketed && (
          <Field label="Ticket URL">
            <input style={inp} value={f.ticketUrl ?? ''} onChange={e => set('ticketUrl', e.target.value || undefined)} placeholder="https://…" />
          </Field>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--color-charcoal-mid)' }}>
        <button
          type="button"
          onClick={() => onSave(f)}
          disabled={saving || !f.title || !f.date}
          style={{
            padding: '0.7rem 2rem',
            background: 'var(--color-terracotta)', color: 'var(--color-cream)',
            border: 'none', fontWeight: 700, fontSize: '0.78rem',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit',
            opacity: (!f.title || !f.date) ? 0.5 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save Event'}
        </button>
        <button
          type="button" onClick={onCancel}
          style={{ background: 'none', border: 'none', color: 'var(--color-smoke)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminEventsClient({ initialEvents }: { initialEvents: JTTEvent[] }) {
  const [events, setEvents]   = useState<JTTEvent[]>(initialEvents);
  const [mode, setMode]       = useState<'list' | 'add' | { edit: JTTEvent }>('list');
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg]         = useState('');

  const now = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter(e => e.date >= now).sort((a, b) => a.date.localeCompare(b.date));
  const past     = events.filter(e => e.date < now).sort((a, b) => b.date.localeCompare(a.date));

  async function handleAdd(f: EventForm) {
    setSaving(true); setMsg('');
    const res  = await fetch('/api/admin/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const json = await res.json();
    if (json.error) { setMsg(json.error); setSaving(false); return; }
    setEvents(prev => [...prev, json.event]);
    setMode('list');
    setMsg('Event added.');
    setSaving(false);
  }

  async function handleEdit(f: EventForm) {
    if (typeof mode !== 'object' || !('edit' in mode)) return;
    setSaving(true); setMsg('');
    const res  = await fetch('/api/admin/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: mode.edit.id, ...f }) });
    const json = await res.json();
    if (json.error) { setMsg(json.error); setSaving(false); return; }
    setEvents(prev => prev.map(e => e.id === json.event.id ? json.event : e));
    setMode('list');
    setMsg('Event updated.');
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    setDeleting(id);
    const res  = await fetch('/api/admin/events', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const json = await res.json();
    if (!json.error) setEvents(prev => prev.filter(e => e.id !== id));
    setDeleting(null);
  }

  async function handleSignOut() {
    const { createClient } = await import('@/lib/supabase/client');
    await createClient().auth.signOut();
    window.location.href = '/admin/login';
  }

  function EventRow({ ev }: { ev: JTTEvent }) {
    const [y, m, d] = ev.date.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap' }}>
        <div style={{ width: 60, flexShrink: 0, textAlign: 'center' }}>
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>{months[parseInt(m)-1].toUpperCase()}</div>
          <div style={{ color: 'var(--color-cream)', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}>{parseInt(d)}</div>
          <div style={{ color: 'var(--color-smoke)', fontSize: '0.6rem' }}>{y}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'var(--color-cream)', fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
          <div style={{ color: 'var(--color-smoke)', fontSize: '0.72rem', marginTop: '2px' }}>
            {ev.category}{ev.subcategory ? ` · ${ev.subcategory}` : ''}{ev.time ? ` · ${ev.time}` : ''}
            {ev.imageUrl && <span style={{ color: 'var(--color-terracotta)', marginLeft: '0.5rem' }}>🖼</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={() => setMode({ edit: ev })}
            style={{ padding: '0.3rem 0.75rem', background: 'transparent', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-cream-dark)', fontSize: '0.7rem', letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'inherit' }}
          >Edit</button>
          <button
            onClick={() => handleDelete(ev.id)}
            disabled={deleting === ev.id}
            style={{ padding: '0.3rem 0.75rem', background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: '0.7rem', letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'inherit' }}
          >{deleting === ev.id ? '…' : 'Delete'}</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Admin</div>
          <h1 style={{ color: 'var(--color-cream)', fontSize: '1.6rem', fontWeight: 600 }}>Events</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {mode === 'list' && (
            <button
              onClick={() => { setMode('add'); setMsg(''); }}
              style={{ padding: '0.6rem 1.5rem', background: 'var(--color-terracotta)', color: 'var(--color-cream)', border: 'none', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              + Add Event
            </button>
          )}
          <button
            onClick={handleSignOut}
            style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-smoke)', fontSize: '0.72rem', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(196,98,45,0.12)', border: '1px solid rgba(196,98,45,0.3)', color: 'var(--color-terracotta)', fontSize: '0.82rem' }}>
          {msg}
        </div>
      )}

      {/* Add / Edit form */}
      {(mode === 'add' || (typeof mode === 'object' && 'edit' in mode)) && (
        <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            {mode === 'add' ? 'New Event' : 'Edit Event'}
          </div>
          <EventFormPanel
            initial={mode === 'add' ? BLANK : { ...(mode as { edit: JTTEvent }).edit }}
            onSave={mode === 'add' ? handleAdd : handleEdit}
            onCancel={() => { setMode('list'); setMsg(''); }}
            saving={saving}
          />
        </div>
      )}

      {/* Upcoming */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Upcoming ({upcoming.length})
        </div>
        <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)' }}>
          {upcoming.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-smoke)', fontSize: '0.85rem' }}>No upcoming events.</div>
          ) : (
            upcoming.map(ev => <EventRow key={ev.id} ev={ev} />)
          )}
        </div>
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <div style={{ color: 'var(--color-smoke)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Past ({past.length})
          </div>
          <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', opacity: 0.6 }}>
            {past.map(ev => <EventRow key={ev.id} ev={ev} />)}
          </div>
        </div>
      )}
    </div>
  );
}
