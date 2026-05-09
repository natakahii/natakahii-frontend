import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ShieldCheck, Truck, CreditCard, Banknote, CheckCircle, ChevronRight, ChevronLeft, MapPin, Package, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { formatCurrency } from '../utils/currency';
import { useCart } from '../providers/CartProvider';

const shippingProviders = [
  { id: 'fargo', name: 'Fargo Courier', level: 'Express', days: '1-2 Days', price: 450 },
  { id: 'sendy', name: 'Sendy', level: 'Same Day', days: 'Today', price: 800 }
];

export function Checkout() {
  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState(shippingProviders[0].id);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const navigate = useNavigate();
  const { items, totalAmount } = useCart();

  const subtotal = totalAmount || items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const platformFee = Math.round(subtotal * 0.02);
  const shippingCost = shippingProviders.find(p => p.id === shippingMethod)?.price || 0;
  const total = subtotal + platformFee + shippingCost;

  const handleNext = () => {
    if (step === 2) {
      // Trigger confetti on success
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#142490', '#F05A28']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#142490', '#F05A28']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
    setStep(s => Math.min(s + 1, 3));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  if (step === 3) {
    return (
      <div className="bg-[var(--color-bg-page)] min-h-[calc(100vh-72px)] py-12 flex flex-col items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border-[8px] border-white relative"
          >
            <CheckCircle className="w-16 h-16 text-green-500 relative z-10" />
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
          </motion.div>
          
          <h1 className="text-[36px] md:text-[48px] font-bold text-[var(--color-text-heading)] mb-4 tracking-tight">
            Order Confirmed!
          </h1>
          
          <p className="text-[18px] text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">
            Your payment is secure in escrow. The vendor has been notified to prepare your order.
          </p>

          <div className="bg-white rounded-[24px] p-8 shadow-[var(--shadow-level-2)] border border-[var(--color-border)]/50 mb-10 max-w-sm mx-auto">
            <div className="text-[13px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Order Number</div>
            <div className="text-[32px] font-mono font-bold text-[var(--color-primary-darker)] tracking-widest">
              #{Math.random().toString(36).substring(2, 8).toUpperCase()}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => navigate('/tracking')} variant="primary" size="xl" className="w-full sm:w-auto bg-[var(--color-primary)] shadow-md px-10">
              <Package className="w-5 h-5 mr-2" /> Track Your Order
            </Button>
            <Button onClick={() => navigate('/customer')} variant="secondary" size="xl" className="w-full sm:w-auto bg-white px-10 font-bold">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-page)] min-h-[calc(100vh-72px)] py-8 lg:py-12 relative overflow-hidden">
      
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-accent)]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        
        {/* PROGRESS BAR */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[16px] transition-all shadow-sm border-2 ${step >= 1 ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)]'}`}>1</div>
              <span className={`text-[13px] font-bold ${step >= 1 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>Delivery</span>
            </div>
            <div className={`h-[3px] flex-1 rounded-full transition-all ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[16px] transition-all shadow-sm border-2 ${step >= 2 ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)]'}`}>2</div>
              <span className={`text-[13px] font-bold ${step >= 2 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>Payment</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* MAIN CONTENT */}
          <div className="w-full lg:w-2/3">
            <AnimatePresence mode="wait" initial={false}>
              
              {/* STEP 1: DELIVERY */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8 bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-[var(--color-border)]/50"
                >
                  <div className="flex items-center gap-3 pb-6 border-b border-[var(--color-border)]">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h2 className="text-[20px] font-bold text-[var(--color-text-heading)] tracking-tight">Delivery Details</h2>
                      <p className="text-[14px] text-[var(--color-text-muted)]">Where should we send your order?</p>
                    </div>
                  </div>

                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">First Name</label>
                        <Input placeholder="Jane" required className="focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Last Name</label>
                        <Input placeholder="Doe" required className="focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Phone Number</label>
                      <Input type="tel" placeholder="+254 7XX XXX XXX" required className="focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Region / County</label>
                        <select className="w-full rounded-[8px] border-2 border-[var(--color-border)] bg-white px-4 py-3 text-[14px] text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow">
                          <option>Nairobi</option>
                          <option>Mombasa</option>
                          <option>Kisumu</option>
                          <option>Nakuru</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Ward / Estate</label>
                        <Input placeholder="e.g. Kilimani" required className="focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Street Address</label>
                      <Input placeholder="Building, Floor, Apartment number" required className="focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                    </div>

                    <div className="pt-6 border-t border-[var(--color-border)]">
                      <h3 className="font-bold text-[16px] text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-[var(--color-primary)]" />
                        Shipping Options
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {shippingProviders.map(provider => (
                          <div 
                            key={provider.id} 
                            onClick={() => setShippingMethod(provider.id)}
                            className={`cursor-pointer rounded-[16px] border-2 p-4 transition-all relative overflow-hidden bg-white shadow-sm ${
                              shippingMethod === provider.id 
                              ? 'border-[var(--color-primary)] shadow-md' 
                              : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                            }`}
                          >
                            {shippingMethod === provider.id && (
                              <div className="absolute top-3 right-3">
                                <CheckCircle className="w-6 h-6 text-[var(--color-primary)] fill-[var(--color-primary-bg)]" />
                              </div>
                            )}
                            
                            <div className="w-12 h-12 rounded-[12px] bg-[var(--color-primary-bg)] flex items-center justify-center mb-3 border border-[var(--color-border)]/50">
                              <Truck className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            
                            <h4 className="font-bold text-[16px] text-[var(--color-text-heading)] tracking-tight">{provider.name}</h4>
                            <div className="flex items-center gap-2 mt-1 mb-3">
                              <span className="text-[13px] font-semibold text-[var(--color-primary)]">{provider.level}</span>
                              <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]" />
                              <span className="text-[13px] font-medium text-[var(--color-text-muted)]">{provider.days}</span>
                            </div>
                            
                            <div className="text-[18px] font-bold text-[var(--color-text-heading)]">
                              {provider.price === 0 ? 'Free' : formatCurrency(provider.price)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 flex justify-end">
                      <Button type="submit" variant="primary" size="xl" className="w-full sm:w-auto px-12 shadow-[var(--shadow-level-2)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-darker)]">
                        Continue to Payment <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: PAYMENT */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8 bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-[var(--color-border)]/50"
                >
                  <div className="flex items-center gap-3 pb-6 border-b border-[var(--color-border)]">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-accent-bg)] flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <div>
                      <h2 className="text-[20px] font-bold text-[var(--color-text-heading)] tracking-tight">Payment Method</h2>
                      <p className="text-[14px] text-[var(--color-text-muted)]">All transactions are secure and encrypted.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* M-PESA */}
                    <div 
                      onClick={() => setPaymentMethod('mpesa')}
                      className={`cursor-pointer rounded-[16px] border-2 p-5 transition-all bg-white shadow-sm ${
                        paymentMethod === 'mpesa' 
                        ? 'border-[#4CAF50] ring-4 ring-[#4CAF50]/10' 
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'mpesa' ? 'border-[#4CAF50]' : 'border-[var(--color-text-muted)]'}`}>
                            {paymentMethod === 'mpesa' && <div className="w-3 h-3 rounded-full bg-[#4CAF50]" />}
                          </div>
                          <div className="font-bold text-[18px] text-[var(--color-text-heading)]">M-Pesa</div>
                        </div>
                        <div className="font-bold text-[24px] text-[#4CAF50] tracking-tighter italic">M-PESA</div>
                      </div>
                      
                      {paymentMethod === 'mpesa' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pl-10 space-y-4 overflow-hidden">
                          <p className="text-[14px] text-[var(--color-text-muted)] leading-relaxed">
                            Enter your M-Pesa number. A prompt will appear on your phone to complete the payment.
                          </p>
                          <Input type="tel" placeholder="+254 7XX XXX XXX" className="font-mono text-[16px] focus:border-[#4CAF50] focus:ring-[#4CAF50] max-w-sm" />
                        </motion.div>
                      )}
                    </div>

                    {/* CREDIT CARD */}
                    <div 
                      onClick={() => setPaymentMethod('card')}
                      className={`cursor-pointer rounded-[16px] border-2 p-5 transition-all bg-white shadow-sm ${
                        paymentMethod === 'card' 
                        ? 'border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/10' 
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'card' ? 'border-[var(--color-primary)]' : 'border-[var(--color-text-muted)]'}`}>
                            {paymentMethod === 'card' && <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />}
                          </div>
                          <div className="font-bold text-[18px] text-[var(--color-text-heading)]">Credit / Debit Card</div>
                        </div>
                        <CreditCard className="w-6 h-6 text-[var(--color-text-muted)]" />
                      </div>
                      
                      {paymentMethod === 'card' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pl-10 space-y-4 overflow-hidden pt-2">
                          <Input placeholder="Card Number" className="font-mono" />
                          <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="MM/YY" className="font-mono" />
                            <Input placeholder="CVC" className="font-mono" />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* CASH ON DELIVERY */}
                    <div 
                      onClick={() => setPaymentMethod('cod')}
                      className={`cursor-pointer rounded-[16px] border-2 p-5 transition-all bg-white shadow-sm ${
                        paymentMethod === 'cod' 
                        ? 'border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/10' 
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'cod' ? 'border-[var(--color-primary)]' : 'border-[var(--color-text-muted)]'}`}>
                            {paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />}
                          </div>
                          <div className="font-bold text-[18px] text-[var(--color-text-heading)]">Cash on Delivery</div>
                        </div>
                        <Banknote className="w-6 h-6 text-[var(--color-text-muted)]" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex items-center justify-between gap-4 border-t border-[var(--color-border)]">
                    <Button onClick={handleBack} variant="ghost" className="text-[var(--color-text-muted)] font-bold px-0 hover:bg-transparent hover:text-[var(--color-text-heading)]">
                      <ChevronLeft className="w-5 h-5 mr-1" /> Back
                    </Button>
                    <Button onClick={handleNext} variant="primary" size="xl" className="flex-1 max-w-xs px-12 shadow-[var(--shadow-level-2)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]">
                      Place Order
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* SIDEBAR: ORDER SUMMARY */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[var(--shadow-level-2)] border border-[var(--color-border)]/50 sticky top-[100px]">
              <h2 className="text-[20px] font-bold text-[var(--color-text-heading)] mb-6 tracking-tight flex items-center gap-2">
                Order Summary
              </h2>

              <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-[var(--color-border)]">
                {items.length === 0 ? (
                  <div className="text-[13px] text-[var(--color-text-muted)]">Your cart is empty.</div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-[8px] bg-[var(--color-bg-card)] overflow-hidden border border-[var(--color-border)]/50 shrink-0">
                        <ImageWithFallback src={item.product?.images?.[0]?.image_path || ''} alt={item.product?.name || 'Item'} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-[var(--color-text-heading)] truncate">{item.product?.name || 'Product'}</div>
                        <div className="text-[12px] text-[var(--color-text-muted)]">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-[13px] font-bold text-[var(--color-text-heading)]">{formatCurrency((item.product?.price || 0) * item.quantity)}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4 mb-6 pt-2">
                <div className="flex justify-between text-[15px] font-medium text-[var(--color-text-muted)]">
                  <span>Subtotal</span>
                  <span className="text-[var(--color-text-heading)]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[15px] font-medium text-[var(--color-text-muted)]">
                  <span>Platform Fee</span>
                  <span className="text-[var(--color-text-heading)]">{formatCurrency(platformFee)}</span>
                </div>
                <div className="flex justify-between text-[15px] font-medium text-[var(--color-text-muted)]">
                  <span>Shipping</span>
                  <span className="text-[var(--color-text-heading)]">{shippingCost > 0 ? formatCurrency(shippingCost) : 'Free'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[20px] font-bold text-[var(--color-text-heading)] mb-8 pt-6 border-t border-[var(--color-border)]">
                <span>Total</span>
                <span className="text-[var(--color-accent)] text-[28px] tracking-tight">{formatCurrency(total)}</span>
              </div>

              {/* Escrow badge */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-[var(--color-primary-darker)] rounded-[16px] p-4 flex items-center justify-between cursor-help group shadow-[var(--shadow-level-1)]">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-[var(--color-accent)]" />
                        <span className="text-[13px] font-bold text-white tracking-wide uppercase">Escrow Protected</span>
                      </div>
                      <Info className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-[13px] p-3 leading-relaxed">
                    <p className="font-bold mb-1">Your money is safe.</p>
                    We hold your payment securely until you receive the order and confirm it matches the description. Only then do we release funds to the vendor.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
