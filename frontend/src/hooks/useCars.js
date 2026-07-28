import { useEffect, useState } from 'react';
import { fetchCars } from '../services/carService.js';

export function useCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // Standard fetch-on-mount pattern (react.dev/learn/synchronizing-with-effects).
    // This project has no dedicated data-fetching library, so this is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    fetchCars()
      .then((data) => {
        if (!cancelled) setCars(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { cars, loading, error };
}
