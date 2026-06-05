/**
 * Vendor Payment Service - Handles vendor-specific payment operations
 */

import { apiClient } from './apiClient';
import { normalizePagination, toNumber } from '../utils/apiValidation';

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

export interface WalletSummary {
  total_credits: number;
  total_debits: number;
  net_change: number;
  transaction_count: number;
}

export interface VendorWalletResponse {
  wallet: VendorWalletData;
  recent_transactions: WalletTransaction[];
  summary: WalletSummary;
}

export interface WalletTransaction {
  id: number;
  wallet_id: number;
  transaction_type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  transactable_type?: string;
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

function parseWallet(raw: Record<string, unknown>): VendorWalletData {
  return {
    id: toNumber(raw.id),
    vendor_id: toNumber(raw.vendor_id),
    available_balance: toNumber(raw.available_balance),
    pending_balance: toNumber(raw.pending_balance),
    held_balance: toNumber(raw.held_balance),
    lifetime_earnings: toNumber(raw.lifetime_earnings),
    currency: String(raw.currency ?? 'TZS'),
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
  };
}

function resolveTransactionType(raw: Record<string, unknown>): string {
  const category = String(raw.category ?? '').toLowerCase();
  if (category === 'withdrawal') return 'payout';
  if (category === 'refund_deduction') return 'refund';
  if (category === 'order_payout') return 'credit';
  return String(raw.type ?? raw.transaction_type ?? 'debit');
}

export function parseWalletTransaction(raw: Record<string, unknown>): WalletTransaction {
  const balanceAfter = toNumber(raw.balance_after);
  const amount = toNumber(raw.amount);

  return {
    id: toNumber(raw.id),
    wallet_id: toNumber(raw.wallet_id ?? raw.vendor_id),
    transaction_type: resolveTransactionType(raw),
    amount,
    balance_before: toNumber(raw.balance_before, balanceAfter + (raw.type === 'debit' ? amount : -amount)),
    balance_after: balanceAfter,
    description: String(raw.description ?? raw.reference ?? 'Transaction'),
    transactable_type: raw.transactable_type ? String(raw.transactable_type) : undefined,
    transactable_id: raw.transactable_id ? toNumber(raw.transactable_id) : undefined,
    created_at: String(raw.created_at ?? ''),
  };
}

export function parseVendorPayout(raw: Record<string, unknown>): VendorPayout {
  return {
    id: toNumber(raw.id),
    vendor_id: toNumber(raw.vendor_id),
    amount: toNumber(raw.amount),
    currency: String(raw.currency ?? 'TZS'),
    status: String(raw.status ?? 'pending') as VendorPayout['status'],
    payment_method: String(raw.payout_method ?? raw.payment_method ?? 'mobile_money'),
    phone_number: raw.recipient_phone ? String(raw.recipient_phone) : raw.phone_number ? String(raw.phone_number) : undefined,
    account_number: raw.recipient_bank_account
      ? String(raw.recipient_bank_account)
      : raw.account_number
        ? String(raw.account_number)
        : undefined,
    bank_name: raw.recipient_bank ? String(raw.recipient_bank) : raw.bank_name ? String(raw.bank_name) : undefined,
    account_holder_name: raw.recipient_account_name
      ? String(raw.recipient_account_name)
      : raw.account_holder_name
        ? String(raw.account_holder_name)
        : undefined,
    attempt_count: toNumber(raw.retry_count ?? raw.attempt_count),
    max_attempts: toNumber(raw.max_attempts, 3),
    error_message: raw.failure_reason ? String(raw.failure_reason) : raw.error_message ? String(raw.error_message) : undefined,
    processed_at: raw.processed_at ? String(raw.processed_at) : undefined,
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
  };
}

function parsePayoutItem(raw: Record<string, unknown>): PayoutItem {
  const pivot = raw.pivot as Record<string, unknown> | undefined;
  return {
    id: toNumber(raw.id),
    payout_id: toNumber(raw.payout_id),
    order_id: toNumber(raw.order_id ?? raw.order_item_id),
    amount: toNumber(raw.amount ?? pivot?.amount),
  };
}

function mapTransactionFilter(transactionType?: string): Record<string, string> {
  if (!transactionType || transactionType === 'all') return {};
  if (transactionType === 'credit' || transactionType === 'debit') {
    return { type: transactionType };
  }
  if (transactionType === 'payout') return { category: 'withdrawal' };
  if (transactionType === 'refund') return { category: 'refund_deduction' };
  return { type: transactionType };
}

export const MIN_PAYOUT_AMOUNT = 10000;

export const vendorPaymentService = {
  async getWalletDetails(): Promise<VendorWalletResponse> {
    const response = await apiClient.get<Record<string, unknown>>('/vendor/wallet');

    if (response.wallet) {
      const summaryRaw = (response.summary ?? {}) as Record<string, unknown>;
      return {
        wallet: parseWallet(response.wallet as Record<string, unknown>),
        recent_transactions: Array.isArray(response.recent_transactions)
          ? response.recent_transactions.map((item) =>
              parseWalletTransaction(item as Record<string, unknown>),
            )
          : [],
        summary: {
          total_credits: toNumber(summaryRaw.total_credits),
          total_debits: toNumber(summaryRaw.total_debits),
          net_change: toNumber(summaryRaw.net_change),
          transaction_count: toNumber(summaryRaw.transaction_count),
        },
      };
    }

    return {
      wallet: parseWallet(response),
      recent_transactions: [],
      summary: {
        total_credits: 0,
        total_debits: 0,
        net_change: 0,
        transaction_count: 0,
      },
    };
  },

  async getWallet(): Promise<VendorWalletData> {
    const details = await this.getWalletDetails();
    return details.wallet;
  },

  async getWalletTransactions(filters?: {
    transaction_type?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
    page?: number;
  }): Promise<{ data: WalletTransaction[]; total: number; pagination: unknown }> {
    const params = new URLSearchParams();
    const typeFilter = mapTransactionFilter(filters?.transaction_type);

    if (typeFilter.type) params.append('type', typeFilter.type);
    if (typeFilter.category) params.append('category', typeFilter.category);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('per_page', filters.limit.toString());

    const queryString = params.toString();
    const path = `/vendor/wallet/transactions${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<unknown>(path);
    const normalized = normalizePagination(response, parseWalletTransaction);

    return {
      data: normalized.data,
      total: normalized.total,
      pagination: normalized.pagination,
    };
  },

  async getWalletSummary() {
    const details = await this.getWalletDetails();
    const { wallet } = details;
    return {
      available_balance: wallet.available_balance,
      pending_balance: wallet.pending_balance,
      held_balance: wallet.held_balance,
      total_balance: wallet.available_balance + wallet.pending_balance + wallet.held_balance,
      lifetime_earnings: wallet.lifetime_earnings,
    };
  },

  async requestPayout(data: { amount: number }): Promise<VendorPayout> {
    if (data.amount < MIN_PAYOUT_AMOUNT) {
      throw new Error(`Minimum payout amount is ${MIN_PAYOUT_AMOUNT.toLocaleString()} TZS`);
    }

    const response = await apiClient.post<{ payout?: Record<string, unknown>; message?: string }>(
      '/vendor/wallet/payout',
      JSON.stringify({ amount: data.amount }),
    );

    if (response.payout) {
      return parseVendorPayout(response.payout);
    }

    return parseVendorPayout(response as unknown as Record<string, unknown>);
  },

  async getPayouts(filters?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
    page?: number;
  }): Promise<{ data: VendorPayout[]; total: number; pagination: unknown }> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('per_page', filters.limit.toString());

    const queryString = params.toString();
    const path = `/vendor/payouts${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<unknown>(path);
    const normalized = normalizePagination(response, parseVendorPayout);

    return {
      data: normalized.data,
      total: normalized.total,
      pagination: normalized.pagination,
    };
  },

  async getPayoutDetails(payoutId: number): Promise<PayoutResponse> {
    const response = await apiClient.get<Record<string, unknown>>(`/vendor/payouts/${payoutId}`);
    const payoutItems = Array.isArray(response.payout_items ?? response.payoutItems)
      ? (response.payout_items ?? response.payoutItems) as Record<string, unknown>[]
      : [];

    return {
      payout: parseVendorPayout(response),
      items: payoutItems.map(parsePayoutItem),
    };
  },

  async getPayoutStatus(payoutId: number) {
    const response = await apiClient.get<Record<string, unknown>>(`/vendor/payouts/${payoutId}/status`);
    return {
      id: toNumber(response.id),
      status: String(response.status ?? ''),
      amount: toNumber(response.amount),
      attempt_count: toNumber(response.retry_count ?? response.attempt_count),
      max_attempts: toNumber(response.max_attempts, 3),
      error_message: response.failure_reason
        ? String(response.failure_reason)
        : response.error_message
          ? String(response.error_message)
          : undefined,
      processed_at: response.processed_at ? String(response.processed_at) : undefined,
      updated_at: String(response.updated_at ?? ''),
    };
  },

  async getPaymentMethods() {
    return apiClient.get<
      Array<{
        id: string;
        name: string;
        description: string;
        min_amount: number;
        max_amount: number;
        processing_time: string;
        fee: number;
      }>
    >('/vendor/wallet/payment-methods');
  },

  async estimatePayoutFees(amount: number, paymentMethod: string) {
    const response = await apiClient.post<Record<string, unknown>>(
      '/vendor/wallet/payout-estimate',
      JSON.stringify({ amount, payment_method: paymentMethod }),
    );

    return {
      amount: toNumber(response.amount, amount),
      fee: toNumber(response.fee),
      net_amount: toNumber(response.net_amount, amount - toNumber(response.fee)),
      processing_time: String(response.processing_time ?? '1-2 hours'),
      estimated_completion: String(response.estimated_completion ?? ''),
    };
  },
};
