import { fetchAllProducts, LightspeedProduct } from '@/lib/lightspeed';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShopClient from '@/components/shop/ShopClient';

export const revalidate = 3600;

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
