const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? '/api/v1';
const AUTH_TOKEN_KEY = 'natakahii_auth_token';

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;
    const message = errorData?.message || response.statusText || 'Request failed';
    const error = new Error(message) as Error & { status?: number; data?: any };
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return data as T;
}

function buildHeaders(options?: RequestInit): Headers {
  const headers = new Headers(options?.headers as HeadersInit | undefined);
  headers.set('Accept', 'application/json');

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = buildHeaders(options);
  const body = options.body;

  if (body && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) => apiRequest<T>(path, { method: 'GET', ...options }),
  post: <T>(path: string, body: any) => apiRequest<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body: any) => apiRequest<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};
