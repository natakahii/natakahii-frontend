import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Minus, Plus, Trash2, ShieldCheck, Truck, ChevronRight, ShoppingBag } from 'lucide-react';
import { EmptyState } from '../components/ui/empty-state';

const mockCartItems = [
  { id: 1, title: "African Print Maxi Dress", variant: "Size: M, Color: Blue/Gold", vendor: "Nairobi Styles", price: 4500, quantity: 1, img: "https://images.unsplash.com/photo-1508418717103-8b56bcf03360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
  { id: 2, title: "Handcrafted Leather Sneakers", variant: "Size: 42, Color: Brown", vendor: "Kazi Kicks", price: 6200, quantity: 2, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" }
];

const shippingProviders = [
  { id: 'fargo', name: 'Fargo Courier', days: '1-2 Days', price: 450, logo: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?crop=entropy&cs=tinysrgb&fit=crop&w=100&q=80' },
  { id: 'sendy', name: 'Sendy Express', days: 'Same Day', price: 800, logo: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?crop=entropy&cs=tinysrgb&fit=crop&w=100&q=80' },
  { id: 'pickup', name: 'Vendor Pickup', days: 'Today', price: 0, logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?crop=entropy&cs=tinysrgb&fit=crop&w=100&q=80' }
];

export function Cart() {
  const [items, setItems] = useState(mockCartItems);
  const [shippingMethod, setShippingMethod] = useState(shippingProviders[0].id);
  const navigate = useNavigate();

  const updateQuantity = (id: number, delta: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const platformFee = Math.round(subtotal * 0.02);
  const shippingCost = shippingProviders.find(p => p.id === shippingMethod)?.price || 0;
  const total = subtotal + platformFee + shippingCost;

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
    <div className="bg-[var(--color-bg-page)] min-h-[calc(100vh-72px)] py-8 lg:py-12">
      <div className="container mx-auto px-4">
        
        <h1 className="text-[32px] font-bold text-[var(--color-text-heading)] mb-8 tracking-tight">Shopping Cart <span className="text-[var(--color-text-muted)] font-normal">({items.length})</span></h1>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* LEFT: CART ITEMS */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            <div className="bg-white rounded-[16px] p-6 shadow-sm border border-[var(--color-border)]/50">
              <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-[var(--color-border)] mb-4 text-[13px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                <div className="col-span-6">Product Details</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-1"></div>
              </div>
              
              <div className="flex flex-col gap-6">
                {items.map((item, idx) => (
                  <div key={item.id} className={`grid grid-cols-1 sm:grid-cols-12 gap-4 items-start sm:items-center ${idx !== items.length - 1 ? 'pb-6 border-b border-[var(--color-border)]/50' : ''}`}>
                    
                    {/* Product Info */}
                    <div className="col-span-1 sm:col-span-6 flex gap-4">
                      <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-[12px] overflow-hidden bg-[var(--color-bg-card)] shrink-0 border border-[var(--color-border)]">
                        <ImageWithFallback src={item.img} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="font-bold text-[15px] text-[var(--color-text-heading)] line-clamp-2 leading-tight mb-1">{item.title}</h3>
                        <p className="text-[13px] text-[var(--color-text-muted)] mb-1">{item.variant}</p>
                        <p className="text-[12px] font-medium text-[var(--color-primary)] flex items-center gap-1">Sold by {item.vendor}</p>
                        <div className="sm:hidden text-[16px] font-bold text-[var(--color-accent)] mt-2">
                          KES {(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Quantity Stepper */}
                    <div className="col-span-1 sm:col-span-3 flex items-center justify-start sm:justify-center mt-2 sm:mt-0">
                      <div className="flex items-center gap-1 bg-[var(--color-bg-page)] rounded-full p-1 border border-[var(--color-border)]">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-[var(--color-text-heading)] transition-all disabled:opacity-50" disabled={item.quantity <= 1}>
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-[14px] font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-[var(--color-text-heading)] transition-all">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Price (Desktop) */}
                    <div className="hidden sm:block col-span-2 text-right">
                      <span className="text-[16px] font-bold text-[var(--color-text-heading)]">KES {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    
                    {/* Remove */}
                    <div className="absolute right-6 sm:static sm:col-span-1 flex justify-end">
                      <button onClick={() => removeItem(item.id)} className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-[12px] p-4 flex items-start gap-3 mt-2">
              <ShieldCheck className="w-6 h-6 text-[var(--color-primary)] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[14px] text-[var(--color-primary-darker)]">Nataka Hii Buyer Protection</h4>
                <p className="text-[13px] text-[var(--color-primary)]/80 mt-1">Get what you ordered or your money back. Funds are held in escrow until you confirm delivery.</p>
              </div>
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[var(--shadow-level-2)] border border-[var(--color-border)]/50 sticky top-[100px]">
              <h2 className="text-[20px] font-bold text-[var(--color-text-heading)] mb-6 border-b border-[var(--color-border)] pb-4 tracking-tight">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-[15px] font-medium text-[var(--color-text-muted)]">
                  <span>Subtotal</span>
                  <span className="text-[var(--color-text-heading)]">KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[15px] font-medium text-[var(--color-text-muted)]">
                  <span>Platform Fee (2%)</span>
                  <span className="text-[var(--color-text-heading)]">KES {platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[15px] font-medium text-[var(--color-text-muted)]">
                  <span>Estimated Shipping</span>
                  <span className="text-[var(--color-text-heading)]">{shippingCost > 0 ? `KES ${shippingCost.toLocaleString()}` : 'Free'}</span>
                </div>
              </div>

              {/* Shipping Quote Selector */}
              <div className="mb-6 pt-6 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-[var(--color-text-heading)]" />
                  <h3 className="font-bold text-[15px] text-[var(--color-text-heading)]">Delivery Method</h3>
                </div>
                <div className="space-y-3">
                  {shippingProviders.map(provider => (
                    <label key={provider.id} className={`flex items-center gap-3 p-3 rounded-[12px] border-2 cursor-pointer transition-all ${shippingMethod === provider.id ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)] shadow-sm' : 'border-[var(--color-border)] bg-white hover:border-[var(--color-border-hover)]'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${shippingMethod === provider.id ? 'border-[var(--color-primary)]' : 'border-[var(--color-text-muted)]'}`}>
                        {shippingMethod === provider.id && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                      </div>
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0">
                        <img src={provider.logo} alt={provider.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[14px] text-[var(--color-text-heading)]">{provider.name}</div>
                        <div className="text-[12px] text-[var(--color-text-muted)]">{provider.days}</div>
                      </div>
                      <div className="font-bold text-[14px] text-[var(--color-text-heading)]">
                        {provider.price === 0 ? 'Free' : `KES ${provider.price}`}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-[20px] font-bold text-[var(--color-text-heading)] mb-8 pt-6 border-t border-[var(--color-border)]">
                <span>Total</span>
                <span className="text-[var(--color-accent)] text-[24px]">KES {total.toLocaleString()}</span>
              </div>

              <Button onClick={() => navigate('/checkout')} variant="primary" size="xl" className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)]">
                Proceed to Checkout <ChevronRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[12px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4" /> Secure Escrow Payment
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
