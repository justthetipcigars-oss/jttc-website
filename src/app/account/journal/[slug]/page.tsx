import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JournalEntryClient from './JournalEntryClient';
import { fetchAllProducts } from '@/lib/lightspeed';
import { nameToSlug } from '@/lib/slug';

interface Props {
  params: Promise<{ slug: string }>;
}

function parseDescription(desc: string) {
  const wrapper = desc.match(/Wrapper:\s*([^|\n]+)/i)?.[1]?.trim() ?? '';
  const binder  = desc.match(/Binder:\s*([^|\n]+)/i)?.[1]?.trim() ?? '';
  const filler  = desc.match(/Filler:\s*([^|\n]+)/i)?.[1]?.trim() ?? '';
  return { wrapper, binder, filler };
}

export default async function JournalEntryPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account/login');

  // Find existing entry by matching slug of cigar_name
  const { data: allEntries } = await supabase
    .from('cigar_journal')
    .select('*')
    .eq('user_id', user.id);

  const entry = allEntries?.find(e => nameToSlug(e.cigar_name) === slug) ?? null;

  // Fetch revisions if entry exists
  let revisions: Array<{ id: string; saved_at: string; snapshot: Record<string, unknown> }> = [];
  if (entry) {
    const { data: revData } = await supabase
      .from('cigar_journal_revisions')
      .select('id, saved_at, snapshot')
      .eq('journal_id', entry.id)
      .order('saved_at', { ascending: false });
    revisions = revData ?? [];
  }

  // Find matching product in Lightspeed for prefill
  const products = await fetchAllProducts().catch(() => []);
  const product = products.find(p => nameToSlug(p.name) === slug) ?? null;

  const prefill = product ? {
    product_id: product.id,
    cigar_name: product.name,
    brand:      product.brand,
    size:       product.size,
    ...parseDescription(product.description),
  } : null;

  const title = entry?.cigar_name ?? prefill?.cigar_name ?? 'New Entry';

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', paddingTop: '116px' }}>
        <div className="max-w-3xl mx-auto px-6 py-16">

          <a href="/account/journal" style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← Tasting Journal
          </a>

          <div style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Tasting Journal
            </div>
            <h1 className="display" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 600, color: 'var(--color-cream)', lineHeight: 1.2 }}>
              {title}
            </h1>
            {(entry?.brand ?? prefill?.brand) && (
              <div style={{ color: 'var(--color-smoke)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                {entry?.brand ?? prefill?.brand}
              </div>
            )}
          </div>

          <JournalEntryClient entry={entry} prefill={prefill} revisions={revisions} />

        </div>
      </main>
      <Footer />
    </>
  );
}
