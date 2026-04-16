import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const BASE_URL = process.env.LIGHTSPEED_BASE_URL!;
const TOKEN    = process.env.LIGHTSPEED_API_TOKEN!;
const LIFETIME = '2023-07-01T05:00:00Z';

function normalizePhone(p: string | null | undefined) {
  return (p ?? '').replace(/\D/g, '').slice(-10);
}

function parseCategoryMacro(p: Record<string, unknown>): string {
  const path = (p?.product_category as { category_path?: Array<{ name: string }> })?.category_path;
  if (!path?.length) return 'other';
  const raw = path.length >= 2 ? path[0].name : path[0].name.split('/')[0];
  return raw.trim().toLowerCase();
}

async function findAndSaveCustomerId(userId: string, phone: string | null, email: string | null): Promise<string | null> {
  const phoneNorm  = normalizePhone(phone);
  const emailLower = email?.trim().toLowerCase() ?? '';
  let after: string | null = null;

  do {
    let url = `${BASE_URL}/customers?page_size=250`;
    if (after) url += `&after=${after}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` }, cache: 'no-store' });
    if (!res.ok) break;
    const data = await res.json();
    const page = data.data ?? [];

    for (const c of page) {
      if (phoneNorm.length === 10 && (normalizePhone(c.phone) === phoneNorm || normalizePhone(c.mobile) === phoneNorm)) {
        await saveCustomerId(userId, c.id);
        return c.id;
      }
      if (emailLower && c.email?.trim().toLowerCase() === emailLower) {
        await saveCustomerId(userId, c.id);
        return c.id;
      }
    }
    after = page.length === 250 ? (data.version?.max ?? null) : null;
  } while (after);

  return null;
}

async function saveCustomerId(userId: string, customerId: string) {
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  await admin.from('profiles').update({ lightspeed_customer_id: customerId }).eq('id', userId);
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('lightspeed_customer_id, phone, preferred_email')
      .eq('id', user.id)
      .single();

    let customerId: string | null = profile?.lightspeed_customer_id ?? null;

    if (!customerId) {
      const phone = profile?.phone ?? null;
      const email = profile?.preferred_email ?? user.email ?? null;
      if (phone || email) {
        customerId = await findAndSaveCustomerId(user.id, phone, email);
      }
      if (!customerId) return NextResponse.json({ error: 'not_linked' }, { status: 404 });
    }

    // Page through all customer sales
    const productQty: Record<string, number> = {};
    const salesList: unknown[] = [];
    let cursor: string | null = null;

    do {
      let url = `${BASE_URL}/search?type=sales&page_size=250&customer_id=${customerId}&status=CLOSED&date_from=${LIFETIME}`;
      if (cursor) url += `&date_to=${cursor}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` }, cache: 'no-store' });
      if (!res.ok) break;
      const data = await res.json();
      if (!data.data?.length) break;

      for (const s of data.data) {
        salesList.push(s);
        for (const item of (s.line_items ?? [])) {
          if (item.quantity > 0) {
            productQty[item.product_id] = (productQty[item.product_id] ?? 0) + item.quantity;
          }
        }
      }

      const lastDate = new Date((data.data[data.data.length - 1] as { sale_date: string }).sale_date);
      lastDate.setSeconds(lastDate.getSeconds() - 1);
      cursor = lastDate.toISOString().replace('.000Z', 'Z');
      if (data.data.length < 250) break;
    } while (true);

    // Fetch product details in batches
    const ids = Object.keys(productQty);
    const details: Record<string, Record<string, unknown>> = {};
    for (let i = 0; i < ids.length; i += 50) {
      const batch = ids.slice(i, i + 50);
      const results = await Promise.all(
        batch.map(pid =>
          fetch(`${BASE_URL}/products/${pid}`, { headers: { Authorization: `Bearer ${TOKEN}` }, cache: 'no-store' })
            .then(r => r.json()).then(d => d.data as Record<string, unknown>).catch(() => null)
        )
      );
      results.forEach(p => { if (p) details[p.id as string] = p; });
    }

    // Group by base product name, sum quantities
    const grouped: Record<string, { name: string; totalQty: number; macro: string }> = {};
    for (const [pid, qty] of Object.entries(productQty)) {
      const p = details[pid];
      if (!p) continue;
      const macro    = parseCategoryMacro(p);
      const baseName = (p.name as string) || 'Unknown';
      const key      = baseName.toLowerCase();
      if (!grouped[key]) grouped[key] = { name: baseName, totalQty: 0, macro };
      grouped[key].totalQty += qty;
    }

    const all    = Object.values(grouped).sort((a, b) => b.totalQty - a.totalQty);
    const cigars = all.filter(p => p.macro.startsWith('cigar'));
    const pipes  = all.filter(p => p.macro.startsWith('pipe'));
    const other  = all.filter(p => !p.macro.startsWith('cigar') && !p.macro.startsWith('pipe'));

    // Build visits list for the Visits tab
    type SaleRaw = { sale_date: string; invoice_number: string; total_price: number; line_items: Array<{ quantity: number; product_id: string; price_total: number }> };
    const visits = (salesList as SaleRaw[])
      .sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())
      .map(s => ({
        date:          s.sale_date,
        invoiceNumber: s.invoice_number,
        total:         Math.round(s.total_price * 100) / 100,
        itemCount:     s.line_items?.filter(i => i.quantity > 0).reduce((sum, i) => sum + i.quantity, 0) ?? 0,
        items: s.line_items?.filter(i => i.quantity > 0).map(i => {
          const p = details[i.product_id];
          return {
            productId: i.product_id,
            name:      (p?.variant_name as string) || (p?.name as string) || null,
            category:  (p?.product_category as { name?: string })?.name ?? null,
            qty:       i.quantity,
            total:     Math.round(i.price_total * 100) / 100,
          };
        }) ?? [],
      }));

    return NextResponse.json({ cigars, pipes, other, visits, visitCount: salesList.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
