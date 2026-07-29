import { request } from './api.js';

export function fetchAdminBookings(token) {
  return request('/admin/bookings', { token });
}
