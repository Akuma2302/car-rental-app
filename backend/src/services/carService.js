const carRepository = require('../repositories/carRepository');

function notFound() {
  const err = new Error('Car not found');
  err.status = 404;
  return err;
}

const carService = {
  listCars() {
    return carRepository.findAll();
  },

  listActiveCars() {
    return carRepository.findAllActive();
  },

  getCar(id) {
    return carRepository.findById(id);
  },

  createCar(data) {
    return carRepository.create(data);
  },

  async updateCar(id, data) {
    const updated = await carRepository.update(id, data);
    if (!updated) throw notFound();
    return updated;
  },

  async deleteCar(id) {
    const removed = await carRepository.remove(id);
    if (!removed) throw notFound();
  },

  /**
   * Sets a car's condition (in_service/maintenance/broken). Maintenance or
   * broken automatically takes the car off the public site — a broken car
   * shouldn't be one manual step away from still being bookable. Setting
   * it back to in_service automatically re-enables it too, so the admin
   * isn't left with a car that's "back in service" but still hidden,
   * needing a second separate action to fix.
   */
  async setCondition(id, condition) {
    const car = await carRepository.findById(id);
    if (!car) throw notFound();

    const isActive = condition === 'in_service';
    return carRepository.setStatus(id, { isActive, condition });
  },

  /**
   * Direct enable/disable toggle. Only allowed while condition is
   * in_service — a maintenance/broken car can't be manually re-enabled
   * without first clearing its condition, since that would put a car the
   * business marked unsafe back in front of customers.
   */
  async setActive(id, isActive) {
    const car = await carRepository.findById(id);
    if (!car) throw notFound();

    if (isActive && car.condition !== 'in_service') {
      const err = new Error(
        `Can't enable a car that's ${car.condition === 'broken' ? 'broken' : 'in maintenance'} — set its condition back to "In Service" first.`
      );
      err.status = 409;
      throw err;
    }

    return carRepository.setStatus(id, { isActive, condition: car.condition });
  },
};

module.exports = carService;
