import { apiClient } from './apiClient';

export function fetchVendorDropoffs(perPage = 15) {
  return apiClient.get<{ dropoffs: { data: any[]; current_page?: number; last_page?: number } }>(`/vendor/dropoffs?per_page=${perPage}`);
}

export function createVendorDropoff(payload: {
  order_id: string;
  fulfillment_center_id: string;
  notes?: string;
}) {
  return apiClient.post<{ message: string; dropoff: any }>('/vendor/dropoffs', JSON.stringify(payload));
}
