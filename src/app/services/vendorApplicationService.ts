import { apiClient } from './apiClient';

export type VendorApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface VendorSubscriptionPlanRecord {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number | string;
  billing_cycle: 'monthly' | 'yearly' | string;
  features?: string[] | null;
  feature_access?: Record<string, boolean | number | string> | null;
  is_active: boolean;
  is_free: boolean;
  product_limit?: number | null;
  sort_order?: number | null;
}

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
  subscription_plan: string;
}

export interface VendorApplicationRecord {
  id: number;
  user_id: number;
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
  subscription_plan_id?: number | null;
  subscription_plan?: VendorSubscriptionPlanRecord | null;
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

export interface VendorSubscriptionPlansResponse {
  plans: VendorSubscriptionPlanRecord[];
}

export function submitVendorApplication(payload: VendorApplicationPayload) {
  return apiClient.post<VendorApplicationSubmitResponse>('/vendor-application', JSON.stringify(payload));
}

export function fetchVendorApplicationStatus() {
  return apiClient.get<VendorApplicationStatusResponse>('/vendor-application/status', { cache: 'no-store' });
}

export function fetchVendorSubscriptionPlans() {
  return apiClient.get<VendorSubscriptionPlansResponse>('/subscription-plans');
}
