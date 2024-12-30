import { useState, useEffect } from 'react';
import { fetchOptionExpiryDates } from '../services/polygon';

export function useOptionExpiryDates(symbol: string) {
  const [expiryDates, setExpiryDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setExpiryDates([]);
      return;
    }

    let mounted = true;

    async function loadExpiryDates() {
      try {
        setLoading(true);
        setError(null);
        const dates = await fetchOptionExpiryDates(symbol);
        
        if (mounted) {
          setExpiryDates(dates);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch expiry dates');
          setExpiryDates([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadExpiryDates();

    return () => {
      mounted = false;
    };
  }, [symbol]);

  return { expiryDates, loading, error };
}