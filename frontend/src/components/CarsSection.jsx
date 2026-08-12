import { useEffect, useMemo, useRef, useState } from 'react';
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

const PAGE_SIZE = 5;

function CarsSection({ cars, loading, error }) {
  const { openBooking } = useBookingContext();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(0);
  const listTopRef = useRef(null);
  const isFirstRender = useRef(true);

  const filteredCars = useMemo(() => applyFilters(cars, filters), [cars, filters]);
  const totalPages = Math.max(1, Math.ceil(filteredCars.length / PAGE_SIZE));
  const pagedCars = filteredCars.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  // Filtering can change which page even makes sense (e.g. fewer results
  // than the page you were on) — always land back on page 1 when the
  // filtered set changes.
  useEffect(() => {
    setPage(0);
  }, [filters]);

  // Jumping to a new page can leave the newly-shown cards below the
  // viewport if the user had scrolled down — bring the list header back
  // into view, but skip this on first render so the page doesn't jump on
  // initial load.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [page]);

  useEffect(() => {
    if (!mobileFiltersOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKey(e) {
      if (e.key === 'Escape') setMobileFiltersOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [mobileFiltersOpen]);

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
            {mobileFiltersOpen && (
              <div className="filters-backdrop" onClick={() => setMobileFiltersOpen(false)} />
            )}
            <FiltersBar
              filters={filters}
              onChange={setFilters}
              resultCount={filteredCars.length}
              mobileOpen={mobileFiltersOpen}
              onClose={() => setMobileFiltersOpen(false)}
            />

            <div className="cars-list-col">
              <div className="cars-list-head" ref={listTopRef}>
                <span>{filteredCars.length} Cars Available</span>
                <button
                  type="button"
                  className="filters-toggle-mobile"
                  onClick={() => setMobileFiltersOpen((v) => !v)}
                  aria-expanded={mobileFiltersOpen}
                >
                  ☰ Filters
                </button>
              </div>

              {filteredCars.length === 0 ? (
                <p className="state-message">No cars match those filters — try widening your search.</p>
              ) : (
                <>
                  <div className="car-list">
                    {pagedCars.map((car) => (
                      <CarCard key={car.id} car={car} onCheckAvailability={openBooking} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="cars-pagination">
                      <button
                        type="button"
                        className="pagination-btn"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                      >
                        ‹ Prev
                      </button>
                      <span className="pagination-status">
                        Page {page + 1} of {totalPages}
                      </span>
                      <button
                        type="button"
                        className="pagination-btn"
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                      >
                        Next ›
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CarsSection;
