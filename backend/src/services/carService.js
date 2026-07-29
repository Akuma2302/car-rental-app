const carRepository = require('../repositories/carRepository');

const carService = {
  listCars() {
    return carRepository.findAll();
  },

  getCar(id) {
    return carRepository.findById(id);
  },

  createCar(data) {
    return carRepository.create(data);
  },

  async updateCar(id, data) {
    const updated = await carRepository.update(id, data);
    if (!updated) {
      const err = new Error('Car not found');
      err.status = 404;
      throw err;
    }
    return updated;
  },

  async deleteCar(id) {
    const removed = await carRepository.remove(id);
    if (!removed) {
      const err = new Error('Car not found');
      err.status = 404;
      throw err;
    }
  },
};

module.exports = carService;
