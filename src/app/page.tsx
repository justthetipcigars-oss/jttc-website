import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/home/Hero';
import ReviewsScroller from '@/components/home/ReviewsScroller';
import AboutStrip from '@/components/home/AboutStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import EventsPreview from '@/components/home/EventsPreview';
import EmailSignup from '@/components/home/EmailSignup';

export default function HomePage() {
  return (
    <>
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
