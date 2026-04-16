import { apiClient } from './apiClient';

export interface VendorApplicationPayload {
  business_name: string;
  business_email: string;
  phone_number: string;
  region: string;
  city: string;
  ward: string;
  address: string;
  shop_name: string;
  description: string;
  subscription_plan: 'basic' | 'pro' | 'enterprise';
}

export interface VendorApplicationStatusResponse {
  has_application: boolean;
  application: {
    status: string;
    [key: string]: any;
  } | null;
}

export function submitVendorApplication(payload: VendorApplicationPayload) {
  return apiClient.post<{ message: string; application: any }>('/vendor-application', JSON.stringify(payload));
}

export function fetchVendorApplicationStatus() {
  return apiClient.get<VendorApplicationStatusResponse>('/vendor-application/status');
}
