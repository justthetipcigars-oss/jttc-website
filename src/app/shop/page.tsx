import { fetchAllProducts, LightspeedProduct } from '@/lib/lightspeed';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShopClient from '@/components/shop/ShopClient';

export const revalidate = 3600;

export const metadata = {
  title: 'Shop | Just The Tip Cigars',
  description: 'Boutique and hard-to-find cigars from the world\'s top brands. Just The Tip Cigars carries premium singles and boxes with live inventory updated in real time from our South Park, PA lounge.',
  openGraph: {
    title: 'Shop | Just The Tip Cigars',
    description: 'Boutique and hard-to-find cigars from the world\'s top brands. Live inventory from our South Park, PA lounge.',
    url: 'https://www.justthetipcigars.com/shop',
    images: [{ url: '/images/icon-humidor.png', width: 1200, height: 630, alt: 'Just The Tip Cigars Humidor' }],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Shop | Just The Tip Cigars',
    description: 'Boutique and hard-to-find cigars from the world\'s top brands. Live inventory from our South Park, PA lounge.',
    images: ['/images/icon-humidor.png'],
  },
};

export default async function ShopPage() {
  let products: LightspeedProduct[] = [];
  let error = false;

  try {
    products = await fetchAllProducts();
  } catch {
    error = true;
  }

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', paddingTop: '80px' }}>

        {/* Header */}
        <div style={{ background: 'var(--color-charcoal)', borderBottom: '1px solid var(--color-charcoal-mid)' }}>
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              The Humidor
            </div>
            <h1
              className="display"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: 'var(--color-cream)', lineHeight: 1.1 }}
            >
              Shop the Full Selection
            </h1>
          </div>
        </div>

        {error ? (
          <div className="max-w-7xl mx-auto px-6 py-24 text-center">
            <p style={{ color: 'var(--color-smoke)' }}>Unable to load products right now. Please try again shortly.</p>
          </div>
        ) : (
          <ShopClient products={products} />
        )}
      </main>
      <Footer />
    </>
  );
}
