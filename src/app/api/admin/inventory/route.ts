import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import {
  createStocktakeConsignment,
  setConsignmentProductCount,
  commitConsignment,
  invalidateProductsCache,
} from '@/lib/lightspeed';

type Change = {
  productId: string;
  sku: string;
  name: string;
  oldAmount: number;
  newAmount: number;
};

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

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { brand, changes } = (await req.json()) as { brand: string; changes: Change[] };
  if (!brand || !Array.isArray(changes) || changes.length === 0) {
    return NextResponse.json({ error: 'brand and non-empty changes required' }, { status: 400 });
  }

  const adminEmail = user.email ?? 'unknown';
  const today = new Date().toISOString().slice(0, 10);
  const consignmentName = `Web Admin — ${brand} — ${today} — ${adminEmail}`;

  let consignmentId: string;
  try {
    consignmentId = await createStocktakeConsignment(consignmentName);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }

  const failures: Array<{ sku: string; error: string }> = [];
  for (const c of changes) {
    try {
      await setConsignmentProductCount(consignmentId, c.productId, c.newAmount);
    } catch (err) {
      failures.push({ sku: c.sku, error: (err as Error).message });
    }
  }

  if (failures.length === changes.length) {
    return NextResponse.json(
      { error: 'All product updates failed', consignmentId, failures },
      { status: 502 },
    );
  }

  try {
    await commitConsignment(consignmentId);
  } catch (err) {
    return NextResponse.json(
      { error: `Consignment created and counts set, but commit failed: ${(err as Error).message}`, consignmentId, failures },
      { status: 502 },
    );
  }

  // Audit log — written with service role to bypass RLS
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );
  const auditRows = changes
    .filter(c => !failures.some(f => f.sku === c.sku))
    .map(c => ({
      admin_user_id: user.id,
      admin_email: adminEmail,
      brand,
      sku: c.sku,
      product_name: c.name,
      product_id: c.productId,
      old_amount: c.oldAmount,
      new_amount: c.newAmount,
      consignment_id: consignmentId,
    }));
  if (auditRows.length > 0) {
    await admin.from('inventory_audit').insert(auditRows);
  }

  await invalidateProductsCache();

  return NextResponse.json({
    ok: true,
    consignmentId,
    committed: auditRows.length,
    failures,
  });
}
