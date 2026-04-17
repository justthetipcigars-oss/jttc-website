import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchAllProducts } from '@/lib/lightspeed';

export const revalidate = 3600;

export const metadata = {
  title: 'Our Brands | Just The Tip Cigars',
  description: 'Browse the premium cigar brands carried at Just The Tip Cigars in South Park Township, PA. Hand-selected lines from the world\'s top manufacturers.',
  openGraph: {
    title: 'Our Brands | Just The Tip Cigars',
    description: 'Hand-selected premium cigar brands from our South Park Township humidor.',
    url: 'https://www.justthetipcigars.com/brands',
    images: [{ url: '/images/cowboy-wb.png', width: 1200, height: 630, alt: 'Just The Tip Cigars' }],
  },
};

// Local brand logos — transparent PNGs, preferred over Lightspeed product images
const BRAND_LOGOS: Record<string, string> = {
  'AJ Fernandez':               '/images/brands/aj-fernandez.png',
  'AVO':                        '/images/brands/avo.png',
  'Adventura':                  '/images/brands/adventura.png',
  'All Saints':                 '/images/brands/all-saints.png',
  'Baccarat':                   '/images/brands/baccarat.png',
  'Black Label Trading Company':'/images/brands/black-label-trading-company.png',
  'Camacho':                    '/images/brands/camacho.png',
  'Casa Cuevas':                '/images/brands/casa-cuevas.png',
  'Dunbarton Tobacco & Trust':  '/images/brands/dunbarton-tobacco-trust.png',
  'Emilio':                     '/images/brands/emilio.png',
  'Ferio Tego':                 '/images/brands/ferio-tego.png',
  'Leaning House':              '/images/brands/leaning-house.png',
  'Line Of Duty':               '/images/brands/line-of-duty.png',
  'Oscar Valladeres':           '/images/brands/oscar-valladares.png',
  'Patina':                     '/images/brands/patina.png',
  'Rocky Patel':                '/images/brands/rocky-patel.png',
  'Zino':                       '/images/brands/zino.png',
  'Aganorsa':                   '/images/brands/aganorsa.svg',
  'Aladino':                    '/images/brands/aladino.png',
  'Drew Estate':                '/images/brands/drew-estate.png',
  'Kristoff':                   '/images/brands/kristoff.png',
  'Perdomo':                    '/images/brands/perdomo.png',
  'Romaraft':                   '/images/brands/romacraft.png',
  'Tatascan':                   '/images/brands/tatascan.png',
};

type BrandSummary = {
  name: string;
  productCount: number;
  imageUrl: string | null;
};

export default async function BrandsPage() {
  let brands: BrandSummary[] = [];

  try {
    const products = await fetchAllProducts();
    const cigarProducts = products.filter(p => p.isCigar && p.brand && p.brand.trim() && p.stockAmount > 0);

    // Build brand map: name → { count, best image }
    const map = new Map<string, { count: number; imageUrl: string | null }>();
    for (const p of cigarProducts) {
      const b = p.brand.trim();
      const existing = map.get(b);
      if (!existing) {
        map.set(b, { count: 1, imageUrl: p.imageUrl });
      } else {
        existing.count += 1;
        // Prefer a product that has an image
        if (!existing.imageUrl && p.imageUrl) existing.imageUrl = p.imageUrl;
      }
    }

    brands = [...map.entries()]
      .map(([name, { count, imageUrl }]) => ({
        name,
        productCount: count,
        imageUrl: BRAND_LOGOS[name] ?? imageUrl,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    // Fall through to empty state
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
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: 'var(--color-cream)', lineHeight: 1.1, marginBottom: '0.75rem' }}
            >
              Our Brands
            </h1>
            <p style={{ color: 'var(--color-smoke)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: '520px' }}>
              Every line in our humidor is hand-selected. Click any brand to browse what&apos;s in stock.
            </p>
          </div>
        </div>

        {/* Brand grid */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          {brands.length === 0 ? (
            <div className="py-24 text-center">
              <p style={{ color: 'var(--color-smoke)' }}>Unable to load brands right now. Please try again shortly.</p>
              <Link
                href="/shop"
                style={{ color: 'var(--color-terracotta)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-block', marginTop: '1.5rem' }}
              >
                Browse the Full Shop →
              </Link>
            </div>
          ) : (
            <>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px"
                style={{ background: 'var(--color-charcoal-mid)' }}
              >
                {brands.map(brand => (
                  <Link
                    key={brand.name}
                    href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                    className="group flex flex-col items-center justify-center text-center transition-colors"
                    style={{
                      background: 'var(--color-charcoal)',
                      padding: '2rem 1.25rem',
                      textDecoration: 'none',
                      minHeight: '140px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{ background: 'rgba(196,98,45,0.06)' }}
                    />

                    {/* Brand image if available */}
                    {brand.imageUrl ? (
                      <div className="relative mb-3" style={{ width: 64, height: 64, flexShrink: 0 }}>
                        <Image
                          src={brand.imageUrl}
                          alt={brand.name}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div
                        className="mb-3 flex items-center justify-center"
                        style={{
                          width: 56,
                          height: 56,
                          background: 'var(--color-charcoal-mid)',
                          border: '1px solid var(--color-charcoal-light)',
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ color: 'var(--color-terracotta)', fontSize: '1.1rem' }}>🍂</span>
                      </div>
                    )}

                    <div
                      className="font-semibold leading-tight"
                      style={{
                        color: 'var(--color-cream)',
                        fontSize: '0.82rem',
                        letterSpacing: '0.04em',
                        marginBottom: '0.35rem',
                        transition: 'color 0.2s',
                      }}
                    >
                      {brand.name}
                    </div>
                    <div style={{ color: 'var(--color-smoke)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {brand.productCount} in stock
                    </div>

                    {/* Arrow on hover */}
                    <div
                      className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem' }}
                    >
                      →
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-10 text-center">
                <Link
                  href="/shop"
                  style={{
                    display: 'inline-block',
                    padding: '0.85rem 2.5rem',
                    border: '1px solid var(--color-terracotta)',
                    color: 'var(--color-terracotta)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}
                >
                  Browse All Products
                </Link>
              </div>
            </>
          )}
        </div>

      </main>
      <Footer />
    </>
  );
}
