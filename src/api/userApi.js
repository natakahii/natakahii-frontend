import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.natakahii.com';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const userApi = {
  // Profile
  updateProfile(payload) {
    return api.patch('/profile', payload).then((r) => r.data);
  },

  updatePhoto(formData) {
    return api.post('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then((r) => r.data);
  },

  deletePhoto() {
    return api.delete('/profile/photo').then((r) => r.data);
  },

  // Vendor Application
  vendorApplicationStatus() {
    return api.get('/vendor-application/status').then((r) => r.data);
  },

  submitVendorApplication(payload) {
    return api.post('/vendor-application', payload).then((r) => r.data);
  },
};
