import { NextRequest, NextResponse } from 'next/server';
import { getEvents, addEvent } from '@/lib/events';

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get('x-admin-password');
  return auth === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  const events = await getEvents();
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const event = await addEvent(body);
  return NextResponse.json(event, { status: 201 });
}
