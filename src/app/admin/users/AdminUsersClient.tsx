'use client';

import { useMemo, useState } from 'react';
import type { Role } from '@/lib/auth-shared';

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role | null;
  created_at: string | null;
};

const ROLE_OPTIONS: { value: Role | ''; label: string }[] = [
  { value: '',            label: 'No access' },
  { value: 'tobacconist', label: 'Tobacconist' },
  { value: 'manager',     label: 'Manager' },
  { value: 'admin',       label: 'Admin' },
];

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin', manager: 'Manager', tobacconist: 'Tobacconist',
};

const inp: React.CSSProperties = {
  background: 'var(--color-pitch)',
  border: '1px solid var(--color-charcoal-mid)',
  color: 'var(--color-cream)',
  padding: '0.45rem 0.65rem',
  fontSize: '0.82rem',
  outline: 'none',
  fontFamily: 'inherit',
  cursor: 'pointer',
};

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

export default function AdminUsersClient({
  initialProfiles,
  currentUserId,
  loadError,
}: {
  initialProfiles: Profile[];
  currentUserId: string;
  loadError: string | null;
}) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [search, setSearch]     = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [msg, setMsg]           = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { admin: 0, manager: 0, tobacconist: 0, none: 0 };
    profiles.forEach(p => {
      if (p.role === 'admin') c.admin++;
      else if (p.role === 'manager') c.manager++;
      else if (p.role === 'tobacconist') c.tobacconist++;
      else c.none++;
    });
    return c;
  }, [profiles]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(p =>
      (p.email || '').toLowerCase().includes(q) ||
      (p.full_name || '').toLowerCase().includes(q),
    );
  }, [profiles, search]);

  async function changeRole(id: string, newRole: Role | null) {
    setPendingId(id);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || `HTTP ${res.status}`);
        return;
      }
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p));
      const target = profiles.find(p => p.id === id);
      const label = newRole ? ROLE_LABEL[newRole] : 'no access';
      setMsg(`Updated ${target?.email ?? 'user'} → ${label}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Admin</div>
        <h1 style={{ color: 'var(--color-cream)', fontSize: '1.6rem', fontWeight: 600 }}>Users</h1>
        <div style={{ color: 'var(--color-smoke)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
          Assign roles. Admins can do everything; Managers see Dashboard / Events / Inventory; Tobacconists see only the Tobacconist's View.
        </div>
      </div>

      {loadError && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(217,122,94,0.1)', border: '1px solid rgba(217,122,94,0.3)', color: '#d97a5e', fontSize: '0.82rem' }}>
          Could not load profiles: {loadError}
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.3)', color: '#e05555', fontSize: '0.82rem' }}>
          Error: {error}
        </div>
      )}

      {msg && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(196,98,45,0.12)', border: '1px solid rgba(196,98,45,0.3)', color: 'var(--color-terracotta)', fontSize: '0.82rem' }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inp, flex: 1, minWidth: 240, padding: '0.6rem 0.85rem', cursor: 'text' }}
        />
        <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--color-cream)' }}>{profiles.length}</span> total ·{' '}
          <span style={{ color: 'var(--color-terracotta)' }}>{counts.admin}</span> admin ·{' '}
          <span style={{ color: 'var(--color-cream-dark)' }}>{counts.manager}</span> manager ·{' '}
          <span style={{ color: 'var(--color-cream-dark)' }}>{counts.tobacconist}</span> tobacconist ·{' '}
          <span>{counts.none}</span> none
        </div>
      </div>

      <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', overflowX: 'auto' }}>
        {visible.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-smoke)', fontSize: '0.85rem' }}>
            No matches.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-charcoal-mid)' }}>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={{ ...th, width: 200 }}>Role</th>
                <th style={{ ...th, width: 130 }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(p => {
                const isSelf = p.id === currentUserId;
                const isPending = pendingId === p.id;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={td}>
                      <div style={{ color: 'var(--color-cream)', fontWeight: 500 }}>
                        {p.full_name || <span style={{ color: 'var(--color-smoke)', fontStyle: 'italic' }}>(no name)</span>}
                      </div>
                      {isSelf && (
                        <div style={{ color: 'var(--color-terracotta)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
                          You
                        </div>
                      )}
                    </td>
                    <td style={{ ...td, color: 'var(--color-cream-dark)', fontSize: '0.8rem' }}>
                      {p.email || <span style={{ color: 'var(--color-smoke)' }}>—</span>}
                    </td>
                    <td style={td}>
                      <select
                        value={p.role ?? ''}
                        disabled={isSelf || isPending}
                        onChange={e => {
                          const v = e.target.value;
                          changeRole(p.id, v === '' ? null : (v as Role));
                        }}
                        style={{
                          ...inp,
                          width: '100%',
                          opacity: isSelf || isPending ? 0.55 : 1,
                          cursor: isSelf || isPending ? 'not-allowed' : 'pointer',
                          borderColor: p.role === 'admin' ? 'var(--color-terracotta)' : 'var(--color-charcoal-mid)',
                        }}
                        title={isSelf ? 'You cannot change your own role' : ''}
                      >
                        {ROLE_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ ...td, color: 'var(--color-smoke)', fontSize: '0.78rem' }}>
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
