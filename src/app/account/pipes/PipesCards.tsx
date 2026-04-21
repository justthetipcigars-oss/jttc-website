'use client';

type Card = {
  label: string;
  desc: string;
  href: string;
  placeholder: string;
};

const cards: Card[] = [
  { label: 'My Pipe Collection', desc: 'Every pipe on the rack',         href: '/account/pipes/collection',    placeholder: 'Collection' },
  { label: 'My Cellar',          desc: 'Tins, tubs & aging tobaccos',    href: '/account/pipes/cellar',        placeholder: 'Cellar' },
  { label: 'My Tasting Guide',   desc: 'Blends you have smoked & rated', href: '/account/pipes/tasting-guide', placeholder: 'Tasting' },
  { label: 'Pipe Catalog',       desc: 'Every pipe we have ever carried',href: '/account/pipes/catalog',       placeholder: 'Catalog' },
];

export default function PipesCards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
      {cards.map(card => (
        <a
          key={card.href}
          href={card.href}
          style={{
            display: 'block',
            background: 'var(--color-charcoal)',
            border: '1px solid var(--color-charcoal-mid)',
            padding: '1.75rem',
            textDecoration: 'none',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-terracotta)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-charcoal-mid)')}
        >
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{
              width: 48, height: 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-charcoal-mid)',
              border: '1px dashed var(--color-charcoal-light)',
              color: 'var(--color-smoke)',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              {card.placeholder}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--color-cream)', fontSize: '1rem', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
            {card.label}
          </div>
          <p style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', lineHeight: 1.6 }}>
            {card.desc}
          </p>
        </a>
      ))}
    </div>
  );
}
