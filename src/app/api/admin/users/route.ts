import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const user = await requireRole(['admin']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { data, error } = await admin
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('role', { ascending: true, nullsFirst: false })
    .order('email', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profiles: data ?? [], currentUserId: user.id });
}
