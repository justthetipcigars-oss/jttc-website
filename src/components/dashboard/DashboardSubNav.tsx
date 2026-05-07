'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/admin/dashboard',              label: 'Sales Reports',     match: (p: string) => p === '/admin/dashboard' },
  { href: '/admin/dashboard/customers',    label: 'Customers',         match: (p: string) => p.startsWith('/admin/dashboard/customers') },
  { href: '/admin/dashboard/products',     label: 'Product Movement',  match: (p: string) => p.startsWith('/admin/dashboard/products') },
  { href: '/admin/dashboard/tobacconist',  label: "Tobacconist's View", match: (p: string) => p.startsWith('/admin/dashboard/tobacconist') },
];

export default function DashboardSubNav() {
  const pathname = usePathname() || '';

  return (
    <nav className="flex flex-wrap gap-1 mb-6 border-b border-gray-800/60">
      {ITEMS.map(item => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3.5 py-2 text-sm font-medium border-b-2 -mb-px transition-all ${
              active
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-300 hover:text-white hover:border-gray-600'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
