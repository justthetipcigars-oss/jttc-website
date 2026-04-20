import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { fetchAllProducts } from '@/lib/lightspeed';
import { nameToSlug } from '@/lib/slug';
import { parsePipeSpecs } from '@/lib/pipeSpecs';

export const dynamic = 'force-dynamic';

export default async function AddFromCatalogPage({ searchParams }: { searchParams: Promise<{ product_slug?: string }> }) {
  const { product_slug } = await searchParams;
  if (!product_slug) redirect('/account/pipes/collection');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account/login');

  const products = await fetchAllProducts().catch(() => []);
  const product = products.find(p => p.isPipe && nameToSlug(p.name) === product_slug);
  if (!product) redirect('/account/pipes/collection');

  const specs = parsePipeSpecs(product.description);

  const { data: pipe, error } = await supabase
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

  if (error || !pipe) redirect('/account/pipes/collection');

  redirect(`/account/pipes/collection/${pipe.id}`);
}
