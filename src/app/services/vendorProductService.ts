import { apiClient } from './apiClient';
import {
  CatalogProduct,
  normalizeProduct,
} from './productService';

export type VendorProductStatus = 'draft' | 'active' | 'out_of_stock';

export interface VendorProductFilters {
  status?: VendorProductStatus | 'all';
  categoryId?: string;
  search?: string;
  perPage?: number;
  sortBy?: 'updated_at' | 'created_at' | 'price' | 'name' | 'stock';
  sortDir?: 'asc' | 'desc';
  page?: number;
}

export interface VendorProductAttributeValueOption {
  id: number;
  attribute_id: number;
  value: string;
  sort_order?: number;
}

export interface VendorProductAttributeOption {
  id: number;
  name: string;
  code?: string;
  type?: string;
  is_filterable?: boolean;
  is_variant_attribute?: boolean;
  sort_order?: number;
  values: VendorProductAttributeValueOption[];
}

export interface VendorProductMedia {
  id: number;
  product_id: number;
  vendor_id?: number;
  type: 'image' | 'video';
  file_path: string;
  mime_type?: string | null;
  file_size?: number | null;
  title?: string | null;
  description?: string | null;
  sort_order?: number;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VendorProductVariantPayload {
  sku: string;
  price: number;
  discount_price?: number | null;
  stock: number;
  image?: File;
  attributes: Array<{
    attribute_id: number;
    attribute_value_id: number;
  }>;
}

export interface VendorProductPayload {
  category_id: number;
  name: string;
  description: string;
  price: number;
  discount_price?: number | null;
  stock: number;
  status: VendorProductStatus;
  images?: File[];
  keep_image_ids?: number[];
  variants?: VendorProductVariantPayload[];
}

export interface VendorProductListResponse {
  products: CatalogProduct[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface VendorProductDetailResponse {
  product: CatalogProduct;
  social_media: VendorProductMedia[];
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function extractResourceArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown[] }).data)) {
    return (payload as { data: T[] }).data;
  }

  return [];
}

function normalizeAttributeValue(value: any): VendorProductAttributeValueOption {
  return {
    id: toNumber(value?.id),
    attribute_id: toNumber(value?.attribute_id),
    value: value?.value || '',
    sort_order: value?.sort_order == null ? undefined : toNumber(value.sort_order),
  };
}

function normalizeAttribute(attribute: any): VendorProductAttributeOption {
  return {
    id: toNumber(attribute?.id),
    name: attribute?.name || 'Attribute',
    code: attribute?.code || undefined,
    type: attribute?.type || undefined,
    is_filterable: attribute?.is_filterable == null ? undefined : Boolean(attribute.is_filterable),
    is_variant_attribute: attribute?.is_variant_attribute == null ? undefined : Boolean(attribute.is_variant_attribute),
    sort_order: attribute?.sort_order == null ? undefined : toNumber(attribute.sort_order),
    values: extractResourceArray<any>(attribute?.values).map(normalizeAttributeValue),
  };
}

function normalizeMedia(media: any): VendorProductMedia {
  return {
    id: toNumber(media?.id),
    product_id: toNumber(media?.product_id),
    vendor_id: media?.vendor_id == null ? undefined : toNumber(media.vendor_id),
    type: media?.type === 'video' ? 'video' : 'image',
    file_path: media?.file_path || '',
    mime_type: media?.mime_type || null,
    file_size: media?.file_size == null ? null : toNumber(media.file_size),
    title: media?.title || null,
    description: media?.description || null,
    sort_order: media?.sort_order == null ? undefined : toNumber(media.sort_order),
    is_featured: media?.is_featured == null ? undefined : Boolean(media.is_featured),
    created_at: media?.created_at || undefined,
    updated_at: media?.updated_at || undefined,
  };
}

function buildVendorProductFormData(payload: VendorProductPayload, methodOverride?: 'PATCH') {
  const formData = new FormData();

  if (methodOverride) {
    formData.append('_method', methodOverride);
  }

  formData.append('category_id', String(payload.category_id));
  formData.append('name', payload.name);
  formData.append('description', payload.description);
  formData.append('price', String(payload.price));
  formData.append('stock', String(payload.stock));
  formData.append('status', payload.status);

  if (payload.discount_price != null && payload.discount_price !== 0) {
    formData.append('discount_price', String(payload.discount_price));
  }

  if (payload.keep_image_ids) {
    formData.append('keep_image_ids', JSON.stringify(payload.keep_image_ids));
  }

  if (payload.variants) {
    formData.append('variants', JSON.stringify(payload.variants));
  }

  payload.images?.forEach((image) => {
    formData.append('images[]', image);
  });

  return formData;
}

export async function fetchVendorProducts(filters: VendorProductFilters = {}): Promise<VendorProductListResponse> {
  const query = new URLSearchParams();

  if (filters.status && filters.status !== 'all') query.set('status', filters.status);
  if (filters.categoryId && filters.categoryId !== 'all') query.set('category_id', filters.categoryId);
  if (filters.search) query.set('search', filters.search);
  if (filters.perPage) query.set('per_page', String(filters.perPage));
  if (filters.sortBy) query.set('sort_by', filters.sortBy);
  if (filters.sortDir) query.set('sort_dir', filters.sortDir);
  if (filters.page) query.set('page', String(filters.page));

  const response = await apiClient.get<any>(`/vendor/products${query.toString() ? `?${query.toString()}` : ''}`);
  const productsPayload = response?.products;
  const nestedMeta = productsPayload && typeof productsPayload === 'object' ? productsPayload.meta : undefined;
  const meta = response?.meta || nestedMeta || {};

  return {
    products: extractResourceArray<any>(productsPayload).map(normalizeProduct),
    meta: {
      current_page: toNumber(meta.current_page, 1),
      last_page: toNumber(meta.last_page, 1),
      per_page: toNumber(meta.per_page, filters.perPage ?? 15),
      total: toNumber(meta.total, 0),
    },
  };
}

export async function fetchVendorProduct(productId: string | number): Promise<VendorProductDetailResponse> {
  const response = await apiClient.get<any>(`/vendor/products/${productId}`);

  return {
    product: normalizeProduct(response?.product),
    social_media: extractResourceArray<any>(response?.social_media).map(normalizeMedia),
  };
}

export async function fetchVendorProductOptions(): Promise<VendorProductAttributeOption[]> {
  const response = await apiClient.get<any>('/vendor/product-options');
  return extractResourceArray<any>(response?.variant_attributes).map(normalizeAttribute);
}

export async function createVendorProduct(payload: VendorProductPayload | FormData): Promise<VendorProductDetailResponse & { message: string }> {
  const formData = payload instanceof FormData ? payload : buildVendorProductFormData(payload);
  const response = await apiClient.post<any>('/vendor/products', formData);

  return {
    message: response?.message || 'Product created successfully.',
    product: normalizeProduct(response?.product),
    social_media: extractResourceArray<any>(response?.social_media).map(normalizeMedia),
  };
}

export async function updateVendorProduct(productId: string | number, payload: VendorProductPayload | FormData): Promise<VendorProductDetailResponse & { message: string }> {
  const formData = payload instanceof FormData ? payload : buildVendorProductFormData(payload, 'PATCH');
  const response = await apiClient.post<any>(`/vendor/products/${productId}`, formData);

  return {
    message: response?.message || 'Product updated successfully.',
    product: normalizeProduct(response?.product),
    social_media: extractResourceArray<any>(response?.social_media).map(normalizeMedia),
  };
}

export async function updateVendorProductStatus(productId: string | number, status: VendorProductStatus): Promise<{ message: string; product: CatalogProduct }> {
  const response = await apiClient.patch<any>(`/vendor/products/${productId}/status`, JSON.stringify({ status }));

  return {
    message: response?.message || 'Product status updated.',
    product: normalizeProduct(response?.product),
  };
}

export async function deleteVendorProduct(productId: string | number): Promise<{ message: string }> {
  const response = await apiClient.delete<any>(`/vendor/products/${productId}`);
  return {
    message: response?.message || 'Product deleted successfully.',
  };
}

export async function uploadVendorProductMedia(
  productId: string | number,
  payload: { file: File; type: 'image' | 'video'; title?: string; description?: string }
): Promise<{ message: string; media: VendorProductMedia }> {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('type', payload.type);

  if (payload.title) {
    formData.append('title', payload.title);
  }

  if (payload.description) {
    formData.append('description', payload.description);
  }

  const response = await apiClient.post<any>(`/vendor/products/${productId}/media`, formData);

  return {
    message: response?.message || 'Media uploaded.',
    media: normalizeMedia(response?.media),
  };
}

export async function deleteVendorProductMedia(mediaId: string | number): Promise<{ message: string }> {
  const response = await apiClient.delete<any>(`/vendor/media/${mediaId}`);
  return {
    message: response?.message || 'Media deleted.',
  };
}
