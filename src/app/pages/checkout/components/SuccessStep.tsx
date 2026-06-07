import { motion } from 'motion/react';
import { getImageUrl } from '../../../utils/images';
import { 
  CheckCircle, MapPin, User, MapPinned, Navigation, CreditCard,
  Truck, Package, Box, Home, Download,
} from 'lucide-react';
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';
import { cn } from '../../../components/ui/utils';
import { Button } from '../../../components/ui/button';
import type { PickupStation } from '../../../services/locationService';

interface PaymentProvider {
  id: string;
  name: string;
  color: string;
  logo?: string;
  textColor?: string;
}

interface SuccessStepProps {
  orderResult: any;
  fullName: string;
  mobileNumber: string;
  streetAddress: string;
  selectedWard: string;
  selectedDistrict: string;
  selectedRegion: string;
  pickupStation: PickupStation | null;
  paymentMethod: string;
  subtotal: number;
  platformFee: number;
  shippingCost: number;
  total: number;
  items: any[];
  formatCurrency: (v: number) => string;
  navigate: (path: string) => void;
  mobileProviders: PaymentProvider[];
  cardProviders: PaymentProvider[];
  shippingProviders: any[];
}

export function SuccessStep({
  orderResult,
  fullName,
  mobileNumber,
  streetAddress,
  selectedWard,
  selectedDistrict,
  selectedRegion,
  pickupStation,
  paymentMethod,
  subtotal,
  platformFee,
  shippingCost,
  total,
  items,
  formatCurrency,
  navigate,
  mobileProviders,
  cardProviders,
  shippingProviders,
}: SuccessStepProps) {
  const allProviders = [...mobileProviders, ...cardProviders];
  const selectedProvider = allProviders.find(p => p.id === paymentMethod);
  const estimatedDelivery = shippingProviders.find(p => p.id === (orderResult?.order?.shipping_method || 'fargo'))?.days || '3-5';
  const orderStatus = 'confirmed';

  const timelineSteps = [
    { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, completed: true },
    { id: 'payment_received', label: 'Payment Received', icon: CheckCircle, completed: true },
    { id: 'processing', label: 'Processing', icon: Package, completed: false },
    { id: 'packed', label: 'Packed', icon: Box, completed: false },
    { id: 'shipped', label: 'Shipped', icon: Truck, completed: false },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: Navigation, completed: false },
    { id: 'delivered', label: 'Delivered', icon: Home, completed: false },
  ];

  const statusIndex = timelineSteps.findIndex(s => s.id === orderStatus);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: Order Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Success Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="bg-white rounded-[24px] p-8 shadow-[var(--shadow-level-2)] border border-[var(--color-border)]/50"
        >
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center shrink-0 shadow-sm border-[8px] border-white relative">
              <CheckCircle className="w-10 h-10 text-green-500 relative z-10" />
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
            </div>
            <div className="flex-1">
              <h1 className="text-[28px] font-bold text-[var(--color-text-heading)] mb-2 tracking-tight">
                Order Confirmed!
              </h1>
              <p className="text-[15px] text-[var(--color-text-muted)] mb-4">
                Your payment is secure in escrow. The vendor has been notified to prepare your order.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-[var(--color-bg-page)] rounded-[12px] px-4 py-2 border border-[var(--color-border)]/50">
                  <span className="text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Order #</span>
                  <span className="ml-2 text-[18px] font-mono font-bold text-[var(--color-primary-darker)]">
                    {orderResult?.order?.order_number || 'PENDING'}
                  </span>
                </div>
                <div className="bg-[var(--color-bg-page)] rounded-[12px] px-4 py-2 border border-[var(--color-border)]/50">
                  <span className="text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Est. Delivery</span>
                  <span className="ml-2 text-[18px] font-bold text-[var(--color-text-heading)]">
                    {estimatedDelivery} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shipping Details */}
        <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[var(--shadow-level-2)] border border-[var(--color-border)]/50">
          <h2 className="text-[18px] font-bold text-[var(--color-text-heading)] mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
            Shipping Details
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
              <div>
                <p className="text-[15px] font-bold text-[var(--color-text-heading)]">{fullName}</p>
                <p className="text-[14px] text-[var(--color-text-muted)]">{mobileNumber}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPinned className="w-5 h-5 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
              <div>
                <p className="text-[14px] text-[var(--color-text-body)]">{streetAddress}</p>
                <p className="text-[14px] text-[var(--color-text-body)]">{selectedWard}, {selectedDistrict}, {selectedRegion}</p>
              </div>
            </div>
            {pickupStation && (
              <div className="flex items-start gap-3">
                <Navigation className="w-5 h-5 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[14px] text-[var(--color-text-body)]">Pickup Station: <span className="font-bold text-[var(--color-text-heading)]">{pickupStation.name}</span></p>
                  <p className="text-[13px] text-[var(--color-text-muted)]">{pickupStation.ward}, {pickupStation.district}, {pickupStation.region}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[var(--shadow-level-2)] border border-[var(--color-border)]/50">
          <h2 className="text-[18px] font-bold text-[var(--color-text-heading)] mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[var(--color-primary)]" />
            Payment Details
          </h2>
          <div className="flex items-center gap-4 mb-4">
            {selectedProvider && (
              <div className="w-12 h-12 rounded-[10px] overflow-hidden bg-white shrink-0 border border-[var(--color-border)] flex items-center justify-center">
                {'logo' in selectedProvider && selectedProvider.logo ? (
                  <img src={selectedProvider.logo} alt={selectedProvider.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-[14px]" style={{ backgroundColor: selectedProvider.color }}>
                    {selectedProvider.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            )}
            <div>
              <p className="text-[15px] font-bold text-[var(--color-text-heading)]">{selectedProvider?.name || paymentMethod}</p>
              <p className="text-[14px] text-[var(--color-text-muted)]">
                {mobileProviders.some(p => p.id === paymentMethod) ? 'Mobile Payment' : 'Card / Bank Payment'}
              </p>
            </div>
          </div>
          <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
            <div className="flex justify-between text-[14px]">
              <span className="text-[var(--color-text-muted)]">Subtotal</span>
              <span className="font-bold text-[var(--color-text-heading)]">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-[var(--color-text-muted)]">Platform Fee</span>
              <span className="font-bold text-[var(--color-text-heading)]">{formatCurrency(platformFee)}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-[var(--color-text-muted)]">Shipping</span>
              <span className="font-bold text-[var(--color-text-heading)]">{shippingCost > 0 ? formatCurrency(shippingCost) : 'Free'}</span>
            </div>
            <div className="flex justify-between text-[16px] font-bold pt-2 border-t border-[var(--color-border)]">
              <span className="text-[var(--color-text-heading)]">Total Paid</span>
              <span className="text-[var(--color-accent)] text-[20px]">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Order Tracking Timeline */}
        <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[var(--shadow-level-2)] border border-[var(--color-border)]/50">
          <h2 className="text-[18px] font-bold text-[var(--color-text-heading)] mb-6 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[var(--color-primary)]" />
            Order Tracking
          </h2>
          <div className="space-y-4">
            {timelineSteps.map((timelineStep, index) => {
              const Icon = timelineStep.icon;
              const isCompleted = index <= statusIndex;
              const isCurrent = index === statusIndex;
              return (
                <div key={timelineStep.id} className="flex items-start gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all',
                    isCompleted ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-page)] text-[var(--color-text-muted)] border-2 border-[var(--color-border)]'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={cn('text-[15px] font-bold', isCompleted ? 'text-[var(--color-text-heading)]' : 'text-[var(--color-text-muted)]')}>
                      {timelineStep.label}
                    </p>
                    {isCurrent && (
                      <p className="text-[13px] text-[var(--color-primary)] font-medium mt-0.5">
                        In progress
                      </p>
                    )}
                    {isCompleted && !isCurrent && (
                      <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">
                        Completed
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Actions */}
      <div className="space-y-6">
        {/* Order Summary */}
        <div className="bg-white rounded-[24px] p-6 shadow-[var(--shadow-level-2)] border border-[var(--color-border)]/50">
          <h2 className="text-[18px] font-bold text-[var(--color-text-heading)] mb-4">Order Summary</h2>
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-[8px] bg-[var(--color-bg-card)] overflow-hidden border border-[var(--color-border)]/50 shrink-0">
                  <ImageWithFallback src={getImageUrl(item.product?.images?.[0]?.image_path)} alt={item.product?.name || 'Item'} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[var(--color-text-heading)] truncate">{item.product?.name || 'Product'}</p>
                  <p className="text-[12px] text-[var(--color-text-muted)]">Qty: {item.quantity}</p>
                </div>
                <p className="text-[13px] font-bold text-[var(--color-text-heading)]">{formatCurrency((item.product?.effective_price ?? item.product?.price ?? 0) * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-[24px] p-6 shadow-[var(--shadow-level-2)] border border-[var(--color-border)]/50">
          <div className="space-y-3">
            <Button onClick={() => navigate(`/orders/${orderResult?.order?.id}`)} variant="primary" size="xl" className="w-full bg-[var(--color-primary)] shadow-md">
              <Package className="w-5 h-5 mr-2" /> Track Your Order
            </Button>
            <Button variant="secondary" size="xl" className="w-full bg-white font-bold">
              <Download className="w-5 h-5 mr-2" /> Download Invoice
            </Button>
            <Button onClick={() => navigate('/customer')} variant="ghost" size="xl" className="w-full text-[var(--color-text-muted)] font-bold">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
