const TRANSMISSIONS = ['Automatic', 'Manual'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'EV'];
const SEATS = [5, 7];
const CATEGORIES = ['SUV', 'Sedan', 'Luxury'];
const MAX_PRICE = 500;

export const DEFAULT_FILTERS = {
  transmission: '',
  fuelType: '',
  seats: '',
  category: '',
  maxPricePerDay: '',
};

// Renders as checkboxes to match the reference layout, but behaves as a
// single-select per group (matching the underlying filter fields, which
// each hold one value) — checking one option unchecks any other in the
// same group, and re-checking the active one clears back to "All".
function FilterGroup({ title, options, activeValue, onSelect }) {
  return (
    <div className="filter-group">
      <h4>{title}</h4>
      <label className="filter-checkbox">
        <input type="checkbox" checked={!activeValue} onChange={() => onSelect('')} />
        <span>All{title === 'Vehicle Type' ? ' Types' : ''}</span>
      </label>
      {options.map((opt) => (
        <label className="filter-checkbox" key={opt}>
          <input
            type="checkbox"
            checked={String(activeValue) === String(opt)}
            onChange={() => onSelect(String(activeValue) === String(opt) ? '' : opt)}
          />
          <span>{typeof opt === 'number' ? `${opt} seats` : opt}</span>
        </label>
      ))}
    </div>
  );
}

function FiltersBar({ filters, onChange, resultCount, mobileOpen, onClose }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  const activeCount = Object.values(filters).filter(Boolean).length;
  const sliderValue = filters.maxPricePerDay ? Number(filters.maxPricePerDay) : MAX_PRICE;

  return (
    <aside className={`filters-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="filters-sidebar-head">
        <h3>Filter</h3>
        <div className="filters-sidebar-head-actions">
          {activeCount > 0 && (
            <button type="button" className="filters-clear" onClick={() => onChange(DEFAULT_FILTERS)}>
              Clear All
            </button>
          )}
          <button type="button" className="filters-close-mobile" onClick={onClose} aria-label="Close filters">
            ×
          </button>
        </div>
      </div>

      <FilterGroup
        title="Vehicle Type"
        options={CATEGORIES}
        activeValue={filters.category}
        onSelect={(v) => update('category', v)}
      />

      <div className="filter-group">
        <h4>Price Range (per day)</h4>
        <input
          type="range"
          min="0"
          max={MAX_PRICE}
          step="10"
          value={sliderValue}
          onChange={(e) => {
            const next = Number(e.target.value);
            update('maxPricePerDay', next >= MAX_PRICE ? '' : String(next));
          }}
          className="price-slider"
          aria-label="Maximum price per day"
        />
        <div className="price-slider-labels">
          <span>RM0</span>
          <span>{filters.maxPricePerDay ? `Up to RM${filters.maxPricePerDay}` : `RM${MAX_PRICE}+`}</span>
        </div>
      </div>

      <FilterGroup
        title="Transmission"
        options={TRANSMISSIONS}
        activeValue={filters.transmission}
        onSelect={(v) => update('transmission', v)}
      />

      <FilterGroup
        title="Fuel Type"
        options={FUEL_TYPES}
        activeValue={filters.fuelType}
        onSelect={(v) => update('fuelType', v)}
      />

      <FilterGroup title="Seats" options={SEATS} activeValue={filters.seats} onSelect={(v) => update('seats', v)} />

      <span className="filters-count">
        {resultCount} car{resultCount === 1 ? '' : 's'} available
      </span>
    </aside>
  );
}

export default FiltersBar;
