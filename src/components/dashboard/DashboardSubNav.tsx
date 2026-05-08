'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { roleSatisfiesAny, type Role } from '@/lib/auth-shared';

type Item = {
  href: string;
  label: string;
  allowed: Role[];
  match: (p: string) => boolean;
};

const ITEMS: Item[] = [
  { href: '/admin/dashboard',              label: 'Sales Reports',      allowed: ['manager'],     match: p => p === '/admin/dashboard' },
  { href: '/admin/dashboard/customers',    label: 'Customers',          allowed: ['manager'],     match: p => p.startsWith('/admin/dashboard/customers') },
  { href: '/admin/dashboard/products',     label: 'Product Movement',   allowed: ['manager'],     match: p => p.startsWith('/admin/dashboard/products') },
  { href: '/admin/dashboard/tobacconist',  label: "Tobacconist's View", allowed: ['tobacconist'], match: p => p.startsWith('/admin/dashboard/tobacconist') },
];

export default function DashboardSubNav({ role }: { role: Role }) {
  const pathname = usePathname() || '';
  const visible  = ITEMS.filter(item => roleSatisfiesAny(role, item.allowed));

  return (
    <nav className="flex flex-wrap gap-1 mb-6 border-b border-gray-800/60">
      {visible.map(item => {
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
