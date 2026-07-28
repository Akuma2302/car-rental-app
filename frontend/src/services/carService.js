import request from './api.js';

export function fetchCars() {
  return request('/cars');
}

export function fetchAvailability(carId, date) {
  return request(`/cars/${carId}/availability?date=${date}`);
}
