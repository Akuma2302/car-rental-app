import { request } from './api.js';

export function fetchAdminBookings(token) {
  return request('/admin/bookings', { token });
}

export function cancelBooking(token, bookingId) {
  return request(`/admin/bookings/${bookingId}/cancel`, { method: 'PUT', token });
}
