const bookingRepository = require('../repositories/bookingRepository');
const carRepository = require('../repositories/carRepository');

const KPI_WINDOW_DAYS = 30;
const RESERVED_WINDOW_HOURS = 24;
const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

function daysBetween(a, b) {
  return (b.getTime() - a.getTime()) / MS_PER_DAY;
}

/** Portion of [start, end) that falls inside [windowStart, windowEnd), in days. */
function clipToWindowDays(start, end, windowStart, windowEnd) {
  const clippedStart = start > windowStart ? start : windowStart;
  const clippedEnd = end < windowEnd ? end : windowEnd;
  return clippedEnd > clippedStart ? daysBetween(clippedStart, clippedEnd) : 0;
}

const statsService = {
  /**
   * Live counts for the "Fleet Status & Availability" dashboard section.
   * These are independent counts, not a strict partition — a car can only
   * land in one bucket in practice (maintenance takes priority over
   * on-road, which takes priority over reserved), but a manually-disabled
   * car that's otherwise in_service and idle won't appear as "available"
   * either, since it's hidden from the public site.
   */
  async getFleetStatus() {
    const [cars, activeNow, allBookings] = await Promise.all([
      carRepository.findAll(),
      bookingRepository.findActiveNow(),
      bookingRepository.findAll(),
    ]);

    const now = new Date();
    const reservedCutoff = new Date(now.getTime() + RESERVED_WINDOW_HOURS * MS_PER_HOUR);

    const onRoadCarIds = new Set(activeNow.map((b) => b.carId));
    const maintenanceCarIds = new Set(cars.filter((c) => c.condition !== 'in_service').map((c) => c.id));

    const reservedCarIds = new Set(
      allBookings
        .filter(
          (b) =>
            b.status !== 'cancelled' &&
            !onRoadCarIds.has(b.carId) &&
            !maintenanceCarIds.has(b.carId) &&
            new Date(b.startAt) > now &&
            new Date(b.startAt) <= reservedCutoff
        )
        .map((b) => b.carId)
    );

    const available = cars.filter(
      (c) =>
        c.isActive &&
        c.condition === 'in_service' &&
        !onRoadCarIds.has(c.id) &&
        !reservedCarIds.has(c.id)
    );
    const onRoadCars = cars.filter((c) => onRoadCarIds.has(c.id));
    const maintenanceCars = cars.filter((c) => maintenanceCarIds.has(c.id));

    // Slim car summaries for the drill-down lists — name/category only,
    // not the full car record (images etc.) the admin doesn't need here.
    const toSummary = (c) => ({ id: c.id, name: c.name, category: c.category });

    return {
      totalFleet: cars.length,
      onRoad: onRoadCarIds.size,
      available: available.length,
      maintenance: maintenanceCarIds.size,
      reserved: reservedCarIds.size,
      availableCars: available.map(toSummary),
      onRoadCars: onRoadCars.map(toSummary),
      maintenanceCars: maintenanceCars.map(toSummary),
    };
  },

  /**
   * Today's pickups, drop-offs, and any confirmed rental whose return time
   * has already passed. Uses the server's local day boundary — see the
   * timezone caveat already documented for OPEN_HOUR/CLOSE_HOUR in the
   * README; the same reasoning applies here.
   */
  async getTodaySchedule() {
    const allBookings = await bookingRepository.findAll();
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const active = allBookings.filter((b) => b.status !== 'cancelled');

    const pickupsToday = active.filter((b) => {
      const s = new Date(b.startAt);
      return s >= todayStart && s <= todayEnd;
    });
    const dropoffsToday = active.filter((b) => {
      const e = new Date(b.endAt);
      return e >= todayStart && e <= todayEnd;
    });
    const overdue = active.filter((b) => b.status === 'booked' && new Date(b.endAt) < now);

    return { pickupsToday, dropoffsToday, overdue };
  },

  /**
   * Utilization / ADR / RevPAC / idle-time, computed over a rolling
   * KPI_WINDOW_DAYS window so they stay current rather than getting
   * diluted by the fleet's entire history.
   */
  async getKpis() {
    const [cars, allBookings] = await Promise.all([carRepository.findAll(), bookingRepository.findAll()]);
    const activeCars = cars.filter((c) => c.isActive);
    const confirmed = allBookings.filter((b) => b.status === 'booked');

    const now = new Date();
    const windowStart = new Date(now.getTime() - KPI_WINDOW_DAYS * MS_PER_DAY);

    let rentedDays = 0;
    let windowRevenue = 0;
    for (const b of confirmed) {
      const start = new Date(b.startAt);
      const end = new Date(b.endAt);
      const clippedDays = clipToWindowDays(start, end, windowStart, now);
      if (clippedDays <= 0) continue;
      rentedDays += clippedDays;
      const totalDays = daysBetween(start, end) || clippedDays;
      // Pro-rate revenue by however much of the booking falls in the window.
      windowRevenue += b.totalPrice * (clippedDays / totalDays);
    }
    windowRevenue = Math.round(windowRevenue);

    const availableVehicleDays = activeCars.length * KPI_WINDOW_DAYS;
    const utilizationRate = availableVehicleDays > 0 ? (rentedDays / availableVehicleDays) * 100 : 0;
    const averageDailyRate = rentedDays > 0 ? windowRevenue / rentedDays : 0;
    const revPac = activeCars.length > 0 ? windowRevenue / activeCars.length : 0;

    // Average gap between consecutive confirmed bookings, per car, across
    // the car's whole history (not window-limited — idle time is a
    // structural measure, not a recent-activity one).
    const byCar = {};
    for (const b of confirmed) {
      (byCar[b.carId] = byCar[b.carId] || []).push(b);
    }
    const gapsHours = [];
    for (const carBookings of Object.values(byCar)) {
      carBookings.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
      for (let i = 1; i < carBookings.length; i++) {
        const prevEnd = new Date(carBookings[i - 1].endAt);
        const nextStart = new Date(carBookings[i].startAt);
        const gapHours = (nextStart - prevEnd) / MS_PER_HOUR;
        if (gapHours > 0) gapsHours.push(gapHours);
      }
    }
    const averageIdleHours =
      gapsHours.length > 0 ? gapsHours.reduce((sum, h) => sum + h, 0) / gapsHours.length : null;

    return {
      windowDays: KPI_WINDOW_DAYS,
      utilizationRate: Math.round(utilizationRate * 10) / 10,
      averageDailyRate: Math.round(averageDailyRate),
      revPac: Math.round(revPac),
      averageIdleHours: averageIdleHours === null ? null : Math.round(averageIdleHours * 10) / 10,
    };
  },
};

module.exports = statsService;
