import { useCallback, useEffect, useState } from 'react';
import { fetchAvailability } from '../services/carService.js';

export function useAvailability(carId, date) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    if (!carId || !date) return;
    setLoading(true);
    setError(null);

    fetchAvailability(carId, date)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [carId, date]);

  useEffect(() => {
    // Standard "refetch when carId/date changes" pattern — see the same
    // note in hooks/useCars.js.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
