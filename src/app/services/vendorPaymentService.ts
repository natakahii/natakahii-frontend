/**
 * Vendor Payment Service - Handles vendor-specific payment operations
 * - Wallet balance and details
 * - Wallet transactions
 * - Payout requests and history
 */

export interface VendorWalletData {
  id: number;
  vendor_id: number;
  available_balance: number;
  pending_balance: number;
  held_balance: number;
  lifetime_earnings: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: number;
  wallet_id: number;
  transaction_type: string; // 'credit', 'debit', 'commission', 'payout', 'refund'
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  transactable_type?: string; // Polymorphic type
  transactable_id?: number;
  created_at: string;
}

export interface VendorPayout {
  id: number;
  vendor_id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed' | 'reversed';
  payment_method: string;
  phone_number?: string;
  account_number?: string;
  bank_name?: string;
  account_holder_name?: string;
  attempt_count: number;
  max_attempts: number;
  error_message?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PayoutItem {
  id: number;
  payout_id: number;
  order_id: number;
  amount: number;
}

export interface PayoutResponse {
  payout: VendorPayout;
  items: PayoutItem[];
}

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export const vendorPaymentService = {
  /**
   * Get vendor wallet details including all balance tiers
   */
  async getWallet(): Promise<VendorWalletData> {
    const response = await fetch('/api/v1/vendor/wallet', {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wallet');
    }

    return response.json();
  },

  /**
   * Get wallet transaction history with filtering
   */
  async getWalletTransactions(filters?: {
    transaction_type?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: WalletTransaction[]; total: number; pagination: any }> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.transaction_type) params.append('transaction_type', filters.transaction_type);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const url = `/api/v1/vendor/wallet/transactions${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wallet transactions');
    }

    return response.json();
  },

  /**
   * Get wallet balance summary
   */
  async getWalletSummary(): Promise<{
    available_balance: number;
    pending_balance: number;
    held_balance: number;
    total_balance: number;
    lifetime_earnings: number;
  }> {
    const wallet = await this.getWallet();
    return {
      available_balance: wallet.available_balance,
      pending_balance: wallet.pending_balance,
      held_balance: wallet.held_balance,
      total_balance: wallet.available_balance + wallet.pending_balance + wallet.held_balance,
      lifetime_earnings: wallet.lifetime_earnings,
    };
  },

  /**
   * Request a payout from available balance
   * Minimum payout: 10,000 TZS
   */
  async requestPayout(data: {
    amount: number;
    payment_method: 'mpesa' | 'airtel_money' | 'bank_transfer';
    phone_number?: string;
    account_number?: string;
    bank_name?: string;
    account_holder_name?: string;
  }): Promise<VendorPayout> {
    if (data.amount < 10000) {
      throw new Error('Minimum payout amount is 10,000 TZS');
    }

    const response = await fetch('/api/v1/vendor/wallet/payout', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to request payout');
    }

    return response.json();
  },

  /**
   * Get payout history
   */
  async getPayouts(filters?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: VendorPayout[]; total: number; pagination: any }> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const url = `/api/v1/vendor/payouts${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payouts');
    }

    return response.json();
  },

  /**
   * Get detailed information about a specific payout
   */
  async getPayoutDetails(payoutId: number): Promise<PayoutResponse> {
    const response = await fetch(`/api/v1/vendor/payouts/${payoutId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payout details');
    }

    return response.json();
  },

  /**
   * Get payout status for tracking
   */
  async getPayoutStatus(payoutId: number): Promise<{
    id: number;
    status: string;
    amount: number;
    attempt_count: number;
    max_attempts: number;
    error_message?: string;
    processed_at?: string;
    updated_at: string;
  }> {
    const response = await fetch(`/api/v1/vendor/payouts/${payoutId}/status`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payout status');
    }

    return response.json();
  },

  /**
   * Get payment methods available for payout
   */
  async getPaymentMethods(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    min_amount: number;
    max_amount: number;
    processing_time: string;
    fee: number;
  }>> {
    const response = await fetch('/api/v1/vendor/wallet/payment-methods', {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }

    return response.json();
  },

  /**
   * Get estimated processing time and fees for a payout
   */
  async estimatePayoutFees(amount: number, paymentMethod: string): Promise<{
    amount: number;
    fee: number;
    net_amount: number;
    processing_time: string;
    estimated_completion: string;
  }> {
    const response = await fetch('/api/v1/vendor/wallet/payout-estimate', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, payment_method: paymentMethod }),
    });

    if (!response.ok) {
      throw new Error('Failed to estimate payout');
    }

    return response.json();
  },
};
