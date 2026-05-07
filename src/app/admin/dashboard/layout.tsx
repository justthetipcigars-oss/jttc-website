import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import DashboardSubNav from '@/components/dashboard/DashboardSubNav';
import NotesPanel from '@/components/dashboard/NotesPanel';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  return (
    <main style={{ background: 'var(--color-pitch)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <AdminNav active="dashboard" />
        <DashboardSubNav />
        {children}
      </div>
      <NotesPanel />
    </main>
  );
}
