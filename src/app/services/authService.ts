import { apiClient, getAuthToken, setAuthToken, clearAuthToken } from './apiClient';

export interface LoginResponse {
  token: string;
  token_type: string;
  expires_in: number;
  user: any;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', JSON.stringify({ email, password }));
  setAuthToken(response.token);
  return response;
}

export async function fetchCurrentUser(): Promise<{ user: any }> {
  return apiClient.get('/auth/me');
}

export function getCurrentToken(): string | null {
  return getAuthToken();
}

export function logout() {
  clearAuthToken();
}
