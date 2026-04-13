import { LightspeedProduct } from './lightspeed';

export type ProductGroup = {
  name: string;
  brand: string;
  imageUrl: string | null;
  minPrice: number;
  maxPrice: number;
  variants: LightspeedProduct[];
};

/** @deprecated use ProductGroup */
export type CigarGroup = ProductGroup;

export function groupByName(products: LightspeedProduct[]): ProductGroup[] {
  const map = new Map<string, LightspeedProduct[]>();
  for (const p of products) {
    const list = map.get(p.name) ?? [];
    list.push(p);
    map.set(p.name, list);
  }
  return Array.from(map.entries())
    .map(([name, variants]) => {
      const prices = variants.map(v => v.price);
      return {
        name,
        brand: variants[0]?.brand ?? '',
        imageUrl: variants.find(v => v.imageUrl)?.imageUrl ?? null,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        variants,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
