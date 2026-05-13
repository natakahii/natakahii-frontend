import { apiClient } from './apiClient';

interface CartItem {
  product_id: number;
  quantity: number;
}

interface CheckoutBreakdown {
  items_by_vendor: Record<number, any>;
  subtotal: number;
  platform_commission: number;
  tax: number;
  transport_estimate: number;
  total: number;
}

export const orderService = {
  async calculateCheckout(items: CartItem[]): Promise<CheckoutBreakdown> {
    return apiClient.post<CheckoutBreakdown>('/orders/calculate', JSON.stringify({ items }));
  },

  async createOrder(data: {
    items: CartItem[];
    delivery_address: any;
    phone_number: string;
    payment_method: string;
  }) {
    return apiClient.post<any>('/orders', JSON.stringify(data));
  },

  async retryPayment(orderId: number, data: {
    phone_number: string;
    payment_method: string;
  }) {
    return apiClient.post<any>(`/orders/${orderId}/confirm-payment`, JSON.stringify(data));
  },

  async getRefundEligibleOrders(): Promise<Array<{
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    payment_status: string;
    items: Array<{
      id: number;
      product_id: number;
      quantity: number;
      unit_price: number;
      subtotal: number;
      product?: { id: number; name: string; image_url?: string };
    }>;
    created_at: string;
  }>> {
    const data = await apiClient.get<any>('/orders/refund-eligible');
    return data.data || data;
  },
};
