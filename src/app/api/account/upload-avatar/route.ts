import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const MAX_SIZE     = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const formData = await req.formData();
    const file     = formData.get('avatar') as File;

    if (!file || file.size === 0)          return NextResponse.json({ error: 'No file provided' },         { status: 400 });
    if (file.size > MAX_SIZE)              return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 });
    if (!ALLOWED_MIME.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' },        { status: 400 });

    const MIME_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
    const ext    = MIME_EXT[file.type] ?? 'jpg';
    const path   = `${user.id}/avatar.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
    const { error: uploadError } = await admin.storage.from('Avatars').upload(path, buffer, { upsert: true, contentType: file.type });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: { publicUrl } } = admin.storage.from('Avatars').getPublicUrl(path);
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    const { error: dbError } = await supabase.from('profiles').upsert({ id: user.id, avatar_url: avatarUrl });
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

    return NextResponse.json({ avatarUrl });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 });
  }
}
