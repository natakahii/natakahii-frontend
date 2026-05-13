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

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export const orderService = {
  async calculateCheckout(items: CartItem[]): Promise<CheckoutBreakdown> {
    const response = await fetch('/api/v1/orders/calculate', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ items }),
    });

    if (!response.ok) throw new Error('Failed to calculate checkout');
    return response.json();
  },

  async createOrder(data: {
    items: CartItem[];
    delivery_address: any;
    phone_number: string;
    payment_method: string;
    pin?: string;
  }) {
    const response = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Order creation failed');
    }

    return result;
  },

  async confirmPayment(orderId: number, data: {
    pin: string;
    phone_number: string;
    payment_method: string;
  }) {
    const response = await fetch(`/api/v1/orders/${orderId}/confirm-payment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Payment confirmation failed');
    }

    return result;
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
    const response = await fetch('/api/v1/orders/refund-eligible', {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch eligible orders');
    const data = await response.json();
    return data.data || data;
  },
};
