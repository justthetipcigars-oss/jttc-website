import { NextRequest, NextResponse } from 'next/server';

function isAuthorized(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

function getMeta(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1].replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"');
  }
  return '';
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { url } = await req.json();
  if (!url || !url.includes('facebook.com')) {
    return NextResponse.json({ error: 'Invalid Facebook URL' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Facebook returned ${res.status}` }, { status: 502 });
    }

    const html = await res.text();

    const title = getMeta(html, 'og:title');
    const description = getMeta(html, 'og:description');
    const imageUrl = getMeta(html, 'og:image');

    if (!title) {
      return NextResponse.json({ error: 'Could not read event data. Make sure the event is public.' }, { status: 422 });
    }

    return NextResponse.json({ title, description, imageUrl, facebookEventUrl: url });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch Facebook event.' }, { status: 502 });
  }
}
