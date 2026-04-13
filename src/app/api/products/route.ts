import { fetchAllProducts } from '@/lib/lightspeed';
import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  try {
    const products = await fetchAllProducts();
    return NextResponse.json({ products, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Lightspeed fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
