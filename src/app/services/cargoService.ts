const CARGO_API_URL = import.meta.env.VITE_CARGO_API_URL ?? 'http://localhost:8001/api';

async function cargoRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${CARGO_API_URL}${path}`;
  const headers = new Headers(options.headers as HeadersInit);
  headers.set('Accept', 'application/json');

  const token = localStorage.getItem('natakahii_auth_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || 'Cargo request failed';
    const error = new Error(message) as Error & { status?: number; data?: any };
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export interface CargoHub {
  id: number;
  name: string;
  code: string;
}

export interface CargoQuoteRequest {
  origin_hub_id: number;
  destination_hub_id: number;
  weight: number;
  service_level: 'standard' | 'express' | 'same_day';
}

export interface CargoQuoteResponse {
  estimate: number;
  currency: string;
  estimated_days: string;
}

export interface CargoOrderRequest {
  items: Array<{ product_id: number; quantity: number }>;
  pickup_hub_code: string;
  delivery_hub_code: string;
  service_level: 'standard' | 'express' | 'same_day';
  weight_kg: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  delivery_address: {
    street: string;
    city: string;
    district: string;
    region: string;
  };
  special_instructions?: string | null;
}

export interface CargoOrderResponse {
  message: string;
  tracking_number: string;
  cargo_shipment_id: number;
  estimated_delivery: string;
}

export const cargoService = {
  async getHubs(): Promise<CargoHub[]> {
    return cargoRequest<CargoHub[]>('/hubs', { method: 'GET' });
  },

  async getQuote(payload: CargoQuoteRequest): Promise<CargoQuoteResponse> {
    return cargoRequest<CargoQuoteResponse>('/shipments/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async createOrder(payload: CargoOrderRequest): Promise<CargoOrderResponse> {
    return cargoRequest<CargoOrderResponse>('/orders/from-natakahii', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
