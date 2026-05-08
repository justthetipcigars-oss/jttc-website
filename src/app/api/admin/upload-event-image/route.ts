import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { requireRole } from '@/lib/auth';

const MAX_SIZE     = 10 * 1024 * 1024; // 10 MB — posters can be larger
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  const user = await requireRole(['manager']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const form = await req.formData();
  const file = form.get('image') as File | null;

  if (!file || file.size === 0)          return NextResponse.json({ error: 'No file provided' },          { status: 400 });
  if (file.size > MAX_SIZE)              return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 });
  if (!ALLOWED_MIME.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' },         { status: 400 });

  const MIME_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
  const ext  = MIME_EXT[file.type] ?? 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  const { error } = await admin.storage.from('event-images').upload(path, file, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = admin.storage.from('event-images').getPublicUrl(path);
  return NextResponse.json({ url: publicUrl });
}
