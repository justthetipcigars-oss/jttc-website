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

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: pipes, error } = await supabase
      .from('user_pipes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'Failed to load pipes' }, { status: 500 });

    const ids = (pipes ?? []).map(p => p.id);
    const { data: photos } = ids.length
      ? await supabase.from('user_pipe_photos').select('*').in('pipe_id', ids)
      : { data: [] };

    return NextResponse.json({ pipes: pipes ?? [], photos: photos ?? [] });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await req.json();
    if (!body.pipe_name || !body.brand) {
      return NextResponse.json({ error: 'Name and brand are required' }, { status: 400 });
    }

    const fields = pickFields(body);
    const { data, error } = await supabase
      .from('user_pipes')
      .insert({ user_id: user.id, ...fields })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
