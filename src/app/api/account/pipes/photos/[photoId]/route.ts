import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ photoId: string }> }) {
  try {
    const { photoId } = await ctx.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await req.json();
    if (body.is_primary === true) {
      const { data: photo } = await supabase
        .from('user_pipe_photos')
        .select('pipe_id')
        .eq('id', photoId)
        .eq('user_id', user.id)
        .single();

      if (!photo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      await supabase.from('user_pipe_photos').update({ is_primary: false }).eq('pipe_id', photo.pipe_id);
      const { data, error } = await supabase
        .from('user_pipe_photos')
        .update({ is_primary: true })
        .eq('id', photoId)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: 'Unsupported update' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ photoId: string }> }) {
  try {
    const { photoId } = await ctx.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { error } = await supabase
      .from('user_pipe_photos')
      .delete()
      .eq('id', photoId)
      .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
