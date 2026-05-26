import { apiClient } from './apiClient';
import { AuthVendor } from './authService';

export interface VendorSubscriptionResponse {
  message?: string;
  vendor: AuthVendor;
}

export function fetchVendorSubscription() {
  return apiClient.get<VendorSubscriptionResponse>('/vendor/subscription-plan');
}

export function updateVendorSubscriptionPlan(subscriptionPlan: string) {
  return apiClient.patch<VendorSubscriptionResponse>(
    '/vendor/subscription-plan',
    JSON.stringify({ subscription_plan: subscriptionPlan })
  );
}
