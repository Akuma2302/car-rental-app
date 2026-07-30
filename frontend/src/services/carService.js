import request from './api.js';

export function fetchCars() {
  return request('/cars');
}

export function fetchBookedRanges(carId, from, to) {
  return request(`/cars/${carId}/booked-ranges?from=${from}&to=${to}`);
}

export function fetchPriceQuote(carId, startAt, endAt) {
  return request(
    `/cars/${carId}/price-quote?startAt=${encodeURIComponent(startAt)}&endAt=${encodeURIComponent(endAt)}`
  );
}
