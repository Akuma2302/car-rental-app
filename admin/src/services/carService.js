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
