import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = process.env.LIGHTSPEED_BASE_URL!;
const TOKEN    = process.env.LIGHTSPEED_API_TOKEN!;

function normalizePhone(p: string | null | undefined) {
  return (p ?? '').replace(/\D/g, '').slice(-10);
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('lightspeed_customer_id, phone, preferred_email, email, full_name')
    .eq('id', user.id)
    .single();

  const emailToSearch = profile?.preferred_email ?? profile?.email ?? user.email ?? null;
  const phoneToSearch = profile?.phone ?? null;

  // Scan first page of customers to sample what we're comparing against
  const res = await fetch(`${BASE_URL}/customers?page_size=250`, {
    headers: { Authorization: `Bearer ${TOKEN}` }, cache: 'no-store'
  });
  const data = await res.json();
  const customers = data.data ?? [];
  const withEmail = customers.filter((c: Record<string, unknown>) => c.email).length;
  const phoneNorm = normalizePhone(phoneToSearch);

  // Check if any customer on page 1 matches
  const emailMatch = customers.find((c: Record<string, unknown>) =>
    emailToSearch && (c.email as string)?.trim().toLowerCase() === emailToSearch.trim().toLowerCase()
  );
  const phoneMatch = customers.find((c: Record<string, unknown>) =>
    phoneNorm.length === 10 && (
      normalizePhone(c.phone as string) === phoneNorm ||
      normalizePhone(c.mobile as string) === phoneNorm
    )
  );

  return NextResponse.json({
    user_id:              user.id,
    user_email:           user.email,
    profile_email:        profile?.email,
    profile_preferred:    profile?.preferred_email,
    profile_phone:        profile?.phone,
    profile_full_name:    profile?.full_name,
    already_linked:       profile?.lightspeed_customer_id ?? null,
    email_being_searched: emailToSearch,
    phone_being_searched: phoneNorm || null,
    page1_total:          customers.length,
    page1_with_email:     withEmail,
    email_match_found_p1: emailMatch ? { id: emailMatch.id, email: emailMatch.email } : null,
    phone_match_found_p1: phoneMatch ? { id: phoneMatch.id, phone: phoneMatch.phone } : null,
  });
}
