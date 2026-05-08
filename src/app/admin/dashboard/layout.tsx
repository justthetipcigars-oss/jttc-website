import AdminNav from '@/components/admin/AdminNav';
import DashboardSubNav from '@/components/dashboard/DashboardSubNav';
import NotesPanel from '@/components/dashboard/NotesPanel';
import { requireRoleForPage } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireRoleForPage(['tobacconist']);

  return (
    <main style={{ background: 'var(--color-pitch)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <AdminNav active="dashboard" role={role} />
        <DashboardSubNav role={role} />
        {children}
      </div>
      <NotesPanel />
    </main>
  );
}
