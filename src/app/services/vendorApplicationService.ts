import { apiClient } from './apiClient';

export type VendorApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface VendorApplicationPayload {
  business_name: string;
  business_email: string;
  full_name: string;
  phone: string;
  region: string;
  city?: string;
  ward: string;
  street: string;
  address: string;
  description?: string;
}

export interface VendorApplicationRecord extends VendorApplicationPayload {
  id: number;
  user_id: number;
  status: VendorApplicationStatus;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface VendorApplicationStatusResponse {
  has_application: boolean;
  application: VendorApplicationRecord | null;
}

export interface VendorApplicationSubmitResponse {
  message: string;
  application: VendorApplicationRecord;
}

export function submitVendorApplication(payload: VendorApplicationPayload) {
  return apiClient.post<VendorApplicationSubmitResponse>('/vendor-application', JSON.stringify(payload));
}

export function fetchVendorApplicationStatus() {
  return apiClient.get<VendorApplicationStatusResponse>('/vendor-application/status');
}
