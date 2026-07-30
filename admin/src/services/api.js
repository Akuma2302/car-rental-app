// Set VITE_API_URL when deploying. Falls back to the local backend for `npm run dev`.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function request(path, { token, headers, body, ...options } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const finalHeaders = { ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...headers };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, body, headers: finalHeaders });

  // 204 No Content (car delete) has no body to parse.
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.details = data?.errors;
    throw error;
  }

  return data;
}
