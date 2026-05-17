import { getEvents } from '@/lib/events';
import AdminEventsClient from './AdminEventsClient';
import AdminNav from '@/components/admin/AdminNav';
import { requireRoleForPage } from '@/lib/auth';

export const metadata = { title: 'Admin — Events | JTTC' };

export default async function AdminEventsPage() {
  const { role } = await requireRoleForPage(['manager']);
  const events = await getEvents();

  return (
    <main style={{ background: 'var(--color-pitch)', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <AdminNav active="events" role={role} />
        <AdminEventsClient initialEvents={events} />
      </div>
    </main>
  );
}
