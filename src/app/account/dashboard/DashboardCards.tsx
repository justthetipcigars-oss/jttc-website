'use client';

type Card = {
  label: string;
  desc: string;
  href: string;
  icon?: string;
  img?: string;
};

const cards: Card[] = [
  { label: 'My Profile',       desc: 'Your info, preferences & social', href: '/account/profile',  img: '/your pic icon.jpg' },
  { label: 'Purchase History', desc: 'In-store and online orders',       href: '/account/history',  img: '/images/icon-history.png' },
  { label: 'Wishlist',         desc: 'Saved cigars and notifications',   href: '/account/wishlist', img: '/images/icon-wishlist.png' },
  { label: 'My Humidor',       desc: 'Cigars in your collection',        href: '/account/humidor',  img: '/images/icon-humidor.png' },
  { label: 'My Ashtray',       desc: 'Cigars you have smoked & rated',   href: '/account/ashtray',  img: '/images/icon-ashtray.png' },
];

export default function DashboardCards({ avatarUrl }: { avatarUrl?: string | null }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
      {cards.map(card => {
        const isProfile = card.href === '/account/profile';
        const imgSrc = isProfile && avatarUrl ? avatarUrl : card.img;
        const isAvatar = isProfile && !!avatarUrl;

        return (
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
              {imgSrc ? (
                isAvatar ? (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-terracotta)' }}>
                    <img src={imgSrc} alt={card.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <img src={imgSrc} alt={card.label} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '2px' }} />
                )
              ) : (
                <span style={{ fontSize: '1.75rem' }}>{card.icon}</span>
              )}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--color-cream)', fontSize: '1rem', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
              {card.label}
            </div>
            <p style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', lineHeight: 1.6 }}>
              {card.desc}
            </p>
          </a>
        );
      })}
    </div>
  );
}
