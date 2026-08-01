import { request } from './api.js';

// Admin-only: returns every car, including disabled/maintenance ones, so
// they stay manageable rather than disappearing once taken off the public
// site. This is deliberately a different endpoint from the customer
// frontend's car list, which only shows active cars.
export function fetchCars(token) {
  return request('/admin/cars', { token });
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

export function uploadCarImages(token, carId, files) {
  const formData = new FormData();
  for (const file of files) formData.append('images', file);
  return request(`/admin/cars/${carId}/images`, { method: 'POST', token, body: formData });
}

export function deleteCarImage(token, carId, imageId) {
  return request(`/admin/cars/${carId}/images/${imageId}`, { method: 'DELETE', token });
}

export function setCoverImage(token, carId, imageId) {
  return request(`/admin/cars/${carId}/images/${imageId}/cover`, { method: 'PUT', token });
}

export function setCarCondition(token, carId, condition) {
  return request(`/admin/cars/${carId}/condition`, { method: 'PUT', token, body: JSON.stringify({ condition }) });
}

export function setCarActive(token, carId, isActive) {
  return request(`/admin/cars/${carId}/active`, { method: 'PUT', token, body: JSON.stringify({ isActive }) });
}
