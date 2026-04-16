'use client';

import { useState, useTransition, useRef } from 'react';
import { saveProfile } from './actions';

type Profile = {
  full_name:           string | null;
  preferred_name:      string | null;
  birthday:            string | null;
  phone:               string | null;
  preferred_email:     string | null;
  address_line1:       string | null;
  address_line2:       string | null;
  city:                string | null;
  state:               string | null;
  zip:                 string | null;
  instagram_handle:    string | null;
  facebook_handle:     string | null;
  opt_in_events_email: boolean;
  opt_in_events_text:  boolean;
  opt_in_newsletter:   boolean;
  member_since:        string | null;
  avatar_url:          string | null;
};

const JTTC_IG = 'https://www.instagram.com/justthetipcigars';
const JTTC_FB = 'https://www.facebook.com/JustTheTipCigar';

const label: React.CSSProperties = {
  display: 'block',
  color: 'var(--color-smoke)',
  fontSize: '0.72rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  marginBottom: '0.4rem',
};

const input: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-charcoal)',
  border: '1px solid var(--color-charcoal-mid)',
  color: 'var(--color-cream)',
  padding: '0.65rem 0.85rem',
  fontSize: '0.9rem',
  outline: 'none',
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

export default function ProfileClient({ profile, userEmail }: { profile: Profile; userEmail: string }) {
  const [saved, setSaved]           = useState(false);
  const [errMsg, setErrMsg]         = useState('');
  const [isPending, startTransition] = useTransition();
  const [avatarSrc, setAvatarSrc]   = useState<string>(profile.avatar_url ?? '/your pic icon.jpg');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarErr, setAvatarErr]   = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    setErrMsg('');
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveProfile(fd);
      if (result?.error) setErrMsg(result.error);
      else setSaved(true);
    });
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarSrc(URL.createObjectURL(file));
    setAvatarErr('');
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await fetch('/api/account/upload-avatar', { method: 'POST', body: fd });
      const result = await res.json();
      if (result?.error) {
        setAvatarErr(result.error);
      } else if (result?.avatarUrl) {
        setAvatarSrc(result.avatarUrl);
      }
    } catch (err: unknown) {
      setAvatarErr(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setAvatarUploading(false);
    }
  }

  const memberDate = profile.member_since
    ? new Date(profile.member_since).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <form onSubmit={handleSubmit}>

      {/* ── Profile Picture ───────────────────────────────────── */}
      <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {/* Circle avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              width: 100, height: 100,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--color-charcoal-mid)',
              background: 'var(--color-charcoal)',
            }}
          >
            <img
              src={avatarSrc}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setAvatarSrc('/your pic icon.jpg')}
            />
          </div>
          {avatarUploading && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(14,12,10,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 20, height: 20, border: '2px solid var(--color-terracotta)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          )}
        </div>

        {/* Upload controls */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '0.55rem 1.25rem',
              background: 'transparent',
              border: '1px solid var(--color-charcoal-mid)',
              color: 'var(--color-cream)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'block',
              marginBottom: '0.5rem',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-terracotta)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-charcoal-mid)')}
          >
            {profile.avatar_url ? 'Change Photo' : 'Upload Photo'}
          </button>
          <p style={{ color: 'var(--color-smoke)', fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>
            Shown on your dashboard. JPG, PNG, or GIF.
          </p>
          {avatarErr && <p style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '0.35rem' }}>{avatarErr}</p>}
        </div>
      </div>

      {/* ── Personal Info ─────────────────────────────────────── */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={sectionHead}>Personal Info</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="grid grid-cols-1 sm:grid-cols-2">

          <div>
            <label style={label}>Full Name</label>
            <input name="full_name" defaultValue={profile.full_name ?? ''} style={input} placeholder="Your full name" />
          </div>

          <div>
            <label style={label}>
              Preferred First Name
              <span style={{ color: 'var(--color-smoke)', fontWeight: 400, marginLeft: '0.5rem', textTransform: 'none', fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                — shown on your welcome screen
              </span>
            </label>
            <input name="preferred_name" defaultValue={profile.preferred_name ?? ''} style={input} placeholder="What should we call you?" />
          </div>

          <div>
            <label style={label}>Full Birthday</label>
            <input name="birthday" type="date" defaultValue={profile.birthday ?? ''} style={input} />
          </div>

          <div>
            <label style={label}>Phone Number</label>
            <input name="phone" type="tel" defaultValue={profile.phone ?? ''} style={input} placeholder="(555) 555-5555" />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label}>
              Preferred Email
              <span style={{ color: 'var(--color-smoke)', fontWeight: 400, marginLeft: '0.5rem', textTransform: 'none', fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                — use the same email you use at the shop
              </span>
            </label>
            <input name="preferred_email" type="email" defaultValue={profile.preferred_email ?? userEmail} style={input} placeholder={userEmail} />
          </div>
        </div>
      </div>

      {/* ── Shipping Address ──────────────────────────────────── */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={sectionHead}>Shipping Address <span style={{ color: 'var(--color-charcoal-light)', fontWeight: 400 }}>(optional — saved for future use)</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="grid grid-cols-1 sm:grid-cols-2">
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label}>Address Line 1</label>
            <input name="address_line1" defaultValue={profile.address_line1 ?? ''} style={input} placeholder="123 Main St" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label}>Address Line 2</label>
            <input name="address_line2" defaultValue={profile.address_line2 ?? ''} style={input} placeholder="Apt, suite, etc." />
          </div>
          <div>
            <label style={label}>City</label>
            <input name="city" defaultValue={profile.city ?? ''} style={input} placeholder="Pittsburgh" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={label}>State</label>
              <input name="state" defaultValue={profile.state ?? ''} style={input} placeholder="PA" maxLength={2} />
            </div>
            <div>
              <label style={label}>ZIP</label>
              <input name="zip" defaultValue={profile.zip ?? ''} style={input} placeholder="15129" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Social ────────────────────────────────────────────── */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={sectionHead}>Social</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="grid grid-cols-1 sm:grid-cols-2">

          <div>
            <label style={label}>Instagram Handle</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-smoke)', fontSize: '0.9rem' }}>@</span>
                <input
                  name="instagram_handle"
                  defaultValue={profile.instagram_handle ?? ''}
                  style={{ ...input, paddingLeft: '1.75rem' }}
                  placeholder="yourhandle"
                />
              </div>
              <a
                href={JTTC_IG}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0 0.85rem',
                  background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Follow Us
              </a>
            </div>
          </div>

          <div>
            <label style={label}>Facebook Handle</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-smoke)', fontSize: '0.9rem' }}>@</span>
                <input
                  name="facebook_handle"
                  defaultValue={profile.facebook_handle ?? ''}
                  style={{ ...input, paddingLeft: '1.75rem' }}
                  placeholder="yourhandle"
                />
              </div>
              <a
                href={JTTC_FB}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0 0.85rem',
                  background: '#1877f2',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Follow Us
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ── Communication Preferences ─────────────────────────── */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={sectionHead}>Communication Preferences</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { name: 'opt_in_events_email', checked: profile.opt_in_events_email, label: 'Event announcements via email' },
            { name: 'opt_in_events_text',  checked: profile.opt_in_events_text,  label: 'Event announcements via text' },
            { name: 'opt_in_newsletter',   checked: profile.opt_in_newsletter,   label: 'Weekly/monthly newsletter' },
          ].map(item => (
            <label key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name={item.name}
                defaultChecked={item.checked}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-terracotta)', cursor: 'pointer' }}
              />
              <span style={{ color: 'var(--color-cream-dark)', fontSize: '0.9rem' }}>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Lounge Membership (read-only) ─────────────────────── */}
      {memberDate && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={sectionHead}>Lounge Membership</div>
          <div style={{
            background: 'var(--color-charcoal)',
            border: '1px solid var(--color-charcoal-mid)',
            padding: '1rem 1.25rem',
            display: 'inline-flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}>
            <span style={{ color: 'var(--color-smoke)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Member Since</span>
            <span style={{ color: 'var(--color-terracotta)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600 }}>{memberDate}</span>
          </div>
        </div>
      )}

      {/* ── Save ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-charcoal-mid)' }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '0.85rem 2.5rem',
            background: isPending ? 'var(--color-charcoal-mid)' : 'var(--color-terracotta)',
            color: 'var(--color-cream)',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: isPending ? 'wait' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {isPending ? 'Saving…' : 'Save Profile'}
        </button>

        {saved && (
          <span style={{ color: 'var(--color-terracotta)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
            ✓ Profile saved
          </span>
        )}
        {errMsg && (
          <span style={{ color: '#e74c3c', fontSize: '0.85rem' }}>{errMsg}</span>
        )}
      </div>

    </form>
  );
}
