// Change this if the backend is deployed somewhere other than localhost.
export const API_BASE_URL = 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.details = data?.errors;
    throw error;
  }

  return data;
}

export default request;
