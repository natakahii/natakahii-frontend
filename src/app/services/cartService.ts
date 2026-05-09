import { apiClient } from './apiClient';

export interface CartItem {
  id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
    price: number;
    stock: number; // Main product stock
    images?: Array<{ image_path: string }>;
  };
  variant?: {
    id: number;
    stock: number; // Variant-specific stock
  };
}

export interface Cart {
  items: CartItem[];
  total_items: number;
  total_amount: number;
}

/**
 * Get available stock for a cart item
 * Uses variant stock if available, otherwise uses product stock
 */
export function getAvailableStock(item: CartItem): number {
  if (item.variant?.stock !== undefined) {
    return item.variant.stock;
  }
  return item.product?.stock || 0;
}

/**
 * Check if quantity is available for a cart item
 */
export function isQuantityAvailable(item: CartItem, quantity: number): boolean {
  return quantity > 0 && quantity <= getAvailableStock(item);
}

/**
 * Get maximum quantity allowed for a cart item
 */
export function getMaxQuantity(item: CartItem): number {
  return getAvailableStock(item);
}

/**
 * Add an item to the cart
 */
export async function addToCart(
  productId: number,
  quantity: number = 1,
  variantId?: number
): Promise<{ message: string; cart: Cart }> {
  const body = JSON.stringify({
    product_id: productId,
    quantity,
    variant_id: variantId,
  });

  return apiClient.post<{ message: string; cart: Cart }>('/cart/items', body);
}

/**
 * Get the current cart
 */
export async function getCart(): Promise<Cart> {
  return apiClient.get<Cart>('/cart');
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  itemId: number,
  quantity: number
): Promise<{ message: string; cart: Cart }> {
  const body = JSON.stringify({ quantity });
  return apiClient.patch<{ message: string; cart: Cart }>(`/cart/items/${itemId}`, body);
}

/**
 * Remove item from cart
 */
export async function removeFromCart(itemId: number): Promise<{ message: string; cart: Cart }> {
  return apiClient.delete<{ message: string; cart: Cart }>(`/cart/items/${itemId}`);
}

/**
 * Clear the entire cart
 */
export async function clearCart(): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>('/cart');
}
