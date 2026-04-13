'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const supabase = createClient();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/account/login');
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        background: 'transparent',
        border: '1px solid var(--color-charcoal-mid)',
        color: 'var(--color-smoke)',
        padding: '0.5rem 1.25rem',
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-terracotta)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-charcoal-mid)')}
    >
      Sign Out
    </button>
  );
}
