// Set VITE_API_URL when deploying (Netlify/Vercel: add it in the site's
// environment variables settings) so this doesn't need editing by hand.
// Falls back to your local backend for `npm run dev`.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

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
