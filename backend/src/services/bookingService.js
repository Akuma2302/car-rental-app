const env = require('../config/env');
const carRepository = require('../repositories/carRepository');
const bookingRepository = require('../repositories/bookingRepository');
const { buildWhatsappLink } = require('../utils/whatsapp');

const POSTGRES_UNIQUE_VIOLATION = '23505';

function buildDaySlots() {
  const slots = [];
  for (let h = env.openHour; h < env.closeHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
}

const bookingService = {
  /**
   * @returns {{carId:string, date:string, openHour:number, closeHour:number,
   *            slots: {time:string, available:boolean}[]}}
   */
  async getAvailability(carId, date) {
    const allSlots = buildDaySlots();
    const bookedForDay = await bookingRepository.findByCarAndDate(carId, date);
    const bookedTimes = new Set(bookedForDay.map((b) => b.time));

    return {
      carId,
      date,
      openHour: env.openHour,
      closeHour: env.closeHour,
      slots: allSlots.map((time) => ({ time, available: !bookedTimes.has(time) })),
    };
  },

  /**
   * Persists the booking and returns it alongside a ready-to-open WhatsApp
   * link. Relies on the database's own UNIQUE(car_id, date, time)
   * constraint to guarantee the slot really is free — this closes the race
   * condition an application-level "check, then write" approach would have
   * under concurrent requests.
   */
  async createBookingWithNotification({ carId, date, time, customerName, customerPhone }) {
    const car = await carRepository.findById(carId);
    if (!car) {
      const err = new Error('Car not found');
      err.status = 404;
      throw err;
    }

    let booking;
    try {
      booking = await bookingRepository.create({ carId, date, time, customerName, customerPhone });
    } catch (err) {
      if (err.code === POSTGRES_UNIQUE_VIOLATION) {
        const conflict = new Error(
          'That time slot was just booked by someone else — please pick another.'
        );
        conflict.status = 409;
        throw conflict;
      }
      throw err;
    }

    const whatsappUrl = buildWhatsappLink({ car, date, time, customerName, customerPhone });

    return { booking, whatsappUrl };
  },
};

module.exports = bookingService;
