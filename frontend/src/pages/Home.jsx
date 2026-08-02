import { useEffect } from 'react';
import Header from '../layout/Header.jsx';
import Footer from '../layout/Footer.jsx';
import Hero from '../components/Hero.jsx';
import CarsSection from '../components/CarsSection.jsx';
import UspSection from '../components/UspSection.jsx';
import LocationSection from '../components/LocationSection.jsx';
import PendingBookingBanner from '../components/PendingBookingBanner.jsx';
import BookingModal from '../features/booking/BookingModal.jsx';
import { useCars } from '../hooks/useCars.js';

function Home() {
  const { cars, loading, error } = useCars();

  // Gentle fade/slide-in for each major section as it scrolls into view.
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('in'));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <PendingBookingBanner />
      <Header />
      <Hero />
      <CarsSection cars={cars} loading={loading} error={error} />
      <UspSection />
      <LocationSection />
      <Footer />
      <BookingModal cars={cars} />
    </>
  );
}

export default Home;
