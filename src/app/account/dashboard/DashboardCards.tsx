'use client';

const cards = [
  { label: 'Purchase History', desc: 'In-store and online orders', href: '/account/history', icon: '🧾' },
  { label: 'Wishlist', desc: 'Saved cigars and notifications', href: '/account/wishlist', icon: '🔖' },
  { label: 'My Humidor', desc: 'Cigars in your collection', href: '/account/humidor', icon: '🗄️' },
  { label: 'My Ashtray', desc: 'Cigars you have smoked', href: '/account/ashtray', icon: '🪨' },
  { label: 'Tasting Journal', desc: 'Your notes and ratings', href: '/account/journal', icon: '📓' },
];

export default function DashboardCards() {
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
          <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{card.icon}</div>
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
