import { createClient as createAdminClient } from '@supabase/supabase-js';
import AdminNav from '@/components/admin/AdminNav';
import AdminUsersClient from './AdminUsersClient';
import { requireRoleForPage } from '@/lib/auth';

export const metadata = { title: 'Admin — Users | JTTC' };

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'manager' | 'tobacconist' | null;
  created_at: string | null;
};

export default async function AdminUsersPage() {
  const { user, role } = await requireRoleForPage(['admin']);

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { data, error } = await admin
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('role', { ascending: true, nullsFirst: false })
    .order('email', { ascending: true });

  const profiles = (data ?? []) as ProfileRow[];

  return (
    <main style={{ background: 'var(--color-pitch)', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <AdminNav active="users" role={role} />
        <AdminUsersClient initialProfiles={profiles} currentUserId={user.id} loadError={error?.message ?? null} />
      </div>
    </main>
  );
}
