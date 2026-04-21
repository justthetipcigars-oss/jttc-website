import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PipeEditClient from './PipeEditClient';
import { fetchAllProducts } from '@/lib/lightspeed';

export const metadata = { title: 'Pipe Details | Just The Tip Cigars' };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account/login');

  const { data: pipe } = await supabase
    .from('user_pipes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!pipe) notFound();

  const { data: photos } = await supabase
    .from('user_pipe_photos')
    .select('*')
    .eq('pipe_id', id)
    .order('created_at', { ascending: true });

  // Pipe tobacco options for the dedicated-tobacco picker
  const allProducts = await fetchAllProducts().catch(() => []);
  const tobaccoOptions = allProducts
    .filter(p => p.isPipeTobacco)
    .map(p => ({ id: p.id, name: p.name, brand: p.brand }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', paddingTop: '80px' }}>
        <div className="max-w-4xl mx-auto px-6 py-16">

          <a href="/account/pipes/collection" style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← My Pipe Rack
          </a>

          <div style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {pipe.brand}
            </div>
            <h1 className="display" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 600, color: 'var(--color-cream)', lineHeight: 1.2 }}>
              {pipe.pipe_name}
            </h1>
          </div>

          <PipeEditClient pipe={pipe} photos={photos ?? []} tobaccoOptions={tobaccoOptions} />

        </div>
      </main>
      <Footer />
    </>
  );
}
