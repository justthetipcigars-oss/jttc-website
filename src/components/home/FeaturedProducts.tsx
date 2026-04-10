import Link from 'next/link';

// Placeholder product data — will be replaced with Lightspeed API call
const PLACEHOLDER_PRODUCTS = [
  { id: '1', name: 'Padron 1964 Anniversary', origin: 'Nicaragua', strength: 'Full', price: 28.00 },
  { id: '2', name: 'Arturo Fuente Opus X', origin: 'Dominican Republic', strength: 'Full', price: 32.00 },
  { id: '3', name: 'Ashton VSG', origin: 'Dominican Republic', strength: 'Medium-Full', price: 22.00 },
  { id: '4', name: 'Liga Privada No. 9', origin: 'Nicaragua', strength: 'Full', price: 18.00 },
  { id: '5', name: 'My Father Le Bijou', origin: 'Nicaragua', strength: 'Full', price: 16.00 },
  { id: '6', name: 'Oliva Serie V', origin: 'Nicaragua', strength: 'Full', price: 14.00 },
];

export default function FeaturedProducts() {
  return (
    <section style={{ background: 'var(--color-pitch)' }}>
      <div className="max-w-7xl mx-auto px-6 py-24">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              In the Humidor
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                color: 'var(--color-cream)',
                lineHeight: 1.2,
              }}
            >
              Hand-Selected,<br />
              <span style={{ fontStyle: 'italic', color: 'var(--color-terracotta)' }}>Worth Every Draw</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-semibold tracking-widest uppercase shrink-0 transition-colors"
            style={{ color: 'var(--color-smoke)', letterSpacing: '0.15em' }}
          >
            Browse All →
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'var(--color-charcoal-mid)' }}>
          {PLACEHOLDER_PRODUCTS.map(p => (
            <Link
              key={p.id}
              href={`/shop/${p.id}`}
              className="group block transition-colors"
              style={{ background: 'var(--color-charcoal)' }}
            >
              {/* 📸 PHOTO PLACEHOLDER — Product shot: cigar on dark wood or leather surface,
                  warm side lighting, shallow depth of field. One per featured product. */}
              <div
                className="aspect-[3/2] relative overflow-hidden"
                style={{ background: 'var(--color-charcoal-mid)' }}
              >
                <div className="absolute inset-0 flex items-end p-4">
                  <span style={{ color: 'var(--color-charcoal-light)', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                    Product Photo
                  </span>
                </div>
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'rgba(196,98,45,0.1)' }}
                />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3
                    className="font-semibold leading-tight transition-colors group-hover:text-terracotta"
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: 'var(--color-cream)',
                      fontSize: '1rem',
                    }}
                  >
                    {p.name}
                  </h3>
                  <span
                    className="shrink-0 font-semibold"
                    style={{ color: 'var(--color-amber)', fontSize: '0.95rem' }}
                  >
                    ${p.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>{p.origin}</span>
                  <span className="w-1 h-1 rounded-full" style={{ background: 'var(--color-charcoal-light)' }} />
                  <span style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>{p.strength}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-block px-10 py-4 text-sm font-semibold tracking-widest uppercase transition-all"
            style={{
              border: '1px solid var(--color-terracotta)',
              color: 'var(--color-terracotta)',
              letterSpacing: '0.15em',
            }}
          >
            Shop the Full Humidor
          </Link>
        </div>
      </div>
    </section>
  );
}
