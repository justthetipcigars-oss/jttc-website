import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const FIELDS = [
  'product_id', 'pipe_name', 'brand', 'sub_category',
  'acquisition_source', 'date_purchased', 'price_paid', 'estimated_value',
  'status', 'rotation_frequency',
  'dedicated_tobacco_product_id', 'dedicated_tobacco_name',
  'length', 'weight', 'bowl_height', 'chamber_depth', 'chamber_diameter',
  'outside_diameter', 'stem_material', 'filter', 'shape', 'finish', 'material', 'country',
  'notes', 'stock_image_url',
] as const;

type PipeField = typeof FIELDS[number];

function pickFields(body: Record<string, unknown>): Partial<Record<PipeField, unknown>> {
  const out: Partial<Record<PipeField, unknown>> = {};
  for (const k of FIELDS) {
    if (k in body) out[k] = body[k] === '' ? null : body[k];
  }
  return out;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await req.json();
    const fields = pickFields(body);

    const { data, error } = await supabase
      .from('user_pipes')
      .update(fields)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data)  return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { error } = await supabase
      .from('user_pipes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
