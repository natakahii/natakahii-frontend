import { useCallback, useEffect, useState } from 'react';
import { fetchVendorOverview, VendorOverviewResponse } from '../services/analyticsService';

function mapVendorOverviewError(error: unknown): string {
  const err = error as Error & { status?: number };
  const status = err.status;
  const raw = err instanceof Error ? err.message : '';

  if (status === 401) return 'Please sign in again to view your dashboard.';
  if (status === 403) return 'Your account does not have vendor access.';
  if (status === 404) return 'No vendor store profile found for this account.';
  if (status === 500 || raw === 'Internal Server Error' || raw === 'Server error') {
    return 'Your store data could not be loaded. Please try again.';
  }

  return raw || 'Unable to load vendor data right now.';
}

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
      setError(mapVendorOverviewError(nextError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { overview, isLoading, error, refresh: load };
}
