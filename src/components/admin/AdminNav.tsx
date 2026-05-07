import Link from 'next/link';

type Tab = { href: string; label: string };

const TABS: Tab[] = [
  { href: '/admin/dashboard', label: 'JTT Dashboard' },
  { href: '/admin/events',    label: 'Events' },
  { href: '/admin/inventory', label: 'Inventory' },
  { href: '/admin/sentiment', label: 'Customer Sentiment' },
];

type ActiveTab = 'dashboard' | 'events' | 'inventory' | 'sentiment';

export default function AdminNav({ active }: { active: ActiveTab }) {
  const activeHref =
    active === 'dashboard' ? '/admin/dashboard' :
    active === 'events'    ? '/admin/events' :
    active === 'inventory' ? '/admin/inventory' :
                             '/admin/sentiment';

  return (
    <div style={{
      display: 'flex',
      gap: '0.25rem',
      marginBottom: '2rem',
      borderBottom: '1px solid var(--color-charcoal-mid)',
      flexWrap: 'wrap',
    }}>
      <div style={{
        color: 'var(--color-smoke)',
        fontSize: '0.62rem',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        padding: '0.7rem 1rem 0.7rem 0',
        alignSelf: 'center',
      }}>
        ⚙ Admin
      </div>
      {TABS.map(t => {
        const isActive = t.href === activeHref;
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              padding: '0.7rem 1.25rem',
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
              textDecoration: 'none',
              color: isActive ? 'var(--color-terracotta)' : 'var(--color-cream-dark)',
              borderBottom: isActive ? '2px solid var(--color-terracotta)' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {t.label}
          </Link>
        );
      })}
      <Link
        href="/"
        style={{
          marginLeft: 'auto',
          padding: '0.7rem 1.25rem',
          fontSize: '0.7rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 500,
          textDecoration: 'none',
          color: 'var(--color-smoke)',
          alignSelf: 'center',
        }}
      >
        ← Back to Site
      </Link>
    </div>
  );
}
