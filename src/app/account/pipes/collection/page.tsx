import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CollectionClient from './CollectionClient';

export const metadata = { title: 'My Pipe Collection | Just The Tip Cigars' };

export default async function PipeCollectionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account/login');

  const { data: pipes }  = await supabase.from('user_pipes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  const pipeIds = (pipes ?? []).map(p => p.id);
  const { data: photos } = pipeIds.length
    ? await supabase.from('user_pipe_photos').select('*').in('pipe_id', pipeIds)
    : { data: [] };

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', paddingTop: '80px' }}>
        <div className="max-w-6xl mx-auto px-6 py-16">

          <a href="/account/pipes" style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← My Pipes
          </a>

          <div style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Pipe Smoker&apos;s Kit
            </div>
            <h1 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: 'var(--color-cream)', lineHeight: 1.1 }}>
              My Pipe Collection
            </h1>
          </div>

          <CollectionClient pipes={pipes ?? []} photos={photos ?? []} />

        </div>
      </main>
      <Footer />
    </>
  );
}
