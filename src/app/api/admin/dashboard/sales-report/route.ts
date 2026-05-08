import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';

const BASE_URL = 'https://justthetipcigars.retail.lightspeed.app/api/2.0';

type Sale = {
  total_price: number;
  total_price_incl: number;
  total_tax: number;
  sale_date: string;
  line_items?: Array<{ quantity: number; cost_total?: number }>;
};

async function fetchSalesInRange(dateFrom: string, dateTo: string | null): Promise<Sale[]> {
  const token = process.env.LIGHTSPEED_API_TOKEN;
  const sales: Sale[] = [];
  let curDateTo = dateTo;

  do {
    let url = `${BASE_URL}/search?type=sales&page_size=250&date_from=${dateFrom}&status=CLOSED`;
    if (curDateTo) url += `&date_to=${curDateTo}`;

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
    curDateTo = lastDate.toISOString().replace('.000Z', 'Z');
    if (data.data.length < 250) break;
  } while (true);

  return sales;
}

export async function GET(request: NextRequest) {
  const user = await requireRole(['manager']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    if (!dateFrom) return NextResponse.json({ error: 'date_from required' }, { status: 400 });

    const sales = await fetchSalesInRange(dateFrom, dateTo);

    let revenue = 0, revenuInclTax = 0, cogs = 0, tax = 0, itemsSold = 0, returns = 0;
    const revenueByDay: Record<string, number> = {};

    sales.forEach(s => {
      revenue += s.total_price;
      revenuInclTax += s.total_price_incl;
      tax += s.total_tax;
      if (s.total_price < 0) returns++;

      const day = s.sale_date.split('T')[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + s.total_price;

      s.line_items?.forEach(item => {
        itemsSold += item.quantity;
        cogs += item.cost_total || 0;
      });
    });

    const grossProfit = revenue - cogs;
    const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    const dailyTrend = Object.entries(revenueByDay)
      .map(([date, rev]) => ({ date, revenue: Math.round(rev * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      revenue: Math.round(revenue * 100) / 100,
      revenueInclTax: Math.round(revenuInclTax * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      cogs: Math.round(Math.abs(cogs) * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      saleCount: sales.length,
      returnCount: returns,
      itemsSold: Math.round(itemsSold),
      avgSaleValue: sales.length > 0 ? Math.round((revenue / sales.length) * 100) / 100 : 0,
      dailyTrend,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
