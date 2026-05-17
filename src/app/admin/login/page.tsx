'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { landingPathForRole, type Role } from '@/lib/auth-shared';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Auto-redirect if already logged in with any role
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single();
        const role = profile?.role as Role | null | undefined;
        if (role) { router.replace(landingPathForRole(role)); return; }
      }
      setLoading(false);
    });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    setLoading(true);
    const { data: signin, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr || !signin.user) {
      setError('Invalid credentials.');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', signin.user.id).single();
    const role = profile?.role as Role | null | undefined;
    if (!role) {
      setError('Account does not have admin access.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }
    router.push(landingPathForRole(role));
  }

  if (loading) return <main style={{ background: 'var(--color-pitch)', minHeight: '100vh' }} />;

  return (
    <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/images/JTTC-LOGO-CIRCLE-CREAM.png" alt="JTTC" style={{ width: 64, height: 64, margin: '0 auto 1.25rem' }} />
          <h1 style={{ color: 'var(--color-cream)', fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.25rem' }}>Admin</h1>
          <p style={{ color: 'var(--color-smoke)', fontSize: '0.8rem' }}>Just The Tip Cigars</p>
        </div>

        <div style={{ background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)', padding: '2rem' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--color-smoke)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Email
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--color-pitch)', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-cream)', padding: '0.7rem 0.9rem', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--color-smoke)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Password
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--color-pitch)', border: '1px solid var(--color-charcoal-mid)', color: 'var(--color-cream)', padding: '0.7rem 0.9rem', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            {error && <p style={{ color: '#e05555', fontSize: '0.82rem', margin: 0 }}>{error}</p>}

            <button
              type="submit" disabled={loading}
              style={{ marginTop: '0.5rem', padding: '0.85rem', background: 'var(--color-terracotta)', color: 'var(--color-cream)', border: 'none', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
