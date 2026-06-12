import { apiClient } from './apiClient';

export interface CargoQuote {
  estimate: number;
  currency: string;
  estimated_days: string;
  service_level: 'standard' | 'express' | 'same_day';
}

export interface CargoOrderPayload {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  pickup_hub_code: string;
  delivery_hub_code: string;
  service_level: 'standard' | 'express' | 'same_day';
  weight_kg: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: {
    street: string;
    city: string;
    district: string;
    region: string;
  };
  special_instructions?: string;
}

export interface CargoOrderResponse {
  message: string;
  tracking_number: string;
  cargo_shipment_id: number;
  estimated_delivery: string;
}

export const cargoService = {
  async getQuote(payload: {
    pickup_hub_id: number;
    delivery_hub_id: number;
    weight: number;
    service_level: 'standard' | 'express' | 'same_day';
  }): Promise<CargoQuote> {
    const response = await apiClient.post<CargoQuote>(`/cargo/shipments/quote`, payload);
    return response;
  },

  async createOrder(payload: CargoOrderPayload): Promise<CargoOrderResponse> {
    const response = await apiClient.post<CargoOrderResponse>(`/cargo/orders/from-natakahii`, payload);
    return response;
  },

  async trackOrder(trackingNumber: string): Promise<any> {
    const response = await apiClient.get<any>(`/cargo/shipments/track/${trackingNumber}`);
    return response;
  },
};
