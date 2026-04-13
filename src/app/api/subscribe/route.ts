import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, source = 'homepage' } = await req.json();

    if (!email?.trim()) {
      return Response.json({ error: 'Email is required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('email_subscribers')
      .upsert({ email: email.trim().toLowerCase(), source }, { onConflict: 'email', ignoreDuplicates: true });

    if (error) throw error;

    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return Response.json({ error: message }, { status: 500 });
  }
}
