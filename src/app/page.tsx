import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/home/Hero';
import ReviewsScroller from '@/components/home/ReviewsScroller';
import AboutStrip from '@/components/home/AboutStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import EventsPreview from '@/components/home/EventsPreview';
import EmailSignup from '@/components/home/EmailSignup';

export const metadata = {
  title: 'Just The Tip Cigars | South Park, PA',
  description: "Just The Tip Cigars is South Park's only veteran-owned cigar lounge. Founded by a lifelong enthusiast, built for the community. Come in, slow down, light up.",
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'CigarStore',
  name: 'Just The Tip Cigars',
  description: "South Park's only veteran-owned cigar lounge. A no-pretense gathering place for serious smokers and curious newcomers alike.",
  url: 'https://justthetipcigars.com',
  telephone: '+17249579229',
  email: 'justthetipcigars@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '2550 Brownsville Road',
    addressLocality: 'South Park Township',
    addressRegion: 'PA',
    postalCode: '15129',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 40.2887,
    longitude: -80.0234,
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Monday',    opens: '12:00', closes: '21:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Tuesday',   opens: '12:00', closes: '21:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Wednesday', opens: '10:00', closes: '21:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Thursday',  opens: '10:00', closes: '21:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday',    opens: '10:00', closes: '21:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday',  opens: '10:00', closes: '21:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday',    opens: '12:00', closes: '21:00' },
  ],
  sameAs: [
    'https://www.facebook.com/justthetipcigars',
    'https://www.instagram.com/justthetipcigars',
  ],
  priceRange: '$$',
  servesCuisine: 'Cigars',
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Navbar />
      <main>
        <Hero />
        <ReviewsScroller />
        <EmailSignup />
        <AboutStrip />
        <FeaturedProducts />
        <EventsPreview />
      </main>
      <Footer />
    </>
  );
}
