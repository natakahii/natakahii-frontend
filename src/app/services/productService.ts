import { apiClient } from './apiClient';

export interface ProductFilterParams {
  vendorId?: string;
  status?: string;
  category?: string;
  search?: string;
  per_page?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'created_at' | 'price' | 'name';
  sortDir?: 'asc' | 'desc';
  page?: number;
}

export interface CatalogCategory {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  icon?: string | null;
  is_active?: boolean;
  sort_order?: number;
  products_count?: number;
  children: CatalogCategory[];
}

export interface CatalogVendor {
  id: number;
  user_id?: number;
  shop_name: string;
  shop_slug?: string;
  description?: string | null;
  logo?: string | null;
  commission_rate?: number | null;
  status?: string | null;
  products_count?: number;
  followers_count?: number;
  // Location fields from VendorApplication
  street?: string | null;
  region?: string | null;
  city?: string | null;
  ward?: string | null;
  address?: string | null;
}

export interface CatalogProductImage {
  id: number;
  product_id?: number;
  image_path: string;
}

export interface CatalogAttribute {
  id: number;
  name: string;
  code?: string;
  type?: string;
}

export interface CatalogAttributeValue {
  id: number;
  value: string;
}

export interface CatalogVariantAttributeValue {
  id: number;
  attribute?: CatalogAttribute;
  attribute_value?: CatalogAttributeValue;
  numeric_value?: number | null;
}

export interface CatalogProductVariant {
  id: number;
  product_id?: number;
  vendor_id?: number;
  variant_signature?: string;
  sku?: string | null;
  price?: number | null;
  discount_price?: number | null;
  stock?: number | null;
  status?: string | null;
  attribute_values: CatalogVariantAttributeValue[];
}

export interface CatalogUserSummary {
  id?: number;
  name?: string;
  profile_photo?: string | null;
}

export interface CatalogReview {
  id: number;
  user_id?: number;
  product_id?: number;
  rating: number;
  comment?: string | null;
  user?: CatalogUserSummary;
  created_at?: string;
}

export interface CatalogProduct {
  id: number;
  vendor_id?: number;
  category_id?: number;
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  discount_price?: number | null;
  effective_price: number;
  stock: number;
  status?: string;
  vendor?: CatalogVendor;
  category?: CatalogCategory;
  images: CatalogProductImage[];
  variants: CatalogProductVariant[];
  reviews_count?: number;
  reviews_avg_rating?: number | null;
  video_count?: number;
  likes_count?: number;
  shares_count?: number;
  is_liked?: boolean;
  is_wishlisted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductListResponse {
  products: CatalogProduct[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ProductDetailResponse {
  product: CatalogProduct;
  recent_reviews: CatalogReview[];
}

export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

export function extractResourceArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown[] }).data)) {
    return (payload as { data: T[] }).data;
  }

  return [];
}

export function normalizeCategory(category: any): CatalogCategory {
  return {
    id: toNumber(category?.id),
    parent_id: category?.parent_id == null ? null : toNumber(category.parent_id),
    name: category?.name || 'Category',
    slug: category?.slug || '',
    icon: category?.icon || null,
    is_active: Boolean(category?.is_active),
    sort_order: category?.sort_order == null ? undefined : toNumber(category.sort_order),
    products_count: category?.products_count == null ? undefined : toNumber(category.products_count),
    children: extractResourceArray<any>(category?.children).map(normalizeCategory),
  };
}

export function normalizeVendor(vendor: any): CatalogVendor | undefined {
  if (!vendor || typeof vendor !== 'object') {
    return undefined;
  }

  return {
    id: toNumber(vendor.id),
    user_id: vendor.user_id == null ? undefined : toNumber(vendor.user_id),
    shop_name: vendor.shop_name || 'Vendor',
    shop_slug: vendor.shop_slug || undefined,
    description: vendor.description || null,
    logo: vendor.logo || null,
    commission_rate: vendor.commission_rate == null ? null : toNumber(vendor.commission_rate),
    status: vendor.status || null,
    products_count: vendor.products_count == null ? undefined : toNumber(vendor.products_count),
    followers_count: vendor.followers_count == null ? undefined : toNumber(vendor.followers_count),
    // Location fields
    street: vendor.street || null,
    region: vendor.region || null,
    city: vendor.city || null,
    ward: vendor.ward || null,
    address: vendor.address || null,
  };
}

function normalizeProductImage(image: any): CatalogProductImage {
  return {
    id: toNumber(image?.id),
    product_id: image?.product_id == null ? undefined : toNumber(image.product_id),
    image_path: image?.image_path || '',
  };
}

function normalizeVariantAttributeValue(attributeValue: any): CatalogVariantAttributeValue {
  return {
    id: toNumber(attributeValue?.id),
    attribute: attributeValue?.attribute
      ? {
          id: toNumber(attributeValue.attribute.id),
          name: attributeValue.attribute.name || 'Option',
          code: attributeValue.attribute.code || undefined,
          type: attributeValue.attribute.type || undefined,
        }
      : undefined,
    attribute_value: attributeValue?.attribute_value
      ? {
          id: toNumber(attributeValue.attribute_value.id),
          value: attributeValue.attribute_value.value || '',
        }
      : undefined,
    numeric_value: attributeValue?.numeric_value == null ? null : toNumber(attributeValue.numeric_value),
  };
}

function normalizeProductVariant(variant: any): CatalogProductVariant {
  return {
    id: toNumber(variant?.id),
    product_id: variant?.product_id == null ? undefined : toNumber(variant.product_id),
    vendor_id: variant?.vendor_id == null ? undefined : toNumber(variant.vendor_id),
    variant_signature: variant?.variant_signature || undefined,
    sku: variant?.sku || null,
    price: variant?.price == null ? null : toNumber(variant.price),
    discount_price: variant?.discount_price == null ? null : toNumber(variant.discount_price),
    stock: variant?.stock == null ? null : toNumber(variant.stock),
    status: variant?.status || null,
    attribute_values: extractResourceArray<any>(variant?.attribute_values).map(normalizeVariantAttributeValue),
  };
}

export function normalizeProduct(product: any): CatalogProduct {
  const basePrice = toNumber(product?.price);
  const discountPrice = product?.discount_price == null ? null : toNumber(product.discount_price);
  const effectivePrice = product?.effective_price == null ? (discountPrice ?? basePrice) : toNumber(product.effective_price);

  return {
    id: toNumber(product?.id),
    vendor_id: product?.vendor_id == null ? undefined : toNumber(product.vendor_id),
    category_id: product?.category_id == null ? undefined : toNumber(product.category_id),
    name: product?.name || 'Product',
    slug: product?.slug || undefined,
    description: product?.description || null,
    price: basePrice,
    discount_price: discountPrice,
    effective_price: effectivePrice,
    stock: toNumber(product?.stock),
    status: product?.status || 'active',
    vendor: normalizeVendor(product?.vendor),
    category: product?.category ? normalizeCategory(product.category) : undefined,
    images: extractResourceArray<any>(product?.images).map(normalizeProductImage),
    variants: extractResourceArray<any>(product?.variants).map(normalizeProductVariant),
    reviews_count: product?.reviews_count == null ? undefined : toNumber(product.reviews_count),
    reviews_avg_rating: product?.reviews_avg_rating == null ? null : toNumber(product.reviews_avg_rating),
    video_count: product?.video_count == null ? undefined : toNumber(product.video_count),
    likes_count: product?.likes_count == null ? undefined : toNumber(product.likes_count),
    shares_count: product?.shares_count == null ? undefined : toNumber(product.shares_count),
    is_liked: product?.is_liked_by_user ?? product?.is_liked ?? false,
    is_wishlisted: product?.is_wishlisted_by_user ?? product?.is_wishlisted ?? false,
    created_at: product?.created_at || undefined,
    updated_at: product?.updated_at || undefined,
  };
}

function normalizeReview(review: any): CatalogReview {
  return {
    id: toNumber(review?.id),
    user_id: review?.user_id == null ? undefined : toNumber(review.user_id),
    product_id: review?.product_id == null ? undefined : toNumber(review.product_id),
    rating: toNumber(review?.rating),
    comment: review?.comment || null,
    user: review?.user
      ? {
          id: review.user.id == null ? undefined : toNumber(review.user.id),
          name: review.user.name || 'Customer',
          profile_photo: review.user.profile_photo || null,
        }
      : undefined,
    created_at: review?.created_at || undefined,
  };
}

export function getProductPrice(product: Pick<CatalogProduct, 'effective_price'>): number {
  return toNumber(product.effective_price);
}

export function getProductPrimaryImage(product: Pick<CatalogProduct, 'images'>): string {
  return product.images[0]?.image_path || '/natakahii-logo.png';
}

export function getProductDiscountPercent(product: Pick<CatalogProduct, 'price' | 'discount_price'>): number | null {
  const price = toNumber(product.price);
  const discountPrice = product.discount_price == null ? null : toNumber(product.discount_price);

  if (!discountPrice || discountPrice >= price || price <= 0) {
    return null;
  }

  return Math.round(((price - discountPrice) / price) * 100);
}

export async function fetchProducts(params: ProductFilterParams = {}): Promise<ProductListResponse> {
  const query = new URLSearchParams();

  if (params.vendorId) query.set('vendor_id', params.vendorId);
  if (params.status) query.set('status', params.status);
  if (params.category) query.set('category_id', params.category);
  if (params.search) query.set('search', params.search);
  if (params.per_page) query.set('per_page', String(params.per_page));
  if (params.minPrice != null) query.set('min_price', String(params.minPrice));
  if (params.maxPrice != null) query.set('max_price', String(params.maxPrice));
  if (params.sortBy) query.set('sort_by', params.sortBy);
  if (params.sortDir) query.set('sort_dir', params.sortDir);
  if (params.page) query.set('page', String(params.page));

  const queryString = query.toString();
  const response = await apiClient.get<any>(`/products${queryString ? `?${queryString}` : ''}`);
  const productsPayload = response?.products;
  const nestedMeta = productsPayload && typeof productsPayload === 'object' ? productsPayload.meta : undefined;
  const meta = response?.meta || nestedMeta || {};

  return {
    products: extractResourceArray<any>(productsPayload).map(normalizeProduct),
    meta: {
      current_page: toNumber(meta.current_page, 1),
      last_page: toNumber(meta.last_page, 1),
      per_page: toNumber(meta.per_page, params.per_page ?? 15),
      total: toNumber(meta.total, 0),
    },
  };
}

export async function fetchProduct(productIdentifier: string | number): Promise<ProductDetailResponse> {
  const response = await apiClient.get<any>(`/products/${productIdentifier}`);

  return {
    product: normalizeProduct(response?.product),
    recent_reviews: extractResourceArray<any>(response?.recent_reviews).map(normalizeReview),
  };
}

export async function fetchCategories(): Promise<CatalogCategory[]> {
  const response = await apiClient.get<{ data?: any[] }>('/categories');
  return extractResourceArray<any>(response?.data).map(normalizeCategory);
}

export function createVendorProduct(formData: FormData) {
  return apiClient.post<{ message: string; product: any }>('/vendor/products', formData);
}

export interface WishlistToggleResponse {
  message: string;
  wishlisted: boolean;
}

export async function toggleWishlist(productId: number): Promise<WishlistToggleResponse> {
  return apiClient.post<WishlistToggleResponse>('/wishlists/toggle', JSON.stringify({ product_id: productId }));
}
