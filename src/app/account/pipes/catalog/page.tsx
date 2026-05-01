import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CatalogClient from './CatalogClient';
import { fetchAllProducts } from '@/lib/lightspeed';
import { groupByName } from '@/lib/productGroups';

export const metadata = { title: 'Pipe Catalog | Just The Tip Cigars' };
export const dynamic = 'force-dynamic';

export default async function PipeCatalogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account/login');

  const products = await fetchAllProducts().catch(() => []);
  const pipes = products.filter(p => p.isPipe);
  const groups = groupByName(pipes);

  // Which product IDs are already in this user's collection (hide add button)
  const { data: ownedRows } = await supabase
    .from('user_pipes')
    .select('product_id')
    .eq('user_id', user.id)
    .not('product_id', 'is', null);

  const ownedIds = new Set((ownedRows ?? []).map(r => r.product_id as string));

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
              Pipe Catalog
            </h1>
            <p style={{ color: 'var(--color-smoke)', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: 1.6, maxWidth: 640 }}>
              Every pipe we&apos;ve carried. Wishlist any item or add it straight to your collection.
            </p>
          </div>

          <CatalogClient groups={groups} ownedIds={Array.from(ownedIds)} />

        </div>
      </main>
      <Footer />
    </>
  );
}
