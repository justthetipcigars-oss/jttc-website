import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { fetchAllCustomers } from '@/lib/dashboard-lightspeed';

const BASE_URL = 'https://justthetipcigars.retail.lightspeed.app/api/2.0';
const LIFETIME = '2023-07-01T05:00:00Z';

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

type SalesEntry = { visitCount: number; lastVisit: string | null; products: Record<string, number> };

async function fetchSalesMap(): Promise<Record<string, SalesEntry>> {
  const tk = process.env.LIGHTSPEED_API_TOKEN;
  const map: Record<string, SalesEntry> = {};
  let cursor: string | null = null;
  do {
    let url = `${BASE_URL}/search?type=sales&page_size=250&status=CLOSED&date_from=${LIFETIME}`;
    if (cursor) url += `&date_to=${cursor}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${tk}` }, cache: 'no-store' });
    if (!res.ok) break;
    const data = await res.json();
    if (!data.data?.length) break;

    data.data.forEach((s: { customer_id?: string; sale_date: string; line_items?: Array<{ product_id: string; quantity: number }> }) => {
      if (!s.customer_id) return;
      const c = map[s.customer_id] || { visitCount: 0, lastVisit: null, products: {} };
      c.visitCount++;
      if (!c.lastVisit || s.sale_date > c.lastVisit) c.lastVisit = s.sale_date;
      s.line_items?.forEach(i => {
        if (i.quantity > 0)
          c.products[i.product_id] = (c.products[i.product_id] || 0) + i.quantity;
      });
      map[s.customer_id] = c;
    });

    const lastDate = new Date(data.data[data.data.length - 1].sale_date);
    lastDate.setSeconds(lastDate.getSeconds() - 1);
    cursor = lastDate.toISOString().replace('.000Z', 'Z');
    if (data.data.length < 250) break;
  } while (true);

  return map;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const [customers, salesMap] = await Promise.all([
      fetchAllCustomers(),
      fetchSalesMap(),
    ]);

    const customerById: Record<string, typeof customers[0]> = {};
    customers.forEach(c => { customerById[c.id] = c; });

    const result = Object.entries(salesMap)
      .map(([cid, s]) => {
        const c = customerById[cid];
        if (!c) return null;
        return {
          id:         c.id,
          name:       `${c.first_name || ''} ${c.last_name || ''}`.trim(),
          visitCount: s.visitCount,
          lastSeen:   s.lastVisit,
        };
      })
      .filter((c): c is { id: string; name: string; visitCount: number; lastSeen: string | null } => !!c && c.visitCount > 0)
      .sort((a, b) => b.visitCount - a.visitCount);

    return new Response(JSON.stringify({ customers: result, fetchedAt: new Date().toISOString() }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
