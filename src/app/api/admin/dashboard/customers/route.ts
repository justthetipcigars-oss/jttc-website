import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { fetchAllCustomers } from '@/lib/dashboard-lightspeed';

const BASE_URL = 'https://justthetipcigars.retail.lightspeed.app/api/2.0';

type SpendEntry = { spend: number; visitCount: number; lastVisit: string | null };

async function fetchSpendByCustomer(dateFrom: string, dateTo: string | null): Promise<Record<string, SpendEntry>> {
  const token = process.env.LIGHTSPEED_API_TOKEN;
  const spendMap: Record<string, SpendEntry> = {};
  let cursor = dateTo;

  do {
    let url = `${BASE_URL}/search?type=sales&page_size=250&status=CLOSED&date_from=${dateFrom}`;
    if (cursor) url += `&date_to=${cursor}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Lightspeed API error: ${res.status}`);
    const data = await res.json();
    if (!data.data?.length) break;

    data.data.forEach((s: { customer_id?: string; total_price: number; sale_date: string }) => {
      if (!s.customer_id) return;
      if (!spendMap[s.customer_id]) {
        spendMap[s.customer_id] = { spend: 0, visitCount: 0, lastVisit: null };
      }
      spendMap[s.customer_id].spend = Math.round((spendMap[s.customer_id].spend + s.total_price) * 100) / 100;
      spendMap[s.customer_id].visitCount++;
      if (!spendMap[s.customer_id].lastVisit || s.sale_date > spendMap[s.customer_id].lastVisit!) {
        spendMap[s.customer_id].lastVisit = s.sale_date;
      }
    });

    const lastDate = new Date(data.data[data.data.length - 1].sale_date);
    lastDate.setSeconds(lastDate.getSeconds() - 1);
    cursor = lastDate.toISOString().replace('.000Z', 'Z');
    if (data.data.length < 250) break;
  } while (true);

  return spendMap;
}

export async function GET(request: NextRequest) {
  const user = await requireRole(['manager']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('date_from');
    const dateTo   = searchParams.get('date_to');

    if (dateFrom) {
      const [customers, spendMap] = await Promise.all([
        fetchAllCustomers(),
        fetchSpendByCustomer(dateFrom, dateTo || null),
      ]);

      const customerById: Record<string, typeof customers[0]> = {};
      customers.forEach(c => { customerById[c.id] = c; });

      const analytics = Object.entries(spendMap)
        .map(([id, spend]) => {
          const c = customerById[id];
          if (!c) return null;
          return {
            id,
            name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
            email: c.email,
            phone: c.mobile || c.phone,
            yearToDate: spend.spend,
            visitCount: spend.visitCount,
            loyaltyBalance: c.loyalty_balance || 0,
            createdAt: c.created_at,
            updatedAt: spend.lastVisit || c.updated_at,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b!.yearToDate - a!.yearToDate);

      return NextResponse.json({ customers: analytics, mode: 'range', fetchedAt: new Date().toISOString() });
    }

    const customers = await fetchAllCustomers();
    const analytics = customers.map(c => ({
      id: c.id,
      name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
      email: c.email,
      phone: c.mobile || c.phone,
      yearToDate: c.year_to_date || 0,
      loyaltyBalance: c.loyalty_balance || 0,
      balance: c.balance || 0,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
    analytics.sort((a, b) => b.yearToDate - a.yearToDate);

    return NextResponse.json({ customers: analytics, mode: 'all', fetchedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
