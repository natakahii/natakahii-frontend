import { apiClient } from './apiClient';
import { toNumber } from '../utils/apiValidation';

export interface VendorDashboardAnalyticsSummary {
  total_products: number;
  active_products: number;
  draft_products: number;
  total_orders: number;
  total_revenue: number;
  pending_dropoffs: number;
  low_stock_count: number;
}

export interface VendorDailyMetric {
  date: string;
  label: string;
  orders: number;
  revenue: number;
}

/** Shared chart input for vendor dashboard/analytics time-series charts */
export type VendorChartSeriesPoint = VendorDailyMetric;

export interface VendorRecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  status: string;
  item_count: number;
  vendor_total: number;
  products: string[];
  created_at?: string;
}

export interface VendorLowStockProduct {
  id: number;
  name: string;
  stock: number;
  status: string;
  image?: string | null;
}

export interface VendorTopProduct {
  id: number;
  name: string;
  units_sold: number;
  revenue: number;
  image?: string | null;
}

export interface VendorDropoffStatusBreakdown {
  status: string;
  count: number;
}

export interface VendorOverviewResponse {
  analytics: VendorDashboardAnalyticsSummary;
  daily_metrics: VendorDailyMetric[];
  recent_orders: VendorRecentOrder[];
  low_stock_products: VendorLowStockProduct[];
  top_products: VendorTopProduct[];
  dropoff_status_breakdown: VendorDropoffStatusBreakdown[];
}

function parseAnalytics(raw: Record<string, unknown>): VendorDashboardAnalyticsSummary {
  return {
    total_products: toNumber(raw.total_products),
    active_products: toNumber(raw.active_products),
    draft_products: toNumber(raw.draft_products),
    total_orders: toNumber(raw.total_orders),
    total_revenue: toNumber(raw.total_revenue),
    pending_dropoffs: toNumber(raw.pending_dropoffs),
    low_stock_count: toNumber(raw.low_stock_count),
  };
}

function parseDailyMetric(raw: Record<string, unknown>): VendorDailyMetric {
  return {
    date: String(raw.date ?? ''),
    label: String(raw.label ?? raw.date ?? ''),
    orders: toNumber(raw.orders),
    revenue: toNumber(raw.revenue),
  };
}

function parseRecentOrder(raw: Record<string, unknown>): VendorRecentOrder {
  return {
    id: toNumber(raw.id),
    order_number: String(raw.order_number ?? ''),
    customer_name: String(raw.customer_name ?? 'Customer'),
    status: String(raw.status ?? 'pending'),
    item_count: toNumber(raw.item_count),
    vendor_total: toNumber(raw.vendor_total),
    products: Array.isArray(raw.products) ? raw.products.map(String) : [],
    created_at: raw.created_at ? String(raw.created_at) : undefined,
  };
}

function parseLowStockProduct(raw: Record<string, unknown>): VendorLowStockProduct {
  return {
    id: toNumber(raw.id),
    name: String(raw.name ?? 'Product'),
    stock: toNumber(raw.stock),
    status: String(raw.status ?? 'active'),
    image: raw.image ? String(raw.image) : null,
  };
}

function parseTopProduct(raw: Record<string, unknown>): VendorTopProduct {
  return {
    id: toNumber(raw.id),
    name: String(raw.name ?? 'Product'),
    units_sold: toNumber(raw.units_sold),
    revenue: toNumber(raw.revenue),
    image: raw.image ? String(raw.image) : null,
  };
}

function parseDropoffBreakdown(raw: Record<string, unknown>): VendorDropoffStatusBreakdown {
  return {
    status: String(raw.status ?? 'unknown'),
    count: toNumber(raw.count),
  };
}

export function parseVendorOverview(raw: unknown): VendorOverviewResponse {
  const data = (raw ?? {}) as Record<string, unknown>;
  const analyticsRaw = (data.analytics ?? data) as Record<string, unknown>;

  return {
    analytics: parseAnalytics(analyticsRaw),
    daily_metrics: Array.isArray(data.daily_metrics)
      ? data.daily_metrics.map((item) => parseDailyMetric(item as Record<string, unknown>))
      : [],
    recent_orders: Array.isArray(data.recent_orders)
      ? data.recent_orders.map((item) => parseRecentOrder(item as Record<string, unknown>))
      : [],
    low_stock_products: Array.isArray(data.low_stock_products)
      ? data.low_stock_products.map((item) => parseLowStockProduct(item as Record<string, unknown>))
      : [],
    top_products: Array.isArray(data.top_products)
      ? data.top_products.map((item) => parseTopProduct(item as Record<string, unknown>))
      : [],
    dropoff_status_breakdown: Array.isArray(data.dropoff_status_breakdown)
      ? data.dropoff_status_breakdown.map((item) => parseDropoffBreakdown(item as Record<string, unknown>))
      : [],
  };
}

export async function fetchVendorOverview(): Promise<VendorOverviewResponse> {
  const response = await apiClient.get<unknown>('/analytics/vendor/overview');
  return parseVendorOverview(response);
}
