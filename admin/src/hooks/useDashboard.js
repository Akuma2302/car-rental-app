import { useEffect, useState } from 'react';
import { fetchDashboardOverview } from '../services/dashboardService.js';

export function useDashboard(token, logout) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    // Standard fetch-on-mount pattern, see hooks/useCars.js equivalent note
    // throughout this project.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    fetchDashboardOverview(token)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) {
          logout();
          return;
        }
        setError(err.message || 'Failed to load dashboard');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  return { data, loading, error };
}
