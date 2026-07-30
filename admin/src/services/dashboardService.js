import { request } from './api.js';

export function fetchDashboardOverview(token) {
  return request('/admin/dashboard', { token });
}
