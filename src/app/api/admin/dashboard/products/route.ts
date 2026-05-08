import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';

const BASE_URL = 'https://justthetipcigars.retail.lightspeed.app/api/2.0';

async function lsGet(path: string, token: string | undefined) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Lightspeed API ${res.status}: ${await res.text()}`);
  return res.json();
}

type Sale = { sale_date: string; line_items?: Array<{ product_id: string; quantity: number; price_total?: number; price?: number; cost_total?: number }> };

async function fetchSalesInRange(dateFrom: string, dateTo: string | null, token: string | undefined): Promise<Sale[]> {
  let sales: Sale[] = [];
  let curDateTo = dateTo;
  do {
    let url = `/search?type=sales&page_size=250&date_from=${dateFrom}&status=CLOSED`;
    if (curDateTo) url += `&date_to=${curDateTo}`;
    const data = await lsGet(url, token);
    if (!data.data?.length) break;
    sales.push(...data.data);
    const lastDate = new Date(data.data[data.data.length - 1].sale_date);
    lastDate.setSeconds(lastDate.getSeconds() - 1);
    curDateTo = lastDate.toISOString().replace('.000Z', 'Z');
    if (data.data.length < 250) break;
  } while (true);
  return sales;
}

type InventoryItem = { product_id: string; current_amount?: number };

async function fetchAllInventory(token: string | undefined): Promise<InventoryItem[]> {
  const items: InventoryItem[] = [];
  let after: string | null = null;
  do {
    let url = `/inventory?page_size=250`;
    if (after) url += `&after=${after}`;
    const data = await lsGet(url, token);
    items.push(...(data.data || []));
    after = data.data?.length === 250 ? data.version?.max : null;
  } while (after);
  return items;
}

type Product = { id: string; name?: string; brand?: { name?: string }; product_category?: { category_path?: Array<{ name: string }> } };

function parseCategoryPath(product_category: Product['product_category']) {
  if (!product_category) return { macro: null, sub: null };
  const path = product_category.category_path;
  if (!path?.length) return { macro: null, sub: null };
  if (path.length >= 2) {
    return { macro: path[0].name.trim(), sub: path[1].name.trim() };
  }
  const name = path[0].name.trim();
  const slashIdx = name.indexOf('/');
  if (slashIdx > -1) {
    return { macro: name.slice(0, slashIdx).trim(), sub: name.slice(slashIdx + 1).trim() };
  }
  return { macro: name, sub: null };
}

async function fetchProductsByIds(ids: string[], token: string | undefined): Promise<Product[]> {
  const BATCH = 50;
  const results: Product[] = [];
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    const fetched = await Promise.all(
      batch.map(id =>
        lsGet(`/products/${id}`, token)
          .then(r => r.data)
          .catch(() => null)
      )
    );
    results.push(...fetched.filter(Boolean));
  }
  return results;
}

export async function GET(request: NextRequest) {
  const user = await requireRole(['manager']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const token = process.env.LIGHTSPEED_API_TOKEN;
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    if (!dateFrom) return NextResponse.json({ error: 'date_from required' }, { status: 400 });

    const fromMs = new Date(dateFrom).getTime();
    const toMs = dateTo ? new Date(dateTo).getTime() : Date.now();
    const daysInPeriod = Math.max(1, (toMs - fromMs) / (1000 * 60 * 60 * 24));

    const inventoryPromise = fetchAllInventory(token);
    const sales = await fetchSalesInRange(dateFrom, dateTo, token);

    const productIds = [...new Set(
      sales.flatMap(s => (s.line_items || []).map(i => i.product_id).filter(Boolean))
    )];

    const [productList, inventory] = await Promise.all([
      fetchProductsByIds(productIds, token),
      inventoryPromise,
    ]);

    const productMap: Record<string, Product> = Object.fromEntries(productList.map(p => [p.id, p]));
    const inventoryMap: Record<string, number> = {};
    inventory.forEach(i => {
      inventoryMap[i.product_id] = (inventoryMap[i.product_id] || 0) + (i.current_amount || 0);
    });

    type Stat = { id: string; name: string; brand: string | null; categoryMacro: string | null; categorySub: string | null; unitsSold: number; revenue: number; cogs: number };
    const stats: Record<string, Stat> = {};
    sales.forEach(sale => {
      (sale.line_items || []).forEach(item => {
        const pid = item.product_id;
        if (!pid) return;
        if (!stats[pid]) {
          const p = productMap[pid] || ({} as Product);
          const cat = parseCategoryPath(p.product_category);
          stats[pid] = {
            id: pid,
            name: p.name || `Product ${pid}`,
            brand: p.brand?.name || null,
            categoryMacro: cat.macro,
            categorySub: cat.sub,
            unitsSold: 0,
            revenue: 0,
            cogs: 0,
          };
        }
        stats[pid].unitsSold += item.quantity || 0;
        stats[pid].revenue += item.price_total ?? ((item.price || 0) * (item.quantity || 0));
        stats[pid].cogs += item.cost_total || 0;
      });
    });

    type Result = Stat & { grossProfit: number; margin: number; velocity: number; currentStock: number; daysRemaining: number | null; sellThrough: number | null; speed?: string };

    const results: Result[] = Object.values(stats)
      .filter(s => s.unitsSold > 0)
      .map(s => {
        const stock = inventoryMap[s.id] || 0;
        const velocity = s.unitsSold / daysInPeriod;
        const grossProfit = s.revenue - Math.abs(s.cogs);
        const totalAvailable = s.unitsSold + stock;
        return {
          ...s,
          unitsSold: Math.round(s.unitsSold * 10) / 10,
          revenue: Math.round(s.revenue * 100) / 100,
          grossProfit: Math.round(grossProfit * 100) / 100,
          margin: s.revenue > 0 ? Math.round((grossProfit / s.revenue) * 1000) / 10 : 0,
          velocity: Math.round(velocity * 100) / 100,
          currentStock: Math.round(stock),
          daysRemaining: velocity > 0 && stock > 0 ? Math.round(stock / velocity) : null,
          sellThrough: totalAvailable > 0 ? Math.round((s.unitsSold / totalAvailable) * 1000) / 10 : null,
        };
      })
      .sort((a, b) => b.unitsSold - a.unitsSold);

    if (results.length >= 10) {
      const sorted = [...results].sort((a, b) => b.velocity - a.velocity);
      const n = sorted.length;
      sorted.forEach((r, idx) => {
        const pct = idx / n;
        if (pct < 0.10)      r.speed = 'top';
        else if (pct < 0.25) r.speed = 'fast';
        else if (pct < 0.75) r.speed = 'average';
        else if (pct < 0.90) r.speed = 'slow';
        else                 r.speed = 'attention';
      });
    } else {
      results.forEach(r => { r.speed = 'average'; });
    }

    const brands = [...new Set(results.map(r => r.brand).filter(Boolean))].sort();

    const treeMap: Record<string, Set<string>> = {};
    results.forEach(r => {
      if (!r.categoryMacro) return;
      if (!treeMap[r.categoryMacro]) treeMap[r.categoryMacro] = new Set();
      if (r.categorySub) treeMap[r.categoryMacro].add(r.categorySub);
    });
    const categoryTree = Object.fromEntries(
      Object.entries(treeMap).sort().map(([k, v]) => [k, [...v].sort()])
    );

    return NextResponse.json({
      products: results,
      brands,
      categoryTree,
      daysInPeriod: Math.round(daysInPeriod),
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
