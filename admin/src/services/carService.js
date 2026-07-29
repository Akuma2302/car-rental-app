import { request } from './api.js';

export function fetchCars() {
  return request('/cars');
}

export function createCar(token, payload) {
  return request('/admin/cars', { method: 'POST', token, body: JSON.stringify(payload) });
}

export function updateCar(token, carId, payload) {
  return request(`/admin/cars/${carId}`, { method: 'PUT', token, body: JSON.stringify(payload) });
}

export function deleteCar(token, carId) {
  return request(`/admin/cars/${carId}`, { method: 'DELETE', token });
}
