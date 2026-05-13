/**
 * Payment Service - Handles payment-related API calls
 * - Payment history
 * - Payment status polling
 * - Refund requests
 * - Payment verification
 */

export interface PaymentTransaction {
  id: number;
  order_id: number;
  transaction_type: string;
  amount: number;
  currency: string;
  provider: string;
  payment_method: string;
  customer_phone: string;
  status: 'initiated' | 'pending' | 'successful' | 'failed' | 'expired';
  provider_reference?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentStatusResponse {
  status: 'initiated' | 'pending' | 'successful' | 'failed' | 'expired';
  payment_reference?: string;
  error_message?: string;
  timestamp: string;
}

export interface RefundBreakdown {
  items_refund: number;
  transport_refund: number;
  commission_reversal: number;
  total_refund: number;
}

export interface RefundTransaction {
  id: number;
  order_id: number;
  reason: string;
  refund_type: string;
  amount: number;
  status: 'initiated' | 'pending' | 'successful' | 'failed';
  breakdown: {
    items_refund: number;
    transport_refund: number;
    commission_reversal: number;
  };
  created_at: string;
  updated_at: string;
}

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

/**
 * Poll for payment status with exponential backoff
 * Useful after initiating payment via Snippe to check completion
 */
export const pollPaymentStatus = async (
  orderId: number,
  maxAttempts: number = 60, // ~5 minutes with 5s intervals
  initialDelay: number = 2000 // Start with 2 second delay
): Promise<PaymentStatusResponse> => {
  let attempts = 0;
  let delay = initialDelay;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`/api/v1/orders/${orderId}/payment-status`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment status');
      }

      const data: PaymentStatusResponse = await response.json();

      // If status is no longer pending, return it
      if (data.status !== 'pending' && data.status !== 'initiated') {
        return data;
      }

      // Still pending - wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff: increase delay, cap at 5 seconds
      delay = Math.min(delay * 1.5, 5000);
      attempts++;
    } catch (error) {
      console.error('Error polling payment status:', error);
      // Retry on error as well
      await new Promise(resolve => setTimeout(resolve, delay));
      attempts++;
    }
  }

  throw new Error('Payment status check timeout - please refresh the page');
};

export const paymentService = {
  /**
   * Get payment history for the current user
   */
  async getPaymentHistory(filters?: {
    status?: string;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: PaymentTransaction[]; total: number; meta: any }> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.payment_method) params.append('payment_method', filters.payment_method);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const url = `/api/v1/payments${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }

    return response.json();
  },

  /**
   * Get payment details for a specific transaction
   */
  async getPaymentDetails(paymentId: number): Promise<PaymentTransaction> {
    const response = await fetch(`/api/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment details');
    }

    return response.json();
  },

  /**
   * Check payment status for an order
   * Used after payment initiation to verify completion
   */
  async checkPaymentStatus(orderId: number): Promise<PaymentStatusResponse> {
    const response = await fetch(`/api/v1/orders/${orderId}/payment-status`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to check payment status');
    }

    return response.json();
  },

  /**
   * Download payment receipt/invoice
   */
  async downloadReceipt(paymentId: number, format: 'pdf' | 'csv' = 'pdf'): Promise<Blob> {
    const response = await fetch(`/api/v1/payments/${paymentId}/receipt?format=${format}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });

    if (!response.ok) {
      throw new Error('Failed to download receipt');
    }

    return response.blob();
  },

  /**
   * Calculate refund for an order
   */
  async calculateRefund(orderId: number): Promise<RefundBreakdown> {
    const response = await fetch(`/api/v1/orders/${orderId}/refunds/calculate`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to calculate refund');
    }

    return response.json();
  },

  /**
   * Request refund for an order
   */
  async requestRefund(orderId: number, data: {
    reason: string;
    refund_type: 'full' | 'partial';
    notes?: string;
  }): Promise<RefundTransaction> {
    const response = await fetch(`/api/v1/orders/${orderId}/refunds`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to request refund');
    }

    return response.json();
  },

  /**
   * Get refund history for the current user
   */
  async getRefundHistory(filters?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: RefundTransaction[]; total: number }> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const url = `/api/v1/refunds${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch refund history');
    }

    return response.json();
  },

  /**
   * Get refund details
   */
  async getRefundDetails(refundId: number): Promise<RefundTransaction> {
    const response = await fetch(`/api/v1/refunds/${refundId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch refund details');
    }

    return response.json();
  },
};
