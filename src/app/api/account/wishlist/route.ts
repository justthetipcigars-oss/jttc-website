import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('wishlist')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });

  return NextResponse.json(data ?? []);
}

// Toggle: if the (user_id, product_id) pair exists, remove it; otherwise insert.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { product_id, product_name, brand, size, image_url } = body;
  if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 });

  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .maybeSingle();

  if (existing) {
    await supabase.from('wishlist').delete().eq('id', existing.id);
    return NextResponse.json({ hearted: false });
  }

  const { error } = await supabase
    .from('wishlist')
    .insert({ user_id: user.id, product_id, product_name, brand, size, image_url });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ hearted: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  await supabase.from('wishlist').delete().eq('id', id).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}
