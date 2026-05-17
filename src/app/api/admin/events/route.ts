import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { getEvents, saveEvents, addEvent, updateEvent, deleteEvent } from '@/lib/events';

export async function GET() {
  const user = await requireRole(['manager']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const events = await getEvents();
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(['manager']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const event = await addEvent(body);
  revalidatePath('/events');
  return NextResponse.json({ event });
}

export async function PATCH(req: NextRequest) {
  const user = await requireRole(['manager']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const event = await updateEvent(id, updates);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  revalidatePath('/events');
  return NextResponse.json({ event });
}

export async function DELETE(req: NextRequest) {
  const user = await requireRole(['manager']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const ok = await deleteEvent(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  revalidatePath('/events');
  return NextResponse.json({ ok: true });
}

// Bulk replace (for reordering / import)
export async function PUT(req: NextRequest) {
  const user = await requireRole(['manager']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { events } = await req.json();
  await saveEvents(events);
  return NextResponse.json({ ok: true });
}
