import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PipesCards from './PipesCards';

export const metadata = { title: 'My Pipes | Just The Tip Cigars' };

export default async function PipesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account/login');

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', paddingTop: '80px' }}>
        <div className="max-w-5xl mx-auto px-6 py-16">

          <div style={{ marginBottom: '2.5rem' }}>
            <a href="/account/dashboard" style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
              ← Aficionado&apos;s Corner
            </a>
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem', marginTop: '1.5rem' }}>
              Pipe Smoker&apos;s Kit
            </div>
            <h1 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: 'var(--color-cream)', lineHeight: 1.1 }}>
              My Pipes
            </h1>
          </div>

          <PipesCards />

        </div>
      </main>
      <Footer />
    </>
  );
}
