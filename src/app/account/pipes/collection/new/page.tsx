import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NewCustomPipeClient from './NewCustomPipeClient';

export const metadata = { title: 'Add Custom Pipe | Just The Tip Cigars' };

export default async function NewCustomPipePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account/login');

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', paddingTop: '80px' }}>
        <div className="max-w-2xl mx-auto px-6 py-16">

          <a href="/account/pipes/collection" style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← My Pipe Rack
          </a>

          <div style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Pipe Smoker&apos;s Kit
            </div>
            <h1 className="display" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 600, color: 'var(--color-cream)', lineHeight: 1.2 }}>
              Add Custom Pipe
            </h1>
            <p style={{ color: 'var(--color-smoke)', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
              Adding a pipe we don&apos;t carry. Upload a photo, set the basics, and continue filling in details after.
            </p>
          </div>

          <NewCustomPipeClient />

        </div>
      </main>
      <Footer />
    </>
  );
}
