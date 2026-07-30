const TRANSMISSIONS = ['Automatic', 'Manual'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'EV'];
const SEATS = [5, 7];
const CATEGORIES = ['SUV', 'Sedan', 'Luxury'];
const PRICE_BANDS = [
  { label: 'Any price', value: '' },
  { label: 'Under RM100/day', value: '100' },
  { label: 'Under RM200/day', value: '200' },
  { label: 'Under RM300/day', value: '300' },
];

export const DEFAULT_FILTERS = {
  transmission: '',
  fuelType: '',
  seats: '',
  category: '',
  maxPricePerDay: '',
};

function FiltersBar({ filters, onChange, resultCount }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="filters-bar">
      <div className="filters-row">
        <select
          className="filter-select"
          value={filters.transmission}
          onChange={(e) => update('transmission', e.target.value)}
          aria-label="Transmission"
        >
          <option value="">Any transmission</option>
          {TRANSMISSIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.fuelType}
          onChange={(e) => update('fuelType', e.target.value)}
          aria-label="Fuel type"
        >
          <option value="">Any fuel type</option>
          {FUEL_TYPES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.seats}
          onChange={(e) => update('seats', e.target.value)}
          aria-label="Seats"
        >
          <option value="">Any seats</option>
          {SEATS.map((s) => (
            <option key={s} value={s}>
              {s} seats
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.category}
          onChange={(e) => update('category', e.target.value)}
          aria-label="Category"
        >
          <option value="">Any category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.maxPricePerDay}
          onChange={(e) => update('maxPricePerDay', e.target.value)}
          aria-label="Price range"
        >
          {PRICE_BANDS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>

        {activeCount > 0 && (
          <button type="button" className="filters-clear" onClick={() => onChange(DEFAULT_FILTERS)}>
            Clear filters
          </button>
        )}
      </div>
      <span className="filters-count">
        {resultCount} car{resultCount === 1 ? '' : 's'} match
      </span>
    </div>
  );
}

export default FiltersBar;
