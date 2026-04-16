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

    if (error) return NextResponse.json({ error: 'Failed to load journal' }, { status: 500 });

    return NextResponse.json({ entries: data ?? [] });
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
    const {
      product_id, cigar_name, brand, size, wrapper, binder, filler,
      date_smoked, body: bodyVal, flavor_intensity, strength, flavor_tags,
      notes, appearance_rating, value_rating, flavor_rating, overall_rating,
      band_photo_url, would_try_again,
    } = body;
    const { data, error } = await supabase
      .from('cigar_journal')
      .insert({
        user_id: user.id,
        product_id, cigar_name, brand, size, wrapper, binder, filler,
        date_smoked, body: bodyVal, flavor_intensity, strength, flavor_tags,
        notes, appearance_rating, value_rating, flavor_rating, overall_rating,
        band_photo_url, would_try_again,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: 'Failed to save journal entry' }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const raw = await req.json();
    const { id } = raw;
    const {
      product_id, cigar_name, brand, size, wrapper, binder, filler,
      date_smoked, body: bodyVal, flavor_intensity, strength, flavor_tags,
      notes, appearance_rating, value_rating, flavor_rating, overall_rating,
      band_photo_url, would_try_again,
    } = raw;
    const fields = {
      product_id, cigar_name, brand, size, wrapper, binder, filler,
      date_smoked, body: bodyVal, flavor_intensity, strength, flavor_tags,
      notes, appearance_rating, value_rating, flavor_rating, overall_rating,
      band_photo_url, would_try_again,
    };
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

    if (error) return NextResponse.json({ error: 'Failed to update journal entry' }, { status: 500 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
