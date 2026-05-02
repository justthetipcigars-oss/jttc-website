import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PipeDetailView from '@/components/pipes/PipeDetailView';
import { fetchAllPipesEver } from '@/lib/lightspeed';
import { groupByName } from '@/lib/productGroups';
import { nameToSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';

export default async function PipeCatalogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account/login');

  const allPipes = await fetchAllPipesEver().catch(() => []);
  const pipes = allPipes.filter(p => !p.isDeleted && (p.price ?? 0) > 0);
  const group = groupByName(pipes).find(g => nameToSlug(g.name) === slug);
  if (!group) notFound();

  const { data: ownedRows } = await supabase
    .from('user_pipes')
    .select('product_id')
    .eq('user_id', user.id)
    .not('product_id', 'is', null);
  const ownedIds = new Set((ownedRows ?? []).map(r => r.product_id as string));
  const inCollection = group.variants.some(v => ownedIds.has(v.id));

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', paddingTop: '80px' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <a href="/account/pipes/catalog" style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← Pipe Catalog
          </a>
          <div style={{ marginTop: '1.5rem' }}>
            <PipeDetailView group={group} inCollection={inCollection} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
