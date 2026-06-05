import { useCallback, useEffect, useState } from 'react';
import { fetchVendorOverview, VendorOverviewResponse } from '../services/analyticsService';

export function useVendorOverview() {
  const [overview, setOverview] = useState<VendorOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchVendorOverview();
      setOverview(response);
    } catch (nextError: unknown) {
      setOverview(null);
      const message =
        nextError instanceof Error ? nextError.message : 'Unable to load vendor data right now.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { overview, isLoading, error, refresh: load };
}
