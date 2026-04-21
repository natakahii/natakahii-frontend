import { apiClient, getAuthToken, setAuthToken, clearAuthToken } from './apiClient';
import { signInWithPopup, signOut } from 'firebase/auth';
import { firebaseAuth, googleAuthProvider } from './firebase';

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

export async function loginWithGoogle(): Promise<LoginResponse> {
  const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
  const idToken = await result.user.getIdToken(true);

  try {
    const response = await apiClient.post<LoginResponse>('/auth/google', JSON.stringify({ id_token: idToken }));
    setAuthToken(response.token);
    return response;
  } catch (error) {
    await signOut(firebaseAuth).catch(() => undefined);
    throw error;
  }
}

export async function fetchCurrentUser(): Promise<{ user: any }> {
  return apiClient.get('/auth/me');
}

export function getCurrentToken(): string | null {
  return getAuthToken();
}

export async function logout() {
  clearAuthToken();
  await signOut(firebaseAuth).catch(() => undefined);
}
