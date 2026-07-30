import { useCallback, useEffect, useState } from 'react';
import { fetchBookedRanges } from '../services/carService.js';

/** Fetches a wide window of booked ranges once per car — cheap since it's
 * just start/end pairs, and lets the UI show conflicts instantly as the
 * customer adjusts dates without a network round-trip per keystroke. */
export function useBookedRanges(carId, fromDate, toDate) {
  const [ranges, setRanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    if (!carId) return;
    setLoading(true);
    setError(null);
    fetchBookedRanges(carId, fromDate, toDate)
      .then(setRanges)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [carId, fromDate, toDate]);

  useEffect(() => {
    // Standard fetch-on-dependency-change pattern, see hooks/useCars.js.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  return { ranges, loading, error, reload };
}
