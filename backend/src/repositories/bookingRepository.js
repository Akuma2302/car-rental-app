const JsonStore = require('./jsonStore');

const store = new JsonStore('bookings.json', []);

const bookingRepository = {
  findAll() {
    return store.readAll();
  },

  findByCarAndDate(carId, date) {
    return store.readAll().filter((b) => b.carId === carId && b.date === date);
  },

  isSlotTaken(carId, date, time) {
    return store
      .readAll()
      .some((b) => b.carId === carId && b.date === date && b.time === time);
  },

  create(booking) {
    const bookings = store.readAll();
    bookings.push(booking);
    store.writeAll(bookings);
    return booking;
  },
};

module.exports = bookingRepository;
