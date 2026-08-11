import { useMemo, useState } from 'react';
import SectionHeading from './SectionHeading.jsx';
import CarCard from './CarCard.jsx';
import FiltersBar, { DEFAULT_FILTERS } from './FiltersBar.jsx';
import { useBookingContext } from '../context/BookingContext.jsx';

function applyFilters(cars, filters) {
  return cars.filter((car) => {
    if (filters.transmission && car.transmission !== filters.transmission) return false;
    if (filters.fuelType && car.fuelType !== filters.fuelType) return false;
    if (filters.seats && String(car.seats) !== String(filters.seats)) return false;
    if (filters.category && car.category !== filters.category) return false;
    if (filters.maxPricePerDay && car.pricePerDay > Number(filters.maxPricePerDay)) return false;
    return true;
  });
}

function CarsSection({ cars, loading, error }) {
  const { openBooking } = useBookingContext();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const filteredCars = useMemo(() => applyFilters(cars, filters), [cars, filters]);

  return (
    <section className="cars reveal" id="cars">
      <div className="container">
        <SectionHeading
          eyebrow="Our fleet"
          title="Real-time fleet, transparent pricing"
          description="Full specs, tiered pricing, and real availability for every car — filter to find the right fit, then book straight through to WhatsApp."
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
          <div className="cars-layout">
            <FiltersBar filters={filters} onChange={setFilters} resultCount={filteredCars.length} />

            <div className="cars-list-col">
              <div className="cars-list-head">
                <span>{filteredCars.length} Cars Available</span>
              </div>

              {filteredCars.length === 0 ? (
                <p className="state-message">No cars match those filters — try widening your search.</p>
              ) : (
                <div className="car-list">
                  {filteredCars.map((car) => (
                    <CarCard key={car.id} car={car} onCheckAvailability={openBooking} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CarsSection;
