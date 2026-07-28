const carRepository = require('../repositories/carRepository');

const carService = {
  listCars() {
    return carRepository.findAll();
  },

  getCar(id) {
    return carRepository.findById(id);
  },
};

module.exports = carService;
