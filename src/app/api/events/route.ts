import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getEvents, addEvent } from '@/lib/events';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  return profile?.is_admin ? user : null;
}

export async function GET() {
  const events = await getEvents();
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const event = await addEvent(body);
  return NextResponse.json(event, { status: 201 });
}
