const carRepository = require('../repositories/carRepository');
const bookingRepository = require('../repositories/bookingRepository');
const { calculatePrice, describeDuration } = require('./pricingService');
const { buildWhatsappLink } = require('../utils/whatsapp');
const receiptService = require('./receiptService');

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

    const whatsappUrl = buildWhatsappLink({
      car,
      startAt,
      endAt,
      totalPrice,
      customerName,
      customerPhone,
      bookingId: booking.id,
    });

    return { booking, whatsappUrl };
  },

  /**
   * Second step of the flow: the admin uploads the payment receipt they
   * received from the customer over WhatsApp. Flips the booking from
   * "pending" to "booked". Rejects if the booking doesn't exist or was
   * already confirmed. Admin-only (requireAdmin) — the customer no longer
   * uploads their own receipt.
   */
  async confirmPayment(bookingId, file) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const err = new Error('Booking not found');
      err.status = 404;
      throw err;
    }
    if (booking.status === 'booked') {
      const err = new Error('This booking has already been confirmed.');
      err.status = 409;
      throw err;
    }

    const { url, storagePath } = await receiptService.uploadReceipt(bookingId, file);
    return bookingRepository.confirmPayment(bookingId, { receiptUrl: url, receiptStoragePath: storagePath });
  },

  /**
   * Admin-only. Cancelling frees the car's time range immediately (the
   * database's exclusion constraint ignores cancelled rows) and the
   * booking is excluded from revenue everywhere it's calculated. Rejects
   * if already cancelled, so this can't be "replayed" pointlessly.
   */
  async cancelBooking(bookingId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const err = new Error('Booking not found');
      err.status = 404;
      throw err;
    }
    if (booking.status === 'cancelled') {
      const err = new Error('This booking is already cancelled.');
      err.status = 409;
      throw err;
    }

    return bookingRepository.cancel(bookingId);
  },

  /**
   * Public, customer-facing lookup — used by the "resume your booking"
   * flow (via a link saved locally or included in the WhatsApp message).
   * Scoped by the booking's own unguessable UUID; no admin auth needed,
   * same reasoning as confirmPayment above.
   */
  async getBookingStatus(bookingId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const err = new Error('Booking not found');
      err.status = 404;
      throw err;
    }
    const car = await carRepository.findById(booking.carId);
    return { ...booking, carName: car ? car.name : null };
  },

  /**
   * Public, customer-facing cancel — lets someone back out of their own
   * pending booking (e.g. they changed their mind, or picked the wrong
   * dates) without needing to contact the business. Deliberately only
   * allowed while still "pending": once payment is confirmed, cancelling
   * needs a human (the business), not a public endpoint.
   */
  async cancelOwnBooking(bookingId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const err = new Error('Booking not found');
      err.status = 404;
      throw err;
    }
    if (booking.status !== 'pending') {
      const err = new Error(
        booking.status === 'cancelled'
          ? 'This booking is already cancelled.'
          : 'This booking has already been confirmed — please contact us to cancel it.'
      );
      err.status = 409;
      throw err;
    }

    return bookingRepository.cancel(bookingId);
  },
};

module.exports = bookingService;
