import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { roleSatisfiesAny, landingPathForRole, type Role } from './auth-shared';

export { roleSatisfies, roleSatisfiesAny, landingPathForRole, type Role } from './auth-shared';

export async function getCurrentRole(): Promise<{ user: User; role: Role } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role as Role | null | undefined;
  if (!role) return null;
  return { user, role };
}

// For API routes — returns User on success or null on forbidden. Caller writes the 403 response.
export async function requireRole(allowed: Role[]): Promise<User | null> {
  const current = await getCurrentRole();
  if (!current) return null;
  return roleSatisfiesAny(current.role, allowed) ? current.user : null;
}

// For pages/layouts. Redirects internally on failure (no role -> /admin/login,
// wrong role -> user's landing page). Returns {user, role} on success.
export async function requireRoleForPage(allowed: Role[]): Promise<{ user: User; role: Role }> {
  const current = await getCurrentRole();
  if (!current) redirect('/admin/login');
  if (!roleSatisfiesAny(current.role, allowed)) redirect(landingPathForRole(current.role));
  return current;
}
