import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('humidor')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { product_id, product_name, brand, size, image_url } = body;

  // If already in humidor, increment quantity
  const { data: existing } = await supabase
    .from('humidor')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('humidor')
      .update({ quantity: existing.quantity + 1 })
      .eq('id', existing.id)
      .select()
      .single();
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('humidor')
    .insert({ user_id: user.id, product_id, product_name, brand, size, image_url, quantity: 1 })
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, quantity } = await req.json();

  if (quantity < 1) {
    await supabase.from('humidor').delete().eq('id', id).eq('user_id', user.id);
    return NextResponse.json({ deleted: true });
  }

  const { data } = await supabase
    .from('humidor')
    .update({ quantity })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  await supabase.from('humidor').delete().eq('id', id).eq('user_id', user.id);
  return NextResponse.json({ success: true });
}
