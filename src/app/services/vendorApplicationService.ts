import { apiClient } from './apiClient';

export type VendorApplicationStatus = 'pending' | 'approved' | 'rejected';
export type VendorVerificationDocumentType = 'national_id' | 'driver_licence' | 'voter_id' | 'passport';

export interface VendorVerificationDocumentOption {
  value: VendorVerificationDocumentType;
  label: string;
  description: string;
}

export const vendorVerificationDocumentOptions: VendorVerificationDocumentOption[] = [
  {
    value: 'national_id',
    label: 'National ID',
    description: 'Use a clear scan or photo of your national identity card.',
  },
  {
    value: 'driver_licence',
    label: 'Driver Licence',
    description: 'Use a valid driver licence that matches the applicant details.',
  },
  {
    value: 'voter_id',
    label: 'Voter ID',
    description: 'Use an official voter identification document.',
  },
  {
    value: 'passport',
    label: 'Passport',
    description: 'Use the identification page from a valid passport.',
  },
];

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
  verification_document_type: VendorVerificationDocumentType | '';
  verification_document: File | null;
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
  verification_document_type?: VendorVerificationDocumentType | null;
  verification_document_type_label?: string | null;
  verification_document_original_name?: string | null;
  verification_document_mime_type?: string | null;
  verification_document_size?: number | null;
  verification_document_download_url?: string | null;
  has_verification_document?: boolean;
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
  const formData = new FormData();

  formData.append('business_name', payload.business_name);
  formData.append('business_email', payload.business_email);
  formData.append('full_name', payload.full_name);
  formData.append('phone', payload.phone);
  formData.append('region', payload.region);
  formData.append('city', payload.city || '');
  formData.append('ward', payload.ward);
  formData.append('street', payload.street);
  formData.append('address', payload.address);
  formData.append('description', payload.description || '');
  formData.append('subscription_plan', payload.subscription_plan);
  formData.append('verification_document_type', payload.verification_document_type);

  if (payload.verification_document) {
    formData.append('verification_document', payload.verification_document);
  }

  return apiClient.post<VendorApplicationSubmitResponse>('/vendor-application', formData);
}

export function fetchVendorApplicationStatus() {
  return apiClient.get<VendorApplicationStatusResponse>('/vendor-application/status', { cache: 'no-store' });
}

export function fetchVendorSubscriptionPlans() {
  return apiClient.get<VendorSubscriptionPlansResponse>('/subscription-plans');
}
