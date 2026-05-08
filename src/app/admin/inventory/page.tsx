import { fetchAllProducts } from '@/lib/lightspeed';
import AdminNav from '@/components/admin/AdminNav';
import AdminInventoryClient from './AdminInventoryClient';
import { requireRoleForPage } from '@/lib/auth';

export const metadata = { title: 'Admin — Inventory | JTTC' };

export default async function AdminInventoryPage() {
  const { role } = await requireRoleForPage(['manager']);
  const all = await fetchAllProducts();

  // Slim payload — strip fields the inventory tool doesn't need
  const products = all.map(p => ({
    id: p.id,
    name: p.name,
    variantName: p.variantName,
    brand: p.brand || '(no brand)',
    sku: p.sku,
    stockAmount: p.stockAmount,
    category: p.category,
    imageUrl: p.imageUrl,
  }));

  return (
    <main style={{ background: 'var(--color-pitch)', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <AdminNav active="inventory" role={role} />
        <AdminInventoryClient products={products} />
      </div>
    </main>
  );
}
