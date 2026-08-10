import request from './api.js';

export function createBooking(payload) {
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchBookingStatus(bookingId) {
  return request(`/bookings/${bookingId}`);
}

export function cancelOwnBooking(bookingId) {
  return request(`/bookings/${bookingId}/cancel`, { method: 'POST' });
}
