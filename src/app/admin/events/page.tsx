import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getEvents } from '@/lib/events';
import AdminEventsClient from './AdminEventsClient';
import AdminNav from '@/components/admin/AdminNav';

export const metadata = { title: 'Admin — Events | JTTC' };

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const events = await getEvents();

  return (
    <main style={{ background: 'var(--color-pitch)', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <AdminNav active="events" />
        <AdminEventsClient initialEvents={events} />
      </div>
    </main>
  );
}
