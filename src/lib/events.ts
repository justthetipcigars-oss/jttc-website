import { redis } from './redis';

export type EventCategory = 'on-site' | 'off-site';
export type EventSubcategory = 'recurring' | 'non-recurring' | 'pop-up';

export interface JTTEvent {
  id: string;
  title: string;
  description: string;
  date: string;       // YYYY-MM-DD
  time: string;       // e.g. "7:00 PM"
  endTime?: string;
  category: EventCategory;
  subcategory?: EventSubcategory;   // on-site only
  recurringPattern?: string;         // e.g. "Every Saturday"
  location?: string;                 // off-site address / venue
  imageUrl?: string;
  facebookEventUrl?: string;
  ticketed: boolean;
  ticketUrl?: string;
  createdAt: string;
}

const KEY = 'jttc:events';

export async function getEvents(): Promise<JTTEvent[]> {
  const data = await redis.get<JTTEvent[]>(KEY);
  if (!data) return [];
  return data.sort((a, b) => a.date.localeCompare(b.date));
}

export async function saveEvents(events: JTTEvent[]): Promise<void> {
  await redis.set(KEY, events);
}

export async function addEvent(event: Omit<JTTEvent, 'id' | 'createdAt'>): Promise<JTTEvent> {
  const events = await getEvents();
  const newEvent: JTTEvent = {
    ...event,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await saveEvents([...events, newEvent]);
  return newEvent;
}

export async function updateEvent(id: string, updates: Partial<Omit<JTTEvent, 'id' | 'createdAt'>>): Promise<JTTEvent | null> {
  const events = await getEvents();
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return null;
  events[idx] = { ...events[idx], ...updates };
  await saveEvents(events);
  return events[idx];
}

export async function deleteEvent(id: string): Promise<boolean> {
  const events = await getEvents();
  const filtered = events.filter(e => e.id !== id);
  if (filtered.length === events.length) return false;
  await saveEvents(filtered);
  return true;
}
