import { siteConfig } from '../../utils/siteConfig.js';

function buildHourOptions() {
  const options = [];
  for (let h = siteConfig.openHour; h <= siteConfig.closeHour; h++) {
    options.push(`${String(h).padStart(2, '0')}:00`);
  }
  return options;
}

const HOUR_OPTIONS = buildHourOptions();

function DateTimeField({ label, dateValue, timeValue, onDateChange, onTimeChange, min, max, idPrefix }) {
  return (
    <div className="datetime-field">
      <label htmlFor={`${idPrefix}-date`}>{label}</label>
      <div className="datetime-inputs">
        <input
          id={`${idPrefix}-date`}
          type="date"
          value={dateValue}
          min={min}
          max={max}
          onChange={(e) => onDateChange(e.target.value)}
          required
        />
        <select
          id={`${idPrefix}-time`}
          aria-label={`${label} time`}
          value={timeValue}
          onChange={(e) => onTimeChange(e.target.value)}
        >
          {HOUR_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default DateTimeField;
