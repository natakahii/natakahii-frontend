import { apiClient } from './apiClient';

export interface VendorOverviewResponse {
  analytics: {
    total_products: number;
    active_products: number;
    total_orders: number;
    total_revenue: number;
  };
}

export function fetchVendorOverview() {
  return apiClient.get<VendorOverviewResponse>('/vendor/overview');
}
