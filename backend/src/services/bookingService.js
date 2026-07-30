const carRepository = require('../repositories/carRepository');
const bookingRepository = require('../repositories/bookingRepository');
const { calculatePrice, describeDuration } = require('./pricingService');
const { buildWhatsappLink } = require('../utils/whatsapp');

const POSTGRES_EXCLUSION_VIOLATION = '23P01';

const bookingService = {
  getBookedRanges(carId, fromDate, toDate) {
    return bookingRepository.findRangesForCar(carId, fromDate, toDate);
  },

  getActiveNow() {
    return bookingRepository.findActiveNow();
  },

  listAll() {
    return bookingRepository.findAll();
  },

  /** Live price quote shown to the customer before they commit — the
   * booking creation step below recomputes this itself server-side rather
   * than trusting whatever the frontend sends. */
  async previewPrice(carId, startAt, endAt) {
    const car = await carRepository.findById(carId);
    if (!car) {
      const err = new Error('Car not found');
      err.status = 404;
      throw err;
    }
    const totalPrice = calculatePrice(car, startAt, endAt);
    return { totalPrice, duration: describeDuration(startAt, endAt) };
  },

  /**
   * Persists the booking and returns it alongside a ready-to-open WhatsApp
   * link. Relies on the database's own EXCLUDE constraint to guarantee the
   * range really is free — closes the race condition an application-level
   * "check, then write" approach would have under concurrent requests.
   */
  async createBookingWithNotification({ carId, startAt, endAt, customerName, customerPhone }) {
    const car = await carRepository.findById(carId);
    if (!car) {
      const err = new Error('Car not found');
      err.status = 404;
      throw err;
    }

    const totalPrice = calculatePrice(car, startAt, endAt);

    let booking;
    try {
      booking = await bookingRepository.create({
        carId,
        startAt,
        endAt,
        totalPrice,
        customerName,
        customerPhone,
      });
    } catch (err) {
      if (err.code === POSTGRES_EXCLUSION_VIOLATION) {
        const conflict = new Error(
          'That time range overlaps a booking someone else just made — please pick a different date/time.'
        );
        conflict.status = 409;
        throw conflict;
      }
      throw err;
    }

    const whatsappUrl = buildWhatsappLink({ car, startAt, endAt, totalPrice, customerName, customerPhone });

    return { booking, whatsappUrl };
  },
};

module.exports = bookingService;
