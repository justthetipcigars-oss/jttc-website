import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redis } from '@/lib/redis';

const BASE_URL = process.env.LIGHTSPEED_BASE_URL!;
const TOKEN    = process.env.LIGHTSPEED_API_TOKEN!;
const LIFETIME = '2023-07-01T05:00:00Z';
const CUSTOMER_INDEX_KEY = 'ls:customer_index';
const CUSTOMER_INDEX_TTL = 60 * 60 * 24; // 24 hours
const USER_HISTORY_TTL   = 60 * 30;       // 30 minutes per-user cache
const userHistoryKey     = (id: string) => `ls:history:v2:${id}`;

function normalizePhone(p: string | null | undefined) {
  return (p ?? '').replace(/\D/g, '').slice(-10);
}

function parseCategoryMacro(p: Record<string, unknown>): string {
  const path = (p?.product_category as { category_path?: Array<{ name: string }> })?.category_path;
  if (!path?.length) return 'other';
  const raw = path.length >= 2 ? path[0].name : path[0].name.split('/')[0];
  return raw.trim().toLowerCase();
}

// Build and cache a lookup map: email/phone -> lightspeed customer id
async function getCustomerIndex(): Promise<Record<string, string>> {
  const cached = await redis.get<Record<string, string>>(CUSTOMER_INDEX_KEY);
  if (cached) return cached;

  const index: Record<string, string> = {};
  let after: string | null = null;

  do {
    let url = `${BASE_URL}/customers?page_size=250`;
    if (after) url += `&after=${after}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` }, cache: 'no-store' });
    if (!res.ok) break;
    const data = await res.json();
    const page: Record<string, unknown>[] = data.data ?? [];

    for (const c of page) {
      const id = c.id as string;
      if (c.email) index[(c.email as string).trim().toLowerCase()] = id;
      const phone = normalizePhone(c.phone as string);
      if (phone.length === 10) index[phone] = id;
      const mobile = normalizePhone(c.mobile as string);
      if (mobile.length === 10) index[mobile] = id;
    }

    after = page.length === 250 ? (data.version?.max ?? null) : null;
  } while (after);

  await redis.set(CUSTOMER_INDEX_KEY, index, { ex: CUSTOMER_INDEX_TTL });
  return index;
}

async function findAndSaveCustomerId(userId: string, phone: string | null, email: string | null): Promise<string | null> {
  const index     = await getCustomerIndex();
  const emailKey  = email?.trim().toLowerCase() ?? '';
  const phoneKey  = normalizePhone(phone);

  const customerId = (emailKey && index[emailKey]) || (phoneKey.length === 10 && index[phoneKey]) || null;
  if (customerId) await saveCustomerId(userId, customerId);
  return customerId;
}

async function saveCustomerId(userId: string, customerId: string) {
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
  await admin.from('profiles').upsert({ id: userId, lightspeed_customer_id: customerId });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('lightspeed_customer_id, phone')
      .eq('id', user.id)
      .single();

    // Return cached history if available
    const cachedHistory = await redis.get(userHistoryKey(user.id));
    if (cachedHistory) return NextResponse.json(cachedHistory);

    let customerId: string | null = profile?.lightspeed_customer_id ?? null;

    if (!customerId) {
      const phone = profile?.phone ?? null;
      const email = user.email ?? null;
      if (phone || email) {
        customerId = await findAndSaveCustomerId(user.id, phone, email);
      }
      if (!customerId) return NextResponse.json({ error: 'not_linked' }, { status: 404 });
    }

    // Page through all customer sales
    const productQty: Record<string, number> = {};
    const productLastPurchased: Record<string, string> = {};
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
        const saleDate = s.sale_date as string;
        for (const item of (s.line_items ?? [])) {
          if (item.quantity > 0) {
            productQty[item.product_id] = (productQty[item.product_id] ?? 0) + item.quantity;
            const prev = productLastPurchased[item.product_id];
            if (!prev || new Date(saleDate) > new Date(prev)) {
              productLastPurchased[item.product_id] = saleDate;
            }
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

    // Group by base product name, sum quantities, collect images + latest date
    const grouped: Record<string, {
      name: string;
      totalQty: number;
      macro: string;
      imageUrls: string[];
      lastPurchased: string | null;
    }> = {};
    for (const [pid, qty] of Object.entries(productQty)) {
      const p = details[pid];
      if (!p) continue;
      const macro    = parseCategoryMacro(p);
      const baseName = (p.name as string) || 'Unknown';
      const key      = baseName.toLowerCase();
      if (!grouped[key]) grouped[key] = { name: baseName, totalQty: 0, macro, imageUrls: [], lastPurchased: null };
      grouped[key].totalQty += qty;

      // Collect unique images for this product group (up to 3)
      const imgs = (p.images as Array<{ url: string }> | null) ?? [];
      const urls: string[] = [];
      const topImg = p.image_url as string | null;
      if (topImg && !topImg.includes('placeholder')) urls.push(topImg);
      for (const i of imgs) if (i.url && !i.url.includes('placeholder')) urls.push(i.url);
      for (const u of urls) {
        if (grouped[key].imageUrls.length >= 3) break;
        if (!grouped[key].imageUrls.includes(u)) grouped[key].imageUrls.push(u);
      }

      // Track most-recent purchase date across variants of this name
      const last = productLastPurchased[pid];
      if (last && (!grouped[key].lastPurchased || new Date(last) > new Date(grouped[key].lastPurchased!))) {
        grouped[key].lastPurchased = last;
      }
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

    const result = { cigars, pipes, other, visits, visitCount: salesList.length };
    await redis.set(userHistoryKey(user.id), result, { ex: USER_HISTORY_TTL });
    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
