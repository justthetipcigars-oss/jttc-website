import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HistoryClient from './HistoryClient';

export const metadata = { title: 'Purchase History | Just The Tip Cigars' };

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account/login');

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', paddingTop: '80px' }}>
        <div className="max-w-4xl mx-auto px-6 py-16">

          <a href="/account/dashboard" style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← Aficionado&apos;s Corner
          </a>

          <div style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Aficionado&apos;s Corner
            </div>
            <h1 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: 'var(--color-cream)', lineHeight: 1.1 }}>
              Purchase History
            </h1>
          </div>

          <HistoryClient />

        </div>
      </main>
      <Footer />
    </>
  );
}
