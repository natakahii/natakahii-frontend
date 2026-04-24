import { apiClient } from './apiClient';
import { AuthUser } from './authService';

export interface ProfileResponse {
  message: string;
  user: AuthUser;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string | null;
}

export function updateProfile(payload: UpdateProfilePayload) {
  return apiClient.patch<ProfileResponse>('/profile', JSON.stringify(payload));
}

export function updateProfilePhoto(formData: FormData) {
  return apiClient.post<ProfileResponse>('/profile/photo', formData);
}

export function removeProfilePhoto() {
  return apiClient.delete<ProfileResponse>('/profile/photo');
}
