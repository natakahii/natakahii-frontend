/**
 * Payment Service - Handles payment-related API calls
 * - Payment history
 * - Payment status polling
 * - Refund requests
 * - Payment verification
 */

import { apiClient, getAuthToken } from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? '/api/v1';

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
      const data = await apiClient.get<PaymentStatusResponse>(`/orders/${orderId}/payment-status`);

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
    const path = `/payments${queryString ? '?' + queryString : ''}`;

    return apiClient.get<{ data: PaymentTransaction[]; total: number; meta: any }>(path);
  },

  /**
   * Get payment details for a specific transaction
   */
  async getPaymentDetails(paymentId: number): Promise<PaymentTransaction> {
    return apiClient.get<PaymentTransaction>(`/payments/${paymentId}`);
  },

  /**
   * Check payment status for an order
   * Used after payment initiation to verify completion
   */
  async checkPaymentStatus(orderId: number): Promise<PaymentStatusResponse> {
    return apiClient.get<PaymentStatusResponse>(`/orders/${orderId}/payment-status`);
  },

  /**
   * Download payment receipt/invoice
   */
  async downloadReceipt(paymentId: number, format: 'pdf' | 'csv' = 'pdf'): Promise<Blob> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/receipt?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/octet-stream',
      },
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
    return apiClient.post<RefundBreakdown>(`/orders/${orderId}/refunds/calculate`, undefined);
  },

  /**
   * Request refund for an order
   */
  async requestRefund(orderId: number, data: {
    reason: string;
    refund_type: 'full' | 'partial';
    notes?: string;
  }): Promise<RefundTransaction> {
    return apiClient.post<RefundTransaction>(`/orders/${orderId}/refunds`, JSON.stringify(data));
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
    const path = `/refunds${queryString ? '?' + queryString : ''}`;

    return apiClient.get<{ data: RefundTransaction[]; total: number }>(path);
  },

  /**
   * Get refund details
   */
  async getRefundDetails(refundId: number): Promise<RefundTransaction> {
    return apiClient.get<RefundTransaction>(`/refunds/${refundId}`);
  },

  // ── Payment Sessions (Snippe Hosted Checkout) ──

  async createSession(orderId: number, options?: {
    allowed_methods?: string[];
    allow_custom_amount?: boolean;
    min_amount?: number;
    max_amount?: number;
    expires_in?: number;
    description?: string;
    redirect_url?: string;
    display?: Record<string, any>;
    metadata?: Record<string, any>;
    profile_id?: string;
  }): Promise<{ success: boolean; session: { id: number; reference: string; checkout_url: string; payment_link_url?: string; short_code?: string; amount: number; currency: string; status: string; expires_at: string } }> {
    return apiClient.post('/payment-sessions', JSON.stringify({ order_id: orderId, ...options }));
  },

  async getSession(reference: string): Promise<{ success: boolean; session: any }> {
    return apiClient.get(`/payment-sessions/${reference}`);
  },

  async cancelSession(reference: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.post(`/payment-sessions/${reference}/cancel`, undefined);
  },

  async syncSession(reference: string): Promise<{ success: boolean; session: any }> {
    return apiClient.post(`/payment-sessions/${reference}/sync`, undefined);
  },

};
