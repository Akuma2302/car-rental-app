const JsonStore = require('./jsonStore');

// Cars are seed/reference data, so we read the file each call rather than
// caching — that way editing data/cars.json by hand takes effect immediately.
const store = new JsonStore('cars.json', []);

const carRepository = {
  findAll() {
    return store.readAll();
  },

  findById(id) {
    return store.readAll().find((car) => car.id === id) || null;
  },
};

module.exports = carRepository;
