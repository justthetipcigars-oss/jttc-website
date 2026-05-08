import { redirect } from 'next/navigation';
import { getCurrentRole, landingPathForRole } from '@/lib/auth';

export default async function AdminPage() {
  const current = await getCurrentRole();
  if (!current) redirect('/admin/login');
  redirect(landingPathForRole(current.role));
}
