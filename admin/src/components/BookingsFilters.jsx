const DURATION_BANDS = [
  { value: '', label: 'Any duration' },
  { value: 'short', label: 'Under 1 day' },
  { value: 'medium', label: '1–3 days' },
  { value: 'long', label: '3–7 days' },
  { value: 'xlong', label: '7+ days' },
];

export const DEFAULT_BOOKING_FILTERS = {
  search: '',
  status: '',
  carId: '',
  duration: '',
  bookedFrom: '',
  bookedTo: '',
  pickupFrom: '',
  pickupTo: '',
};

/** Same thresholds as durationLabel's day/hour breakdown in BookingsPanel — just bucketed. */
export function getDurationBand(startAt, endAt) {
  const hours = (new Date(endAt) - new Date(startAt)) / (1000 * 60 * 60);
  if (hours < 24) return 'short';
  if (hours < 72) return 'medium';
  if (hours < 168) return 'long';
  return 'xlong';
}

function BookingsFilters({ filters, onChange, cars }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="filters-bar">
      <div className="filters-row">
        <input
          type="text"
          placeholder="Search by name, phone, or car…"
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="search-input"
        />
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => update('status', e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending only</option>
          <option value="booked">Booked only</option>
          <option value="cancelled">Cancelled only</option>
        </select>
        <select
          className="filter-select"
          value={filters.carId}
          onChange={(e) => update('carId', e.target.value)}
          aria-label="Filter by car"
        >
          <option value="">All cars</option>
          {cars.map((car) => (
            <option key={car.id} value={car.id}>
              {car.name}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filters.duration}
          onChange={(e) => update('duration', e.target.value)}
          aria-label="Filter by duration"
        >
          {DURATION_BANDS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filters-row filters-row-dates">
        <div className="filter-date-group">
          <span className="filter-date-label">Booked on</span>
          <input
            type="date"
            value={filters.bookedFrom}
            onChange={(e) => update('bookedFrom', e.target.value)}
            aria-label="Booked on — from"
          />
          <span className="filter-date-sep">–</span>
          <input
            type="date"
            value={filters.bookedTo}
            onChange={(e) => update('bookedTo', e.target.value)}
            aria-label="Booked on — to"
          />
        </div>
        <div className="filter-date-group">
          <span className="filter-date-label">Pick-up</span>
          <input
            type="date"
            value={filters.pickupFrom}
            onChange={(e) => update('pickupFrom', e.target.value)}
            aria-label="Pick-up date — from"
          />
          <span className="filter-date-sep">–</span>
          <input
            type="date"
            value={filters.pickupTo}
            onChange={(e) => update('pickupTo', e.target.value)}
            aria-label="Pick-up date — to"
          />
        </div>
        {activeCount > 0 && (
          <button type="button" className="filters-clear" onClick={() => onChange(DEFAULT_BOOKING_FILTERS)}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

export default BookingsFilters;
