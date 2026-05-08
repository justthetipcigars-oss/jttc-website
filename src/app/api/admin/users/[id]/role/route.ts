import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { requireRole, type Role } from '@/lib/auth';

const VALID_ROLES: Role[] = ['admin', 'manager', 'tobacconist'];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(['admin']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const newRole = body.role as Role | null | undefined;

  if (newRole !== null && (typeof newRole !== 'string' || !VALID_ROLES.includes(newRole as Role))) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // Prevent admin from removing their own admin access (lockout protection).
  if (id === user.id && newRole !== 'admin') {
    return NextResponse.json(
      { error: 'You cannot remove your own admin role. Have another admin do it.' },
      { status: 400 },
    );
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { data, error } = await admin
    .from('profiles')
    .update({ role: newRole })
    .eq('id', id)
    .select('id, email, full_name, role')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)  return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  return NextResponse.json({ profile: data });
}
