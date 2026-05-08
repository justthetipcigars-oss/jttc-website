import SalesReport from '@/components/dashboard/SalesReport';
import { requireRoleForPage } from '@/lib/auth';

export const metadata = { title: 'Admin — JTT Dashboard | JTTC' };

export default async function AdminDashboardPage() {
  await requireRoleForPage(['manager']);
  return <SalesReport />;
}
