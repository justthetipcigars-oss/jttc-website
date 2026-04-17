import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchAllProducts } from '@/lib/lightspeed';
import { groupByName } from '@/lib/productGroups';
import { nameToSlug } from '@/lib/slug';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductDetailView from '@/components/shop/ProductDetailView';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const products = await fetchAllProducts();
  const groups = groupByName(products);
  const group = groups.find(g => nameToSlug(g.name) === slug);

  if (!group) notFound();

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', paddingTop: '80px' }}>

        {/* Breadcrumb */}
        <div style={{ background: 'var(--color-charcoal)', borderBottom: '1px solid var(--color-charcoal-mid)' }}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2" style={{ fontSize: '0.72rem', color: 'var(--color-smoke)', letterSpacing: '0.1em' }}>
            <Link href="/shop" style={{ color: 'var(--color-smoke)', textDecoration: 'none' }}>
              Shop
            </Link>
            <span style={{ color: 'var(--color-charcoal-light)' }}>›</span>
            <span style={{ color: 'var(--color-cream)' }}>{group.name}</span>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <ProductDetailView group={group} />
        </div>

      </main>
      <Footer />
    </>
  );
}
