import Link from 'next/link';
import Image from 'next/image';
import { fetchCigars } from '@/lib/lightspeed';

export default async function FeaturedProducts() {
  let featured = [];
  try {
    const cigars = await fetchCigars();
    // Singles only, pick first 6 unique lines sorted by name
    const singles = cigars.filter(p => p.isSingle && p.price > 0);
    const seen = new Set<string>();
    for (const p of singles) {
      if (!seen.has(p.name)) {
        seen.add(p.name);
        featured.push(p);
      }
      if (featured.length >= 6) break;
    }
  } catch {
    // Fall through to empty state
  }

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
              className="display"
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 600,
                color: 'var(--color-cream)',
                lineHeight: 1.2,
              }}
            >
              Hand-Selected,<br />
              <span style={{ color: 'var(--color-terracotta)' }}>Worth Every Draw</span>
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

        {featured.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--color-smoke)' }}>
            Visit the shop to see our full selection.
          </div>
        ) : (
          <>
            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'var(--color-charcoal-mid)' }}>
              {featured.map(p => (
                <Link
                  key={p.id}
                  href="/shop"
                  className="group block transition-colors"
                  style={{ background: 'var(--color-charcoal)' }}
                >
                  {/* Product image */}
                  <div
                    className="aspect-[3/2] relative overflow-hidden"
                    style={{ background: 'var(--color-charcoal-mid)' }}
                  >
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-end p-4">
                        <span style={{ color: 'var(--color-charcoal-light)', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                          Photo Coming Soon
                        </span>
                      </div>
                    )}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'rgba(196,98,45,0.1)' }}
                    />
                  </div>

                  <div className="p-5">
                    {p.brand && (
                      <div style={{ color: 'var(--color-terracotta)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        {p.brand}
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3
                        className="font-semibold leading-tight"
                        style={{ color: 'var(--color-cream)', fontSize: '1rem' }}
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
                    {p.size && (
                      <div style={{ color: 'var(--color-smoke)', fontSize: '0.75rem' }}>
                        {p.size}
                      </div>
                    )}
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
          </>
        )}
      </div>
    </section>
  );
}
