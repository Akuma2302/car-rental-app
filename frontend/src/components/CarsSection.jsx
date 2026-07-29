import SectionHeading from './SectionHeading.jsx';
import CarCard from './CarCard.jsx';
import { useBookingContext } from '../context/BookingContext.jsx';

function CarsSection({ cars, loading, error }) {
  const { openBooking } = useBookingContext();

  return (
    <section className="cars reveal" id="cars">
      <div className="container">
        <SectionHeading
          eyebrow="Our fleet"
          title="Tap a car to check the schedule"
          description="Every listing shows real availability — choose a date, pick an open time slot, and confirm straight to our team on WhatsApp."
        />

        {loading && <p className="state-message">Loading cars…</p>}

        {error && (
          <p className="state-message state-error">
            Couldn&rsquo;t reach the booking server. If you&rsquo;re running this locally, make sure the
            backend is started (<code>npm run dev</code> inside <code>backend/</code>). If this is the
            live site, check that the backend is deployed and reachable, then refresh.
          </p>
        )}

        {!loading && !error && (
          <div className="car-grid">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} onCheckAvailability={openBooking} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default CarsSection;
