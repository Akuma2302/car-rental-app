import request from './api.js';

export function createBooking(payload) {
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function confirmPayment(bookingId, file) {
  const formData = new FormData();
  formData.append('receipt', file);
  // No Content-Type here — the browser sets its own multipart boundary
  // when FormData is the body and Content-Type is left unset.
  return request(`/bookings/${bookingId}/confirm-payment`, {
    method: 'POST',
    body: formData,
    headers: {},
  });
}

export function fetchBookingStatus(bookingId) {
  return request(`/bookings/${bookingId}`);
}

export function cancelOwnBooking(bookingId) {
  return request(`/bookings/${bookingId}/cancel`, { method: 'POST' });
}
