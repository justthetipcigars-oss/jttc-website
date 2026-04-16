import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('photo') as File;
    const journalId = formData.get('journal_id') as string;

    if (!file || file.size === 0) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/${journalId ?? 'new'}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const { error: uploadError } = await admin.storage
      .from('band-photos')
      .upload(path, buffer, { upsert: true, contentType: file.type });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: { publicUrl } } = admin.storage.from('band-photos').getPublicUrl(path);

    return NextResponse.json({ url: `${publicUrl}?t=${Date.now()}` });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 });
  }
}
