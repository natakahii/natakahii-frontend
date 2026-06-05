import { 
  MapPin, Home, Plus, User, Phone, MapPinned, Navigation, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { OrderSummary } from './OrderSummary';
import type { PickupStation } from '../../../services/locationService';

interface DeliveryStepProps {
  items: any[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingMethod: string;
  shippingProviders: any[];
  formatCurrency: (v: number) => string;
  savedAddress: boolean;
  fullName: string;
  mobileNumber: string;
  altMobileNumber: string;
  streetAddress: string;
  selectedWard: string;
  selectedDistrict: string;
  selectedRegion: string;
  pickupStation: PickupStation | null;
  setAddressDrawerOpen: (v: boolean) => void;
  setError: (v: string) => void;
  handleBack: () => void;
  handleNext: () => void;
  error: string;
}

export function DeliveryStep({
  items,
  subtotal,
  shippingCost,
  total,
  shippingMethod,
  shippingProviders,
  formatCurrency,
  savedAddress,
  fullName,
  mobileNumber,
  altMobileNumber,
  streetAddress,
  selectedWard,
  selectedDistrict,
  selectedRegion,
  pickupStation,
  setAddressDrawerOpen,
  setError,
  handleBack,
  handleNext,
  error,
}: DeliveryStepProps) {
  return (
    <div className="space-y-8 bg-white p-6 sm:p-8 pb-24 sm:pb-8 rounded-[24px] shadow-sm border border-[var(--color-border)]/50">
      <div className="flex items-center gap-3 pb-6 border-b border-[var(--color-border)]">
        <div className="w-10 h-10 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[var(--color-text-heading)] tracking-tight">Order Summary</h2>
          <p className="text-[14px] text-[var(--color-text-muted)]">Review your items before confirming</p>
        </div>
      </div>

      <OrderSummary 
        items={items}
        subtotal={subtotal}
        shippingCost={shippingCost}
        total={total}
        shippingMethod={shippingMethod}
        shippingProviders={shippingProviders}
        formatCurrency={formatCurrency}
      />

      {/* Shipping Address Section */}
      <div className="pt-6 border-t border-[var(--color-border)]">
        <h3 className="font-bold text-[16px] text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-[var(--color-primary)]" />
          Shipping Address
        </h3>

        {!savedAddress ? (
          <button
            onClick={() => { setAddressDrawerOpen(true); setError(''); }}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-[16px] border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all bg-[var(--color-bg-page)]"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold text-[14px]">Add Your Shipping Address</span>
          </button>
        ) : (
          <div className="bg-[var(--color-bg-page)] rounded-[16px] p-4 border border-[var(--color-border)]/50 space-y-2">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
              <p className="text-[14px] font-bold text-[var(--color-text-heading)]">{fullName}</p>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
              <p className="text-[13px] text-[var(--color-text-body)]">{mobileNumber}{altMobileNumber ? ` / ${altMobileNumber}` : ''}</p>
            </div>
            <div className="flex items-start gap-3">
              <Home className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
              <p className="text-[13px] text-[var(--color-text-body)]">{streetAddress}</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPinned className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
              <p className="text-[13px] text-[var(--color-text-body)]">{selectedWard}, {selectedDistrict}, {selectedRegion}</p>
            </div>
            {pickupStation && (
              <div className="flex items-start gap-3">
                <Navigation className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
                <p className="text-[13px] text-[var(--color-text-body)]">Pickup: {pickupStation.name}</p>
              </div>
            )}
            <button
              onClick={() => setAddressDrawerOpen(true)}
              className="text-[13px] font-bold text-[var(--color-primary)] hover:underline mt-1"
            >
              Edit Address
            </button>
          </div>
        )}
      </div>

      {error && <div className="text-red-500 text-[14px] font-medium bg-red-50 rounded-[8px] p-3">{error}</div>}

      {/* Desktop action buttons */}
      <div className="hidden sm:flex items-center justify-between gap-4 pt-6 border-t border-[var(--color-border)]">
        <Button onClick={handleBack} variant="ghost" className="text-[var(--color-text-muted)] font-bold px-0 hover:bg-transparent hover:text-[var(--color-text-heading)]">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </Button>
        <Button
          onClick={handleNext}
          variant="primary"
          size="xl"
          className="px-12 shadow-[var(--shadow-level-2)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]"
        >
          CONFIRM ORDER <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
