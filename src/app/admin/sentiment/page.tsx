import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SentimentClient from './SentimentClient';
import { MOCK_CIGARS } from './mockData';

export const metadata = { title: 'Admin — Customer Sentiment | JTTC' };

export default async function AdminSentimentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  return (
    <main style={{ background: 'var(--color-pitch)', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <SentimentClient cigars={MOCK_CIGARS} />
      </div>
    </main>
  );
}
