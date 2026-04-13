import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const CACHE_KEY = 'catalog:search_index';
const CACHE_TTL = 86400;

type CatalogEntry = {
  id: string;
  name: string;
  brand: string;
  size: string;
  image_url: string | null;
};

async function buildSearchIndex(): Promise<CatalogEntry[]> {
  const TOKEN = process.env.LIGHTSPEED_API_TOKEN;
  const BASE_URL = process.env.LIGHTSPEED_BASE_URL;
  const headers = { Authorization: `Bearer ${TOKEN}` };

  const entries: CatalogEntry[] = [];
  let after: number | null = null;

  do {
    let url = `${BASE_URL}/products?page_size=250`;
    if (after) url += `&after=${after}`;

    const res = await fetch(url, { headers });
    if (!res.ok) break;

    const data = await res.json();
    const page: Record<string, unknown>[] = data.data || [];

    for (const p of page) {
      if (p.deleted_at || !p.is_active) continue;
      const variantOptions = (p.variant_options as Array<{ name: string; value: string }>) || [];
      const size = variantOptions.find(v => v.name === 'Size')?.value ?? '';
      const rawUrl = p.image_url as string | null;
      const image_url = rawUrl && !rawUrl.includes('placeholder') ? rawUrl : null;
      entries.push({
        id: p.id as string,
        name: p.name as string,
        brand: (p.brand as { name: string } | null)?.name ?? '',
        size,
        image_url,
      });
    }

    after = page.length === 250 ? (data.version?.max as number) : null;
  } while (after);

  return entries;
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('x-admin-password');
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const catalog = await buildSearchIndex();
  await redis.set(CACHE_KEY, catalog, { ex: CACHE_TTL });

  return NextResponse.json({ ok: true, count: catalog.length });
}
