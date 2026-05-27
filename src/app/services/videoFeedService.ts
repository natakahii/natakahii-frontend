import { apiClient } from './apiClient';
import { CatalogVendor, CatalogProduct, normalizeProduct, normalizeVendor, toNumber, extractResourceArray } from './productService';

export interface VideoItem {
  id: number;
  product_id: number;
  vendor_id: number;
  type: 'video';
  file_path: string;
  mime_type: string;
  file_size?: number;
  title?: string | null;
  description?: string | null;
  sort_order?: number;
  is_featured?: boolean;
  product?: CatalogProduct;
  vendor?: CatalogVendor;
  // Aggregated engagement data
  likes_count: number;
  shares_count: number;
  comments_count: number;
  is_liked_by_user?: boolean;
  is_following_vendor?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VideoFeedResponse {
  videos: VideoItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface LikeResponse {
  message: string;
  likes_count: number;
}

export interface ShareResponse {
  message: string;
  shares_count: number;
}

export interface FollowResponse {
  message: string;
  followers_count: number;
}

function normalizeVideo(video: any): VideoItem {
  const product = video?.product ? normalizeProduct(video.product) : undefined;
  const vendor = video?.vendor ? normalizeVendor(video.vendor) : product?.vendor;

  return {
    id: toNumber(video?.id),
    product_id: toNumber(video?.product_id),
    vendor_id: toNumber(video?.vendor_id),
    type: video?.type || 'video',
    file_path: video?.file_path || '',
    mime_type: video?.mime_type || 'video/mp4',
    file_size: video?.file_size == null ? undefined : toNumber(video.file_size),
    title: video?.title || null,
    description: video?.description || null,
    sort_order: video?.sort_order == null ? undefined : toNumber(video.sort_order),
    is_featured: Boolean(video?.is_featured),
    product,
    vendor,
    likes_count: toNumber(video?.likes_count),
    shares_count: toNumber(video?.shares_count),
    comments_count: toNumber(video?.comments_count),
    is_liked_by_user: video?.is_liked_by_user ?? undefined,
    is_following_vendor: video?.is_following_vendor ?? undefined,
    created_at: video?.created_at || undefined,
    updated_at: video?.updated_at || undefined,
  };
}

/**
 * Fetch video feed for commerce
 * Supports both 'for-you' and 'following' feeds
 */
export async function fetchVideoFeed(
  feedType: 'for-you' | 'following' = 'for-you',
  page: number = 1,
  perPage: number = 10
): Promise<VideoFeedResponse> {
  const query = new URLSearchParams();
  query.set('feed_type', feedType);
  query.set('page', String(page));
  query.set('per_page', String(perPage));

  const response = await apiClient.get<any>(`/videos/feed?${query.toString()}`);
  const videosPayload = response?.videos;
  const meta = response?.meta || {};

  return {
    videos: extractResourceArray<any>(videosPayload).map(normalizeVideo),
    meta: {
      current_page: toNumber(meta.current_page, 1),
      last_page: toNumber(meta.last_page, 1),
      per_page: toNumber(meta.per_page, perPage),
      total: toNumber(meta.total, 0),
    },
  };
}

/**
 * Like a product
 */
export async function likeProduct(productId: number): Promise<LikeResponse> {
  return apiClient.post<LikeResponse>(`/products/${productId}/likes`, undefined);
}

/**
 * Unlike a product
 */
export async function unlikeProduct(productId: number): Promise<LikeResponse> {
  return apiClient.delete<LikeResponse>(`/products/${productId}/likes`);
}

/**
 * Share a product - records the share and returns updated count
 */
export async function shareProduct(
  productId: number,
  platform?: string
): Promise<ShareResponse> {
  const body = platform ? JSON.stringify({ platform }) : undefined;
  return apiClient.post<ShareResponse>(`/products/${productId}/shares`, body);
}

/**
 * Follow a vendor
 */
export async function followVendor(vendorId: number): Promise<FollowResponse> {
  return apiClient.post<FollowResponse>(`/vendors/${vendorId}/follow`, undefined);
}

/**
 * Unfollow a vendor
 */
export async function unfollowVendor(vendorId: number): Promise<FollowResponse> {
  return apiClient.delete<FollowResponse>(`/vendors/${vendorId}/follow`);
}

/**
 * Check if user is following specific vendors (batch check)
 */
export async function checkFollowingStatus(vendorIds: number[]): Promise<Record<number, boolean>> {
  if (vendorIds.length === 0) {
    return {};
  }

  try {
    const response = await apiClient.get<{ vendors: Array<{ id: number }> | { data?: Array<{ id: number }> } }>('/me/following/vendors?per_page=1000');
    const followingIds = new Set(extractResourceArray<{ id: number }>(response?.vendors).map((v) => toNumber(v.id)));

    return vendorIds.reduce((acc, id) => {
      acc[id] = followingIds.has(id);
      return acc;
    }, {} as Record<number, boolean>);
  } catch {
    return {};
  }
}

/**
 * Format large numbers (e.g., 1200 -> 1.2K)
 */
export function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return String(count);
}
