import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Cart, CartItem, getCart, addToCart as addToCartApi, updateCartItem as updateCartItemApi, removeFromCart as removeFromCartApi, clearCart as clearCartApi, getMaxQuantity } from '../services/cartService';
import { useAuth } from './AuthProvider';

interface CartContextValue {
  cart: Cart | null;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number, variantId?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemMaxQuantity: (itemId: number) => number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Load guest cart from local storage
  const [guestItems, setGuestItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        const stored = localStorage.getItem('natakahii_guest_cart');
        if (stored) {
          setGuestItems(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load guest cart', e);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('natakahii_guest_cart', JSON.stringify(guestItems));
    }
  }, [guestItems, isAuthenticated]);

  // Fetch cart when user authenticates
  useEffect(() => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    const fetchCart = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // If there were guest items, we might want to sync them here
        // For now, just fetch the existing server cart
        const data = await getCart();
        setCart(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch cart';
        setError(message);
        console.error('Failed to fetch cart:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchCart();
  }, [isAuthenticated]);

  const normalizeCart = (raw: Cart | null): Cart | null => {
    if (!raw) return null;
    const items = raw.items || [];
    const total_items = raw.total_items ?? items.reduce((sum, item) => sum + item.quantity, 0);
    const total_amount = raw.total_amount ?? items.reduce((sum, item) => {
      const price = item.product?.effective_price ?? item.product?.price ?? 0;
      return sum + price * item.quantity;
    }, 0);
    return { ...raw, items, total_items, total_amount };
  };

  const refreshCart = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getCart();
      setCart(normalizeCart(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh cart';
      setError(message);
      console.error('Failed to refresh cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1, variantId?: number) => {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    if (!isAuthenticated) {
      // Handle guest add to cart
      try {
        const { fetchProduct } = await import('../services/productService');
        const { product } = await fetchProduct(productId);
        
        setGuestItems(prev => {
          const existingIndex = prev.findIndex(item => item.product_id === productId && item.variant_id === variantId);
          if (existingIndex > -1) {
            const next = [...prev];
            next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + quantity };
            return next;
          }
          
          const newItem: CartItem = {
            id: Date.now(), // temporary id for UI
            product_id: productId,
            variant_id: variantId,
            quantity,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              effective_price: product.effective_price,
              stock: product.stock,
              images: product.images.map(img => ({ image_path: img.image_path }))
            }
          };
          return [...prev, newItem];
        });
        return;
      } catch (e) {
        console.error('Failed to add to guest cart', e);
        throw new Error('Failed to add to cart');
      }
    }

    try {
      setError(null);
      const response = await addToCartApi(productId, quantity, variantId);
      setCart(normalizeCart(response.cart));
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || 'Failed to add item to cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    if (!isAuthenticated) {
      setGuestItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));
      return;
    }

    const item = cart?.items.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Item not found in cart');
    }

    const maxQuantity = getMaxQuantity(item);
    if (quantity > maxQuantity) {
      throw new Error(`Only ${maxQuantity} unit(s) available for this product`);
    }

    try {
      setError(null);
      const response = await updateCartItemApi(itemId, quantity);
      setCart(normalizeCart(response.cart));
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || 'Failed to update cart item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const removeItem = async (itemId: number) => {
    if (!isAuthenticated) {
      setGuestItems(prev => prev.filter(item => item.id !== itemId));
      return;
    }

    try {
      setError(null);
      const response = await removeFromCartApi(itemId);
      setCart(normalizeCart(response.cart));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove item from cart';
      setError(message);
      throw err;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      setGuestItems([]);
      return;
    }

    try {
      setError(null);
      await clearCartApi();
      setCart({ items: [], total_items: 0, total_amount: 0 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(message);
      throw err;
    }
  };

  const getItemMaxQuantity = (itemId: number): number => {
    const itemsList = isAuthenticated ? cart?.items : guestItems;
    const item = itemsList?.find(i => i.id === itemId);
    if (!item) return 0;
    return getMaxQuantity(item);
  };

  const items = useMemo(() => isAuthenticated ? (cart?.items || []) : guestItems, [isAuthenticated, cart, guestItems]);
  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalAmount = useMemo(() => items.reduce((sum, item) => {
    const price = item.product?.effective_price ?? item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0), [items]);

  const value = useMemo<CartContextValue>(() => ({
    cart,
    items,
    totalItems,
    totalAmount,
    isLoading,
    error,
    refreshCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getItemMaxQuantity,
  }), [cart, items, totalItems, totalAmount, isLoading, error]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
