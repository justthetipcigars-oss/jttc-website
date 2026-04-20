import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const MAX_SIZE     = 5 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const formData = await req.formData();
    const file     = formData.get('photo') as File;
    const pipeId   = formData.get('pipe_id') as string;
    const makePrimary = formData.get('primary') === '1';

    if (!file || file.size === 0)          return NextResponse.json({ error: 'No file provided' },          { status: 400 });
    if (file.size > MAX_SIZE)              return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 });
    if (!ALLOWED_MIME.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' },         { status: 400 });

    const MIME_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
    const ext          = MIME_EXT[file.type] ?? 'jpg';
    const safePipeId   = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pipeId ?? '') ? pipeId : 'new';
    const path         = `${user.id}/${safePipeId}/${Date.now()}.${ext}`;
    const buffer       = Buffer.from(await file.arrayBuffer());

    const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
    const { error: uploadError } = await admin.storage.from('pipe-photos').upload(path, buffer, { upsert: true, contentType: file.type });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: { publicUrl } } = admin.storage.from('pipe-photos').getPublicUrl(path);
    const url = `${publicUrl}?t=${Date.now()}`;

    // If this is for an existing pipe, insert photo record
    if (safePipeId !== 'new') {
      // Verify user owns this pipe
      const { data: pipe } = await supabase.from('user_pipes').select('id').eq('id', safePipeId).eq('user_id', user.id).single();
      if (!pipe) return NextResponse.json({ error: 'Pipe not found' }, { status: 404 });

      if (makePrimary) {
        await supabase.from('user_pipe_photos').update({ is_primary: false }).eq('pipe_id', safePipeId);
      }

      const { data: photo, error: insertError } = await supabase
        .from('user_pipe_photos')
        .insert({ pipe_id: safePipeId, user_id: user.id, url, is_primary: makePrimary })
        .select()
        .single();

      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
      return NextResponse.json({ url, photo });
    }

    // "new" path — return URL so custom-pipe creation can attach it after the pipe row exists
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 });
  }
}
