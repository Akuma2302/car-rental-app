const env = require('../config/env');
const carRepository = require('../repositories/carRepository');
const bookingRepository = require('../repositories/bookingRepository');
const { createBooking } = require('../models/Booking');
const { buildWhatsappLink } = require('../utils/whatsapp');

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
  getAvailability(carId, date) {
    const allSlots = buildDaySlots();
    const bookedForDay = bookingRepository.findByCarAndDate(carId, date);
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
   * Validates the car exists and the slot is still free, persists the
   * booking, then returns it alongside a ready-to-open WhatsApp link.
   */
  createBookingWithNotification({ carId, date, time, customerName, customerPhone }) {
    const car = carRepository.findById(carId);
    if (!car) {
      const err = new Error('Car not found');
      err.status = 404;
      throw err;
    }

    if (bookingRepository.isSlotTaken(carId, date, time)) {
      const err = new Error(
        'That time slot was just booked by someone else — please pick another.'
      );
      err.status = 409;
      throw err;
    }

    const booking = createBooking({
      id: `${carId}-${date}-${time}-${Date.now()}`,
      carId,
      date,
      time,
      customerName,
      customerPhone,
    });

    bookingRepository.create(booking);

    const whatsappUrl = buildWhatsappLink({ car, date, time, customerName, customerPhone });

    return { booking, whatsappUrl };
  },
};

module.exports = bookingService;
