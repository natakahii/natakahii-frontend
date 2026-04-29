import { apiClient } from './apiClient';

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

export function fetchVendorOverview() {
  return apiClient.get<VendorOverviewResponse>('/analytics/vendor/overview');
}
