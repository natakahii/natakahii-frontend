import { apiClient, getAuthToken, setAuthToken, clearAuthToken } from './apiClient';
import { signInWithPopup, signOut } from 'firebase/auth';
import { firebaseAuth, googleAuthProvider } from './firebase';

export interface AuthRole {
  id?: number;
  name?: string;
  description?: string | null;
}

export interface AuthSubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: string | number;
  billing_cycle: 'monthly' | 'yearly' | string;
  features?: string[] | null;
  feature_access?: Record<string, boolean | number | string> | null;
  is_active: boolean;
  is_free: boolean;
  product_limit?: number | null;
  sort_order?: number | null;
}

export interface AuthVendor {
  id: number;
  user_id: number;
  subscription_plan_id?: number | null;
  shop_name: string;
  shop_slug: string;
  description?: string | null;
  logo?: string | null;
  commission_rate?: string | number | null;
  status?: string | null;
  subscription_plan?: AuthSubscriptionPlan | null;
  verification_level?: 'unverified' | 'kyc_verified' | 'subscription_verified' | string | null;
  verification_label?: string | null;
  has_kyc_verification?: boolean;
  has_premium_verification?: boolean;
  can_upgrade_subscription?: boolean;
  product_limit?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  profile_photo?: string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
  roles: Array<AuthRole | string>;
  vendor?: AuthVendor | null;
}

export interface AuthResponse {
  message?: string;
  token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterInitiationResponse {
  message: string;
  email: string;
  delivery_channels?: {
    email: boolean;
    sms: boolean;
  };
}

export interface VerifyRegistrationPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

export type OtpType = 'registration' | 'password_reset' | 'email_verification';

export interface OtpDispatchResponse {
  message: string;
  delivery_channels?: {
    email: boolean;
    sms: boolean;
  };
}

export function getUserRoleNames(user: AuthUser | null | undefined): string[] {
  if (!user || !Array.isArray(user.roles)) {
    return [];
  }

  return user.roles
    .map((role) => (typeof role === 'string' ? role : role?.name))
    .filter((role): role is string => Boolean(role));
}

export function hasUserRole(user: AuthUser | null | undefined, role: string): boolean {
  return getUserRoleNames(user).includes(role);
}

export function resolveUserDefaultRoute(user: AuthUser | null | undefined): string {
  if (hasUserRole(user, 'vendor')) {
    return '/vendor/dashboard';
  }

  return '/customer';
}

export async function login(identifier: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', JSON.stringify({ identifier, password }));
  setAuthToken(response.token);
  return response;
}

export async function loginWithGoogle(): Promise<AuthResponse> {
  const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
  const idToken = await result.user.getIdToken(true);

  try {
    const response = await apiClient.post<AuthResponse>('/auth/google', JSON.stringify({ id_token: idToken }));
    setAuthToken(response.token);
    return response;
  } catch (error) {
    await signOut(firebaseAuth).catch(() => undefined);
    throw error;
  }
}

export async function register(payload: RegisterPayload): Promise<RegisterInitiationResponse> {
  return apiClient.post<RegisterInitiationResponse>('/auth/register', JSON.stringify(payload));
}

export async function verifyRegistration(payload: VerifyRegistrationPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/verify-registration', JSON.stringify(payload));
  setAuthToken(response.token);
  return response;
}

export async function resendOtp(email: string, type: OtpType): Promise<OtpDispatchResponse> {
  return apiClient.post<OtpDispatchResponse>('/auth/resend-otp', JSON.stringify({ email, type }));
}

export async function forgotPassword(email: string): Promise<OtpDispatchResponse> {
  return apiClient.post<OtpDispatchResponse>('/auth/forgot-password', JSON.stringify({ email }));
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/auth/reset-password', JSON.stringify(payload));
}

export async function refreshToken(): Promise<{ token: string; token_type: string; expires_in: number }> {
  const response = await apiClient.post<{ token: string; token_type: string; expires_in: number }>('/auth/refresh', undefined);
  setAuthToken(response.token);
  return response;
}

export async function fetchCurrentUser(): Promise<{ user: AuthUser }> {
  return apiClient.get('/auth/me');
}

export function getCurrentToken(): string | null {
  return getAuthToken();
}

export async function clearLocalSession() {
  clearAuthToken();
  await signOut(firebaseAuth).catch(() => undefined);
}

export async function logout() {
  try {
    if (getAuthToken()) {
      await apiClient.post<{ message: string }>('/auth/logout', undefined);
    }
  } finally {
    await clearLocalSession();
  }
}
