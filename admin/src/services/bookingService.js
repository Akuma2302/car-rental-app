import { request } from './api.js';

export function fetchAdminBookings(token) {
  return request('/admin/bookings', { token });
}

export function cancelBooking(token, bookingId) {
  return request(`/admin/bookings/${bookingId}/cancel`, { method: 'PUT', token });
}

export function uploadBookingReceipt(token, bookingId, file) {
  const formData = new FormData();
  formData.append('receipt', file);
  // No Content-Type here — the browser sets its own multipart boundary
  // when FormData is the body and Content-Type is left unset.
  return request(`/admin/bookings/${bookingId}/receipt`, {
    method: 'POST',
    token,
    body: formData,
    headers: {},
  });
}
