import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import SalesReport from '@/components/dashboard/SalesReport';

export const metadata = { title: 'Admin — JTT Dashboard | JTTC' };

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  return (
    <main style={{ background: 'var(--color-pitch)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <AdminNav active="dashboard" />
        <SalesReport />
      </div>
    </main>
  );
}
