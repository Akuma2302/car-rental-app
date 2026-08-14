import { siteConfig } from '../../utils/siteConfig.js';

function buildHourOptions() {
  const options = [];
  for (let h = siteConfig.openHour; h <= siteConfig.closeHour; h++) {
    options.push(String(h).padStart(2, '0'));
  }
  return options;
}

const HOUR_OPTIONS = buildHourOptions();
const CLOSE_HOUR_STR = String(siteConfig.closeHour).padStart(2, '0');
const MINUTE_OPTIONS = [
    '00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
    '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
    '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',
    '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
    '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
    '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'
];

function DateTimeField({ label, dateValue, timeValue, onDateChange, onTimeChange, min, max, idPrefix }) {
  const [hour, minute] = (timeValue || '00:00').split(':');

  // At exactly closing hour, only :00 is valid — counter hours end there,
  // so offering :15/:30/:45 at that hour would let someone pick a time
  // past close.
  const minuteOptions = hour === CLOSE_HOUR_STR ? ['00'] : MINUTE_OPTIONS;

  function handleHourChange(nextHour) {
    const nextMinute = nextHour === CLOSE_HOUR_STR ? '00' : minute;
    onTimeChange(`${nextHour}:${nextMinute}`);
  }

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
          id={`${idPrefix}-hour`}
          aria-label={`${label} hour`}
          value={hour}
          onChange={(e) => handleHourChange(e.target.value)}
        >
          {HOUR_OPTIONS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <select
          id={`${idPrefix}-minute`}
          aria-label={`${label} minute`}
          value={minute}
          onChange={(e) => onTimeChange(`${hour}:${e.target.value}`)}
        >
          {minuteOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default DateTimeField;
