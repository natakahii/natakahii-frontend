import { apiClient } from './apiClient';
import { AuthVendor } from './authService';

export interface VendorProfileResponse {
  message: string;
  vendor: AuthVendor;
}

export interface SaveVendorProfilePayload {
  shop_name: string;
  shop_slug: string;
  description?: string;
  logo?: File | null;
}

export function saveVendorProfile(payload: SaveVendorProfilePayload) {
  const formData = new FormData();
  formData.append('shop_name', payload.shop_name);
  formData.append('shop_slug', payload.shop_slug);
  formData.append('description', payload.description || '');

  if (payload.logo) {
    formData.append('logo', payload.logo);
  }

  return apiClient.post<VendorProfileResponse>('/vendor/profile', formData);
}
