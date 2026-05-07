import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const BASE_URL = 'https://justthetipcigars.retail.lightspeed.app/api/2.0';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  return profile?.is_admin ? user : null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const token = process.env.LIGHTSPEED_API_TOKEN;
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('date_from');
    const dateTo   = searchParams.get('date_to');

    type Sale = { id: string; sale_date: string; invoice_number: string; total_price: number; total_price_incl: number; line_items?: Array<{ product_id: string; quantity: number; unit_price: number; price_total: number; cost_total?: number }> };
    let sales: Sale[] = [];
    let cursor: string | null = dateTo;

    do {
      let url = `${BASE_URL}/search?type=sales&page_size=250&customer_id=${id}&status=CLOSED`;
      if (dateFrom) url += `&date_from=${dateFrom}`;
      if (cursor)   url += `&date_to=${cursor}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Lightspeed API error: ${res.status}`);
      const data = await res.json();
      if (!data.data?.length) break;

      sales.push(...data.data);

      const lastDate = new Date(data.data[data.data.length - 1].sale_date);
      lastDate.setSeconds(lastDate.getSeconds() - 1);
      cursor = lastDate.toISOString().replace('.000Z', 'Z');
      if (data.data.length < 250) break;
    } while (true);

    type ProductEntry = { productId: string; name: string | null; category: string | null; totalQty: number; totalSpend: number; visits: Set<string> };
    const productMap: Record<string, ProductEntry> = {};
    sales.forEach(s => {
      s.line_items?.forEach(item => {
        if (item.quantity <= 0) return;
        const pid = item.product_id;
        if (!productMap[pid]) productMap[pid] = { productId: pid, name: null, category: null, totalQty: 0, totalSpend: 0, visits: new Set() };
        productMap[pid].totalQty += item.quantity;
        productMap[pid].totalSpend += item.price_total;
        productMap[pid].visits.add(s.id);
      });
    });

    const allProductIds = Object.keys(productMap);
    const BATCH = 50;
    for (let i = 0; i < allProductIds.length; i += BATCH) {
      const batch = allProductIds.slice(i, i + BATCH);
      await Promise.all(batch.map(async pid => {
        try {
          const res = await fetch(`${BASE_URL}/products/${pid}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store',
          });
          const d = await res.json();
          if (productMap[pid]) {
            productMap[pid].name     = d.data?.variant_name || d.data?.name || 'Unknown';
            productMap[pid].category = d.data?.category_name || 'Uncategorized';
          }
        } catch {}
      }));
    }

    const favoriteProducts = Object.values(productMap)
      .map(p => ({
        productId: p.productId,
        name:      p.name || 'Unknown',
        category:  p.category || 'Uncategorized',
        totalQty:  p.totalQty,
        totalSpend: Math.round(p.totalSpend * 100) / 100,
        visitCount: p.visits.size,
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend);

    const byMonth: Record<string, { revenue: number; cost: number }> = {};
    const byVisit: Array<{ date: string; invoiceNumber: string; total: number; totalInclTax: number; itemCount: number; items: Array<{ productId: string; name: string | null; category: string | null; qty: number; unitPrice: number; total: number }> }> = [];
    sales.forEach(s => {
      const month = s.sale_date.substring(0, 7);
      if (!byMonth[month]) byMonth[month] = { revenue: 0, cost: 0 };
      byMonth[month].revenue += s.total_price;
      byMonth[month].cost    += s.line_items?.reduce((sum, i) => sum + (i.quantity > 0 ? (i.cost_total || 0) : 0), 0) || 0;
      byVisit.push({
        date: s.sale_date,
        invoiceNumber: s.invoice_number,
        total: Math.round(s.total_price * 100) / 100,
        totalInclTax: Math.round(s.total_price_incl * 100) / 100,
        itemCount: s.line_items?.filter(i => i.quantity > 0).reduce((sum, i) => sum + i.quantity, 0) || 0,
        items: s.line_items?.filter(i => i.quantity > 0).map(i => ({
          productId: i.product_id,
          name: productMap[i.product_id]?.name || null,
          category: productMap[i.product_id]?.category || null,
          qty: i.quantity,
          unitPrice: i.unit_price,
          total: Math.round(i.price_total * 100) / 100,
        })) || [],
      });
    });

    const monthlyTrend = Object.entries(byMonth)
      .map(([month, { revenue, cost }]) => ({
        month,
        revenue:     Math.round(revenue * 100) / 100,
        grossProfit: Math.round((revenue - cost) * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const totalSpend = sales.reduce((s, x) => s + x.total_price, 0);
    const avgVisitValue = sales.length > 0 ? totalSpend / sales.length : 0;

    const visitDates = sales.map(s => new Date(s.sale_date)).sort((a, b) => a.getTime() - b.getTime());
    let avgDaysBetween: number | null = null;
    if (visitDates.length > 1) {
      const gaps: number[] = [];
      for (let i = 1; i < visitDates.length; i++) {
        gaps.push((visitDates[i].getTime() - visitDates[i - 1].getTime()) / (1000 * 60 * 60 * 24));
      }
      avgDaysBetween = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    }

    return NextResponse.json({
      totalSpend: Math.round(totalSpend * 100) / 100,
      visitCount: sales.length,
      avgVisitValue: Math.round(avgVisitValue * 100) / 100,
      avgDaysBetweenVisits: avgDaysBetween,
      firstVisit: visitDates[0]?.toISOString() || null,
      lastVisit: visitDates[visitDates.length - 1]?.toISOString() || null,
      monthlyTrend,
      favoriteProducts,
      visits: byVisit.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
