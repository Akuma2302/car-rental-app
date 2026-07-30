import { useEffect, useState } from 'react';
import { fetchPriceQuote } from '../services/carService.js';

export function usePriceQuote(carId, startAt, endAt) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!carId || !startAt || !endAt || new Date(endAt) <= new Date(startAt)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuote(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    // Small debounce — the two date/time inputs each fire their own change
    // event, so without this a single "adjust the return date" edit would
    // trigger two quote requests in quick succession.
    const timer = setTimeout(() => {
      fetchPriceQuote(carId, startAt, endAt)
        .then((data) => {
          if (!cancelled) setQuote(data);
        })
        .catch((err) => {
          if (!cancelled) setError(err);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [carId, startAt, endAt]);

  return { quote, loading, error };
}
