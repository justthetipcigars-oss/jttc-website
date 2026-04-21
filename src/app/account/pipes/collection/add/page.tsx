import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { fetchAllPipesEver } from '@/lib/lightspeed';
import { nameToSlug } from '@/lib/slug';
import { parsePipeSpecs } from '@/lib/pipeSpecs';

export const dynamic = 'force-dynamic';

export default async function AddFromCatalogPage({ searchParams }: { searchParams: Promise<{ product_slug?: string; fallback_name?: string }> }) {
  const { product_slug, fallback_name } = await searchParams;
  if (!product_slug) redirect('/account/pipes/collection');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account/login');

  const pipes = await fetchAllPipesEver().catch(() => []);
  const product = pipes.find(p => nameToSlug(p.name) === product_slug);

  // Catalog match — create pipe with full prefill
  if (product) {
    const specs = parsePipeSpecs(product.description);
    const { data: pipe } = await supabase
      .from('user_pipes')
      .insert({
        user_id: user.id,
        product_id: product.id,
        pipe_name: product.name,
        brand: product.brand,
        sub_category: product.category || null,
        status: 'Active',
        stock_image_url: product.imageUrl,
        ...specs,
      })
      .select()
      .single();

    if (!pipe) redirect('/account/pipes/collection');
    redirect(`/account/pipes/collection/${pipe.id}`);
  }

  // No catalog match — create a bare entry from the fallback name (from purchase history)
  if (!fallback_name) redirect('/account/pipes/collection');

  const { data: pipe } = await supabase
    .from('user_pipes')
    .insert({
      user_id: user.id,
      pipe_name: fallback_name,
      brand: 'Unknown',
      sub_category: null,
      status: 'Active',
    })
    .select()
    .single();

  if (!pipe) redirect('/account/pipes/collection');
  redirect(`/account/pipes/collection/${pipe.id}`);
}
