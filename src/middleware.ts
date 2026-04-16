import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi  = pathname.startsWith('/api/admin');
  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  // Allow the login page through always
  if (pathname === '/admin/login') return NextResponse.next();

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    if (isAdminApi) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    if (isAdminApi) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
