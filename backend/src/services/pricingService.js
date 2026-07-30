const env = require('../config/env');

const MS_PER_HOUR = 1000 * 60 * 60;

/**
 * Tiered pricing:
 *  - under HALF_DAY_THRESHOLD_HOURS  -> hourly rate x hours (rounded up)
 *  - under FULL_DAY_THRESHOLD_HOURS  -> flat half-day rate
 *  - at/above FULL_DAY_THRESHOLD_HOURS -> daily rate x number of days (rounded up)
 *
 * This is a simple, explainable model rather than a blended/optimal-rate
 * calculator — documented here and in the README so the business
 * understands exactly how a quoted price was derived.
 */
function calculatePrice(car, startAt, endAt) {
  const hours = (new Date(endAt).getTime() - new Date(startAt).getTime()) / MS_PER_HOUR;

  if (hours <= 0) {
    const err = new Error('endAt must be after startAt');
    err.status = 400;
    throw err;
  }

  if (hours < env.halfDayThresholdHours) {
    return Math.ceil(hours) * car.pricePerHour;
  }
  if (hours < env.fullDayThresholdHours) {
    return car.pricePerHalfDay;
  }
  const days = Math.ceil(hours / 24);
  return days * car.pricePerDay;
}

function describeDuration(startAt, endAt) {
  const hours = (new Date(endAt).getTime() - new Date(startAt).getTime()) / MS_PER_HOUR;
  if (hours < 24) return `${Math.round(hours * 10) / 10} hour${hours === 1 ? '' : 's'}`;
  const days = Math.floor(hours / 24);
  const remHours = Math.round(hours % 24);
  return remHours > 0 ? `${days} day${days === 1 ? '' : 's'} ${remHours}h` : `${days} day${days === 1 ? '' : 's'}`;
}

module.exports = { calculatePrice, describeDuration };
