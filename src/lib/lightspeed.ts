import { redis } from './redis';

const BASE_URL = process.env.LIGHTSPEED_BASE_URL || 'https://justthetipcigars.retail.lightspeed.app/api/2.0';
const TOKEN = process.env.LIGHTSPEED_API_TOKEN;
const CACHE_KEY = 'ls:all_products:v2';
const CACHE_TTL = 3600;

// Single-outlet store. Looked up once via GET /outlets and pinned here.
export const OUTLET_ID = '06326976-9d65-11ed-fa40-1373814887fb';

const SWAG_TYPES = new Set([
  'Short Sleeve Tee', 'Hats', 'Beanie', 'Hoodie', 'Trucker',
  'Long Sleeve Tee', 'Shirts', 'Flex Fit', 'Polo',
]);

// Lightspeed root category IDs — used to filter action buttons (humidor, cellar, etc.)
const PIPES_ROOT_ID = '2efdcf82-705f-43ba-bd56-c01a44a6d576';
const PIPE_TOBACCO_ROOT_ID = '8ad2775f-801f-4966-be20-996041818acd';

const CIGAR_SIZES = [
  'robusto', 'toro', 'gordo', 'corona', 'lancero', 'churchill', 'belicoso',
  'panatela', 'lonsdale', 'perfecto', 'presidente', 'torpedo', 'figurado',
  'petit', 'gran', 'double', 'magnum', 'salomon', 'croqueta', 'puritos',
  'short', 'gigante', 'hermoso', 'julieta', 'dalia',
];

function isCigarSize(value: string) {
  const v = value.toLowerCase();
  return CIGAR_SIZES.some(s => v.includes(s)) || /\d+\s*[xX×]\s*\d+/.test(v);
}

export interface VariantOption {
  name: string;
  value: string;
}

export interface LightspeedProduct {
  id: string;
  name: string;
  variantName: string;
  brand: string;
  size: string;
  quantity: string;
  price: number;
  isSingle: boolean;
  isBox: boolean;
  isCigar: boolean;
  isPipe: boolean;
  isPipeTobacco: boolean;
  sku: string;
  imageUrl: string | null;
  category: string;
  variantOptions: VariantOption[];
  allImages: string[];
  stockAmount: number;
  description: string;
}

function mapProduct(p: Record<string, unknown>): LightspeedProduct {
  const variantOptions = (p.variant_options as Array<{ name: string; value: string }>) || [];
  const size = variantOptions.find(v => v.name === 'Size')?.value || '';
  const quantity = variantOptions.find(v => v.name === 'Quantity')?.value || '';
  const quantityLower = quantity.toLowerCase();

  const rootCategoryId = (p.product_category as { category_path?: Array<{ id: string }> } | null)
    ?.category_path?.[0]?.id || '';

  return {
    id: p.id as string,
    name: p.name as string,
    variantName: p.variant_name as string,
    brand: (p.brand as { name: string } | null)?.name || '',
    size,
    quantity,
    price: (p.price_including_tax as number) || 0,
    isSingle: quantityLower === 'single' || quantityLower === '',
    isBox: quantityLower.startsWith('box') || quantityLower.startsWith('pack') || quantityLower.startsWith('case'),
    isCigar: isCigarSize(size),
    isPipe: rootCategoryId === PIPES_ROOT_ID,
    isPipeTobacco: rootCategoryId === PIPE_TOBACCO_ROOT_ID,
    sku: p.sku as string,
    variantOptions,
    category: (() => {
      const typeName = (p.type as { name: string } | null)?.name || '';
      if (SWAG_TYPES.has(typeName)) return 'JTTC Swag';
      return (p.product_category as { name: string } | null)?.name || typeName;
    })(),
    imageUrl: (() => {
      const url = p.image_url as string | null;
      if (url && !url.includes('placeholder')) return url;
      const imgs = p.images as Array<{ url: string }> | null;
      if (imgs && imgs.length > 0) return imgs[0].url;
      return null;
    })(),
    allImages: (() => {
      const imgs = p.images as Array<{ url: string }> | null;
      return imgs ? imgs.filter(i => !i.url.includes('placeholder')).map(i => i.url) : [];
    })(),
    stockAmount: 0, // filled in after inventory fetch
    description: (p.description as string) || '',
  };
}

async function fetchInventoryMap(headers: Record<string, string>): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  let after: number | null = null;

  do {
    let url = `${BASE_URL}/inventory?page_size=250`;
    if (after) url += `&after=${after}`;

    const res = await fetch(url, { headers, next: { revalidate: 3600 } });
    if (!res.ok) break; // non-fatal — show 0 if inventory fetch fails

    const data = await res.json();
    const page: Array<{ product_id: string; current_amount: number }> = data.data || [];

    for (const item of page) {
      if (item.product_id) {
        map.set(item.product_id, (map.get(item.product_id) ?? 0) + (item.current_amount ?? 0));
      }
    }

    after = page.length === 250 ? (data.version?.max as number) : null;
  } while (after);

  return map;
}

async function fetchAllProductsFromAPI(): Promise<LightspeedProduct[]> {
  if (!TOKEN) throw new Error('LIGHTSPEED_API_TOKEN not set');

  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  // Fetch products and inventory in parallel
  const [products, inventoryMap] = await Promise.all([
    (async () => {
      const list: LightspeedProduct[] = [];
      let after: number | null = null;

      do {
        let url = `${BASE_URL}/products?page_size=250`;
        if (after) url += `&after=${after}`;

        const res = await fetch(url, { headers, next: { revalidate: 3600 } });
        if (!res.ok) throw new Error(`Lightspeed API error: ${res.status}`);

        const data = await res.json();
        const page: Record<string, unknown>[] = data.data || [];

        const active = page.filter(p => !p.deleted_at && p.is_active === true && p.price_including_tax !== null);
        list.push(...active.map(mapProduct));

        after = page.length === 250 ? (data.version?.max as number) : null;
      } while (after);

      return list;
    })(),
    fetchInventoryMap(headers),
  ]);

  const filtered = products.filter(p => p.name !== 'Discount' && p.price > 0);

  // Apply stock amounts
  for (const p of filtered) {
    p.stockAmount = Math.max(0, Math.round(inventoryMap.get(p.id) ?? 0));
  }

  // Propagate images across variants
  const imageByName: Record<string, string> = {};
  for (const p of filtered) {
    if (p.imageUrl && !imageByName[p.name]) {
      imageByName[p.name] = p.imageUrl;
    }
  }
  for (const p of filtered) {
    if (!p.imageUrl && imageByName[p.name]) {
      p.imageUrl = imageByName[p.name];
    }
  }

  return filtered;
}

export async function fetchAllProducts(): Promise<LightspeedProduct[]> {
  try {
    const cached = await redis.get<LightspeedProduct[]>(CACHE_KEY);
    if (cached) return cached;
  } catch {
    // Redis unavailable — fall through to live fetch
  }

  const products = await fetchAllProductsFromAPI();

  try {
    await redis.set(CACHE_KEY, products, { ex: CACHE_TTL });
  } catch {
    // Cache write failure is non-fatal
  }

  return products;
}

export async function fetchCigars(): Promise<LightspeedProduct[]> {
  const all = await fetchAllProducts();
  return all.filter(p => p.isCigar);
}

// -------------------------------------------------------------------
// Inventory writes — STOCKTAKE consignment workflow
// Used by /admin/inventory to commit stock changes with audit trail.
// -------------------------------------------------------------------
function authHeaders() {
  if (!TOKEN) throw new Error('LIGHTSPEED_API_TOKEN not set');
  return {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };
}

export async function createStocktakeConsignment(name: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/consignments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      name,
      type: 'STOCKTAKE',
      outlet_id: OUTLET_ID,
      status: 'STOCKTAKE_SCHEDULED',
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`createStocktakeConsignment failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  const id = data?.data?.id || data?.id;
  if (!id) throw new Error('No consignment id returned');
  return id as string;
}

export async function startStocktakeConsignment(consignmentId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/consignments/${consignmentId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status: 'STOCKTAKE_IN_PROGRESS' }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`startStocktakeConsignment failed: ${res.status} ${text}`);
  }
}

export async function setConsignmentProductCount(
  consignmentId: string,
  productId: string,
  count: number,
): Promise<void> {
  // STOCKTAKE consignments record the counted value in `received`; `count` is a no-op
  // for STOCKTAKE_IN_PROGRESS state and triggers "No valid data modification received".
  const res = await fetch(`${BASE_URL}/consignments/${consignmentId}/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      product_id: productId,
      received: count,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`setConsignmentProductCount failed for ${productId}: ${res.status} ${text}`);
  }
}

export async function commitConsignment(consignmentId: string): Promise<void> {
  // STOCKTAKE state machine forbids jumping IN_PROGRESS -> COMPLETE.
  // Must transition through IN_PROGRESS_PROCESSED first.
  for (const status of ['STOCKTAKE_IN_PROGRESS_PROCESSED', 'STOCKTAKE_COMPLETE']) {
    const res = await fetch(`${BASE_URL}/consignments/${consignmentId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`commitConsignment failed at ${status}: ${res.status} ${text}`);
    }
  }
}

export async function invalidateProductsCache(): Promise<void> {
  try {
    await redis.del(CACHE_KEY);
  } catch {
    // non-fatal
  }
}
