import { apiClient } from './apiClient';
import {
  CatalogCategory,
  CatalogProduct,
  CatalogVendor,
  extractResourceArray,
  normalizeCategory,
  normalizeProduct,
  normalizeVendor,
  toNumber,
} from './productService';

export interface StorefrontFilterParams {
  search?: string;
  category?: string;
  sortBy?: 'created_at' | 'price' | 'name';
  sortDir?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface StorefrontResponse {
  vendor: CatalogVendor;
  products: CatalogProduct[];
  categories: CatalogCategory[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export async function fetchVendorStorefront(shopSlug: string, params: StorefrontFilterParams = {}): Promise<StorefrontResponse> {
  const query = new URLSearchParams();

  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category_id', params.category);
  if (params.sortBy) query.set('sort_by', params.sortBy);
  if (params.sortDir) query.set('sort_dir', params.sortDir);
  if (params.page) query.set('page', String(params.page));
  if (params.per_page) query.set('per_page', String(params.per_page));

  const queryString = query.toString();
  const response = await apiClient.get<any>(`/shops/${encodeURIComponent(shopSlug)}${queryString ? `?${queryString}` : ''}`);
  const productsPayload = response?.products;
  const nestedMeta = productsPayload && typeof productsPayload === 'object' ? productsPayload.meta : undefined;
  const meta = response?.meta || nestedMeta || {};

  return {
    vendor: normalizeVendor(response?.vendor) || {
      id: 0,
      shop_name: 'Store',
    },
    products: extractResourceArray<any>(productsPayload).map(normalizeProduct),
    categories: extractResourceArray<any>(response?.filters?.categories).map(normalizeCategory),
    meta: {
      current_page: toNumber(meta.current_page, 1),
      last_page: toNumber(meta.last_page, 1),
      per_page: toNumber(meta.per_page, params.per_page ?? 12),
      total: toNumber(meta.total, 0),
    },
  };
}
