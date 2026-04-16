import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data, error } = await supabase
      .from('cigar_journal')
      .select('id, product_id, cigar_name, brand, size, overall_rating, date_smoked, updated_at')
      .eq('user_id', user.id)
      .order('overall_rating', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ entries: data ?? [] });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await req.json();
    const { data, error } = await supabase
      .from('cigar_journal')
      .insert({ ...body, user_id: user.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id, ...fields } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Fetch current entry to snapshot
    const { data: current } = await supabase
      .from('cigar_journal')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Save revision (cap at 5 — delete oldest if needed)
    const { data: revisions } = await supabase
      .from('cigar_journal_revisions')
      .select('id, saved_at')
      .eq('journal_id', id)
      .order('saved_at', { ascending: true });

    if ((revisions?.length ?? 0) >= 5) {
      await supabase
        .from('cigar_journal_revisions')
        .delete()
        .eq('id', revisions![0].id);
    }

    await supabase
      .from('cigar_journal_revisions')
      .insert({ journal_id: id, user_id: user.id, snapshot: current });

    // Update entry
    const { data: updated, error } = await supabase
      .from('cigar_journal')
      .update(fields)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
