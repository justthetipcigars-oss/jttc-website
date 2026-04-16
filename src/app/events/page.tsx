import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getEvents } from '@/lib/events';
import EventsClient from '@/components/events/EventsClient';

export const revalidate = 60;

export const metadata = {
  title: 'Events | Just The Tip Cigars',
  description: "From smoke nights at the lounge to weddings, private gatherings, and connoisseur events — Just The Tip Cigars has you covered. See what's on the calendar.",
  openGraph: {
    title: 'Events | Just The Tip Cigars',
    description: "Smoke nights, private gatherings, connoisseur events. See what's on the calendar at Just The Tip Cigars.",
    url: 'https://www.justthetipcigars.com/events',
    images: [{ url: '/images/cowboy-wb.png', width: 1200, height: 630, alt: 'Just The Tip Cigars' }],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Events | Just The Tip Cigars',
    description: "Smoke nights, private gatherings, connoisseur events. See what's on the calendar.",
    images: ['/images/cowboy-wb.png'],
  },
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-pitch)', minHeight: '100vh', paddingTop: '116px' }}>

        {/* Header */}
        <div style={{ background: 'var(--color-charcoal)', borderBottom: '1px solid var(--color-charcoal-mid)' }}>
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div style={{ color: 'var(--color-terracotta)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              At the Lounge
            </div>
            <h1
              className="display"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, color: 'var(--color-cream)', lineHeight: 1.1 }}
            >
              Upcoming Events
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <EventsClient events={events} />
        </div>

      </main>
      <Footer />
    </>
  );
}
