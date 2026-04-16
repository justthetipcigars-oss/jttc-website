import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileClient from './ProfileClient';

export const metadata = { title: 'My Profile | Just The Tip Cigars' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const safeProfile = {
    full_name:           profile?.full_name           ?? null,
    preferred_name:      profile?.preferred_name      ?? null,
    birthday:            profile?.birthday            ?? null,
    phone:               profile?.phone               ?? null,
    preferred_email:     profile?.preferred_email     ?? null,
    address_line1:       profile?.address_line1       ?? null,
    address_line2:       profile?.address_line2       ?? null,
    city:                profile?.city                ?? null,
    state:               profile?.state               ?? null,
    zip:                 profile?.zip                 ?? null,
    instagram_handle:    profile?.instagram_handle    ?? null,
    facebook_handle:     profile?.facebook_handle     ?? null,
    opt_in_events_email: profile?.opt_in_events_email ?? false,
    opt_in_events_text:  profile?.opt_in_events_text  ?? false,
    opt_in_newsletter:   profile?.opt_in_newsletter   ?? false,
    member_since:        profile?.member_since        ?? user.created_at,
    avatar_url:          profile?.avatar_url          ?? null,
  };

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', paddingTop: '116px' }}>
        <div className="max-w-3xl mx-auto px-6 py-16">

          {/* Back link */}
          <a
            href="/account/dashboard"
            style={{ color: 'var(--color-smoke)', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}
          >
            ← Aficionado&apos;s Corner
          </a>

          {/* Header */}
          <div style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Aficionado&apos;s Corner
            </div>
            <h1 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: 'var(--color-cream)', lineHeight: 1.1, marginBottom: '0.75rem' }}>
              My Profile
            </h1>
            <p style={{ color: 'var(--color-smoke)', fontSize: '0.9rem', lineHeight: 1.8 }}>
              Keep your info up to date. Nothing here is required — fill in what you&apos;d like.
            </p>
          </div>

          <ProfileClient profile={safeProfile} userEmail={user.email ?? ''} />

        </div>
      </main>
      <Footer />
    </>
  );
}
