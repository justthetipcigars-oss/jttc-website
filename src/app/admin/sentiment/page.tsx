import { createClient } from '@/lib/supabase/server';
import SentimentClient from './SentimentClient';
import AdminNav from '@/components/admin/AdminNav';
import { aggregateJournal, type JournalRow } from '@/lib/sentiment';
import { requireRoleForPage } from '@/lib/auth';

export const metadata = { title: 'Admin — Customer Sentiment | JTTC' };

export default async function AdminSentimentPage() {
  const { role } = await requireRoleForPage(['admin']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cigar_journal')
    .select('id, user_id, product_id, cigar_name, brand, size, overall_rating, flavor_rating, value_rating, appearance_rating, body, strength, flavor_intensity, flavor_tags, would_try_again, notes, date_smoked, created_at, updated_at');

  const rows = (data ?? []) as Array<JournalRow & { user_id: string | null }>;
  const cigars = aggregateJournal(rows);

  return (
    <main style={{ background: 'var(--color-pitch)', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <AdminNav active="sentiment" role={role} />

        {error && (
          <div style={{
            marginBottom: '1.5rem', padding: '0.85rem 1.1rem',
            background: 'rgba(217,122,94,0.08)', border: '1px solid rgba(217,122,94,0.3)',
            color: '#d97a5e', fontSize: '0.82rem',
          }}>
            Could not load ashtray data: {error.message}. If you see this, the admin read policy may not be set up — run the SQL in <code>scripts/admin_sentiment_rls.sql</code>.
          </div>
        )}

        {cigars.length === 0 && !error ? (
          <EmptyState />
        ) : (
          <SentimentClient cigars={cigars} />
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Admin</div>
          <h1 style={{ color: 'var(--color-cream)', fontSize: '1.6rem', fontWeight: 600 }}>Customer Sentiment</h1>
          <div style={{ color: 'var(--color-smoke)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
            What the Ashtray is telling us about every cigar on the shelf.
          </div>
        </div>
      </div>
      <div style={{
        background: 'var(--color-charcoal)', border: '1px solid var(--color-charcoal-mid)',
        padding: '3rem 2rem', textAlign: 'center',
      }}>
        <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          No Ashtray Entries Yet
        </div>
        <div style={{ color: 'var(--color-cream-dark)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>
          Once members start logging cigars in their Ashtray, this page will aggregate their ratings,
          flavor tags, and notes into per-cigar insights. Check back after the first handful of entries come in.
        </div>
        <div style={{ marginTop: '1.5rem', color: 'var(--color-smoke)', fontSize: '0.78rem' }}>
          Members can start an entry from <code style={{ color: 'var(--color-cream-dark)' }}>/account/ashtray</code>.
        </div>
      </div>
    </div>
  );
}
