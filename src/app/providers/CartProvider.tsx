import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { apiClient } from '../services/apiClient';

interface CartItem {
  id: number;
  product_id: number;
  variant_id?: number | null;
  quantity: number;
  product?: {
    id: number;
    name: string;
    price: number;
    effective_price?: number;
    images?: { image_path?: string }[];
  };
  variant?: {
    id: number;
    price?: number;
  };
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (productId: number, quantity: number, variantId?: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'natakahii_cart';

function getStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial cart from localStorage, then sync with backend if authenticated
  useEffect(() => {
    const stored = getStoredCart();
    setItems(stored);
    setIsLoading(false);
    syncWithBackend();
  }, []);

  // Persist to localStorage on changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const syncWithBackend = async () => {
    const token = localStorage.getItem('natakahii_auth_token');
    if (!token) return;
    try {
      const data = await apiClient.get<{ data?: CartItem[]; items?: CartItem[] }>('/cart');
      const backendItems = data?.data || data?.items || [];
      if (backendItems.length > 0) {
        setItems(backendItems);
      }
    } catch (err) {
      // Backend cart endpoint may not exist; localStorage fallback is fine
      console.warn('Failed to sync cart with backend', err);
    }
  };

  const addToCart = useCallback(async (productId: number, quantity: number, variantId?: number) => {
    try {
      const data = await apiClient.post<CartItem>('/cart', JSON.stringify({
        product_id: productId,
        quantity,
        variant_id: variantId,
      }));
      setItems((prev) => {
        const existing = prev.find((i) => i.id === data.id || (i.product_id === productId && i.variant_id === variantId));
        if (existing) {
          return prev.map((i) => (i.id === existing.id ? { ...i, ...data } : i));
        }
        return [...prev, data];
      });
      await syncWithBackend();
    } catch (err: any) {
      setError(err.message || 'Failed to add to cart');
      throw err;
    }
  }, []);

  const removeItem = useCallback(async (itemId: number) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await apiClient.delete<void>(`/cart/${itemId}`);
    } catch {
      // ignore backend errors; localStorage is source of truth
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity: Math.max(1, quantity) } : i)));
    try {
      await apiClient.patch<void>(`/cart/${itemId}`, JSON.stringify({ quantity }));
    } catch {
      // ignore
    }
  }, []);

  const clearCart = useCallback(async () => {
    setItems([]);
    try {
      await apiClient.delete<void>('/cart');
    } catch {
      // ignore
    }
  }, []);

  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    await syncWithBackend();
    setIsLoading(false);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => {
    const price = item.variant?.price ?? item.product?.effective_price ?? item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        isLoading,
        error,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
