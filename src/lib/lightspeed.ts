import { redis } from './redis';

const BASE_URL = process.env.LIGHTSPEED_BASE_URL || 'https://justthetipcigars.retail.lightspeed.app/api/2.0';
const TOKEN = process.env.LIGHTSPEED_API_TOKEN;
const CACHE_KEY = 'ls:all_products';
const CACHE_TTL = 3600;

const SWAG_TYPES = new Set([
  'Short Sleeve Tee', 'Hats', 'Beanie', 'Hoodie', 'Trucker',
  'Long Sleeve Tee', 'Shirts', 'Flex Fit', 'Polo',
]);

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
