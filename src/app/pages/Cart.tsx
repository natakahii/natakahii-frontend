import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ArrowLeft, Loader, AlertCircle, ChevronRight, CheckCircle, Package } from 'lucide-react';
import { EmptyState } from '../components/ui/empty-state';
import { formatCurrency } from '../utils/currency';
import { useCart } from '../providers/CartProvider';
import { useAuth } from '../providers/AuthProvider';
import { toast } from '../components/ui/toast';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '../components/ui/drawer';
import {
  CatalogProduct,
  CatalogProductVariant,
  fetchProduct,
  getProductPrice,
  getProductPrimaryImage,
} from '../services/productService';
import { cn } from '../components/ui/utils';

/* ─── helpers (ported from ProductDetail) ─── */
function getVariantSelections(variant: CatalogProductVariant) {
  return variant.attribute_values.reduce<Record<string, string>>((selection, attributeValue) => {
    const key = attributeValue.attribute?.code || attributeValue.attribute?.name || `option-${attributeValue.id}`;
    const value = attributeValue.attribute_value?.value || (attributeValue.numeric_value != null ? String(attributeValue.numeric_value) : '');
    if (value) selection[key] = value;
    return selection;
  }, {});
}

function getOptionGroups(product: CatalogProduct) {
  const groups = new Map<string, { key: string; label: string; values: string[] }>();
  product.variants.forEach((variant) => {
    variant.attribute_values.forEach((attributeValue) => {
      const key = attributeValue.attribute?.code || attributeValue.attribute?.name || `option-${attributeValue.id}`;
      const label = attributeValue.attribute?.name || key;
      const value = attributeValue.attribute_value?.value || (attributeValue.numeric_value != null ? String(attributeValue.numeric_value) : '');
      if (!value) return;
      if (!groups.has(key)) groups.set(key, { key, label, values: [] });
      const group = groups.get(key)!;
      if (!group.values.includes(value)) group.values.push(value);
    });
  });
  return Array.from(groups.values());
}

function findMatchingVariant(product: CatalogProduct, selections: Record<string, string>) {
  if (!product.variants.length) return null;
  return product.variants.find((variant) => {
    const variantSelections = getVariantSelections(variant);
    const groups = getOptionGroups(product);
    return groups.every((group) => !selections[group.key] || variantSelections[group.key] === selections[group.key]);
  }) || null;
}

/* ─── component ─── */
export function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, totalAmount, isLoading, error, removeItem, addToCart } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [productDetails, setProductDetails] = useState<Record<number, CatalogProduct>>({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [itemSelections, setItemSelections] = useState<Record<number, Record<string, string>>>({});
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true });
  }, [isAuthenticated, navigate]);

  /* fetch full product details when drawer opens */
  useEffect(() => {
    if (!drawerOpen) return;
    let cancelled = false;
    setLoadingProducts(true);
    Promise.all(
      items.map(async (item) => {
        if (productDetails[item.product_id]) return;
        try {
          const res = await fetchProduct(item.product_id);
          if (!cancelled) {
            setProductDetails((prev) => ({ ...prev, [item.product_id]: res.product }));
          }
        } catch (e) {
          console.error('fetchProduct failed', item.product_id, e);
        }
      })
    ).finally(() => {
      if (!cancelled) setLoadingProducts(false);
    });
    return () => { cancelled = true; };
  }, [drawerOpen, items]);

  /* seed selections from current cart variants */
  useEffect(() => {
    if (!drawerOpen || loadingProducts) return;
    setItemSelections((prev) => {
      const next: Record<number, Record<string, string>> = {};
      items.forEach((item) => {
        const product = productDetails[item.product_id];
        if (!product) return;
        if (prev[item.id]) { next[item.id] = prev[item.id]; return; }
        const variant = product.variants.find((v) => v.id === item.variant_id);
        next[item.id] = variant ? getVariantSelections(variant) : {};
      });
      return next;
    });
  }, [drawerOpen, loadingProducts, items, productDetails]);

  const allVariantsSelected = useMemo(() => {
    return items.every((item) => {
      const product = productDetails[item.product_id];
      if (!product || product.variants.length === 0) return true;
      const groups = getOptionGroups(product);
      if (groups.length === 0) return true;
      const selections = itemSelections[item.id] || {};
      return groups.every((g) => selections[g.key]);
    });
  }, [items, productDetails, itemSelections]);

  const handleConfirm = useCallback(async () => {
    if (!allVariantsSelected) return;
    setConfirmLoading(true);
    try {
      const snapshot = [...items];
      for (const item of snapshot) {
        const product = productDetails[item.product_id];
        if (!product || product.variants.length === 0) continue;
        const selections = itemSelections[item.id] || {};
        const newVariant = findMatchingVariant(product, selections);
        if (newVariant && newVariant.id !== item.variant_id) {
          await removeItem(item.id);
          await addToCart(product.id, item.quantity, newVariant.id);
        }
      }
      setDrawerOpen(false);
      navigate('/checkout');
    } catch (err: any) {
      toast({ type: 'error', title: err?.message || 'Failed to update selections' });
    } finally {
      setConfirmLoading(false);
    }
  }, [allVariantsSelected, items, productDetails, itemSelections, removeItem, addToCart, navigate]);

  const subtotal = totalAmount || items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader className="w-12 h-12 text-[var(--color-primary)] animate-spin mb-4" />
        <p className="text-[var(--color-text-muted)] font-medium">Loading your cart…</p>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-[12px] p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900 mb-2">Error Loading Cart</h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <Button onClick={() => navigate('/customer')} variant="secondary" size="sm">Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <EmptyState
          variant="cart"
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Discover amazing products from verified vendors!"
          actionLabel="Start Shopping"
          actionOnClick={() => navigate('/customer')}
        />
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-page)] min-h-[calc(100vh-72px)] pb-28 sm:pb-12">
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/customer')} className="w-10 h-10 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-bg-card)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-[var(--color-text-heading)]" />
          </button>
          <h1 className="text-[24px] sm:text-[32px] font-bold text-[var(--color-text-heading)] tracking-tight">Shopping Cart</h1>
        </div>
        <p className="text-[14px] text-[var(--color-text-muted)] ml-13">{items.length} item{items.length === 1 ? '' : 's'} in your cart</p>
      </div>

      {/* Item list */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const price = item.product?.price || 0;
            const name = item.product?.name || 'Product';
            const image = item.product?.images?.[0]?.image_path || '';
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[16px] p-4 shadow-sm border border-[var(--color-border)]/50 flex items-center gap-4"
              >
                <div className="w-20 h-20 rounded-[12px] overflow-hidden bg-[var(--color-bg-card)] shrink-0 border border-[var(--color-border)]">
                  <ImageWithFallback src={image} alt={name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[15px] text-[var(--color-text-heading)] truncate">{name}</h3>
                  <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">
                    {item.variant_id ? `Variant: #${item.variant_id}` : 'Default variant'} · Qty: {item.quantity}
                  </p>
                  <p className="text-[16px] font-bold text-[var(--color-accent)] mt-1">{formatCurrency(price * item.quantity)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Total row (desktop) */}
        <div className="hidden sm:flex items-center justify-between mt-6 py-4 border-t border-[var(--color-border)]">
          <span className="text-[18px] font-bold text-[var(--color-text-heading)]">Total</span>
          <span className="text-[24px] font-bold text-[var(--color-accent)]">{formatCurrency(subtotal)}</span>
        </div>

        {/* Desktop buttons */}
        <div className="hidden sm:flex gap-4 mt-4 mb-12">
          <Button variant="secondary" size="xl" className="flex-1" onClick={() => navigate('/customer')}>
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Shopping
          </Button>
          <Button variant="primary" size="xl" className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)]" onClick={() => setDrawerOpen(true)}>
            Buy Now <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] p-4 flex gap-3 z-40 sm:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <Button variant="secondary" size="l" className="flex-1" onClick={() => navigate('/customer')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button variant="primary" size="l" className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]" onClick={() => setDrawerOpen(true)}>
          Buy Now
        </Button>
      </div>

      {/* ─── Variant Review Drawer ─── */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-white max-h-[85vh]">
          <DrawerHeader className="border-b border-[var(--color-border)] pb-4">
            <DrawerTitle className="flex items-center gap-2 text-[18px] text-[var(--color-text-heading)]">
              <Package className="w-5 h-5 text-[var(--color-primary)]" />
              Review Your Order
            </DrawerTitle>
            <DrawerDescription className="text-[13px] text-[var(--color-text-muted)]">
              Confirm product variants before proceeding to checkout.
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto p-4 space-y-6">
            {loadingProducts && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader className="w-8 h-8 text-[var(--color-primary)] animate-spin mb-2" />
                <p className="text-[13px] text-[var(--color-text-muted)]">Loading product details…</p>
              </div>
            )}

            {items.map((item) => {
              const product = productDetails[item.product_id];
              const selections = itemSelections[item.id] || {};
              const groups = product ? getOptionGroups(product) : [];
              const selectedVariant = product ? findMatchingVariant(product, selections) : null;
              const unitPrice = selectedVariant
                ? (selectedVariant.discount_price ?? selectedVariant.price ?? getProductPrice(product!))
                : (item.product?.price || 0);
              const stock = selectedVariant?.stock ?? product?.stock ?? item.product?.stock ?? 0;
              const variantImage = selectedVariant
                ? getProductPrimaryImage(product!)
                : (item.product?.images?.[0]?.image_path || '');

              return (
                <div key={item.id} className="bg-[var(--color-bg-page)] rounded-[16px] p-4 border border-[var(--color-border)]/50">
                  {/* Item header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-[10px] overflow-hidden bg-white shrink-0 border border-[var(--color-border)]">
                      <ImageWithFallback src={variantImage} alt={item.product?.name || ''} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[14px] text-[var(--color-text-heading)] truncate">{item.product?.name || 'Product'}</h4>
                      <p className="text-[13px] text-[var(--color-text-muted)]">Qty: {item.quantity}</p>
                      <p className="text-[15px] font-bold text-[var(--color-accent)]">{formatCurrency(unitPrice * item.quantity)}</p>
                    </div>
                  </div>

                  {/* Variant selectors */}
                  {groups.length > 0 && (
                    <div className="space-y-4">
                      {groups.map((group) => (
                        <div key={group.key}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[13px] font-bold text-[var(--color-text-heading)]">
                              {group.label}: <span className="font-normal text-[var(--color-text-body)]">{selections[group.key] || 'Select…'}</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {group.values.map((value) => {
                              const isActive = selections[group.key] === value;
                              return (
                                <button
                                  key={value}
                                  onClick={() =>
                                    setItemSelections((prev) => ({
                                      ...prev,
                                      [item.id]: { ...prev[item.id], [group.key]: value },
                                    }))
                                  }
                                  className={cn(
                                    'h-9 px-4 rounded-[8px] border-2 font-semibold text-[13px] transition-all flex items-center justify-center min-w-[2.5rem]',
                                    isActive
                                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md'
                                      : 'border-[var(--color-border)] text-[var(--color-text-heading)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] bg-white'
                                  )}
                                >
                                  {value}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Stock indicator */}
                      <div className="flex items-center gap-1.5 text-[12px] font-bold">
                        <CheckCircle className={cn('w-3.5 h-3.5', stock > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]')} />
                        <span className={stock > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}>
                          {stock > 0 ? `In Stock (${stock} available)` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                  )}

                  {!product && !loadingProducts && (
                    <p className="text-[12px] text-[var(--color-text-muted)]">Unable to load variant details.</p>
                  )}
                </div>
              );
            })}
          </div>

          <DrawerFooter className="border-t border-[var(--color-border)] p-4">
            <Button
              variant="primary"
              size="xl"
              className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)]"
              disabled={!allVariantsSelected || confirmLoading}
              onClick={handleConfirm}
            >
              {confirmLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : allVariantsSelected ? (
                <>Confirm <ChevronRight className="w-5 h-5 ml-2" /></>
              ) : (
                <>Buy Now <ChevronRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
            <p className="text-center text-[11px] text-[var(--color-text-muted)] mt-2">
              {allVariantsSelected ? 'All set! Tap Confirm to proceed.' : 'Please select all required options above.'}
            </p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

