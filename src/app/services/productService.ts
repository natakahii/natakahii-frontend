import { apiClient } from './apiClient';

export interface ProductFilterParams {
  vendorId?: string;
  status?: string;
  category?: string;
  search?: string;
  per_page?: number;
}

export function fetchProducts(params: ProductFilterParams = {}) {
  const query = new URLSearchParams();

  if (params.vendorId) query.set('vendor_id', params.vendorId);
  if (params.status) query.set('status', params.status);
  if (params.category) query.set('category_id', params.category);
  if (params.search) query.set('search', params.search);
  if (params.per_page) query.set('per_page', String(params.per_page));

  const queryString = query.toString();
  return apiClient.get<{ products: any[]; meta?: any }>(`/products${queryString ? `?${queryString}` : ''}`);
}

export function fetchCategories() {
  return apiClient.get<{ data: any[] }>('/categories');
}

export function createVendorProduct(formData: FormData) {
  return apiClient.post<{ message: string; product: any }>('/vendor/products', formData);
}
