import { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Box, 
  ChevronRight, 
  ChevronLeft, 
  Info,
  AlertCircle,
  Ship
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type { OrderSummaryProps } from './OrderSummary';
import { OrderSummary } from './OrderSummary';

  interface CargoStepProps extends OrderSummaryProps {
    pickupHub: string;
    setPickupHub: (id: string) => void;
    deliveryHub: string;
    setDeliveryHub: (id: string) => void;
    cargoServiceLevel: 'standard' | 'express' | 'same_day';
    setCargoServiceLevel: (level: 'standard' | 'express' | 'same_day') => void;
    cargoWeight: number;
    setCargoWeight: (weight: number) => void;
    hubs: Array<{id: number; name: string; code: string}>;
    onQuoteUpdate?: (quote: any) => void;
    handleNext: () => void;
    handleBack: () => void;
  }

export function CargoStep({
  items,
  subtotal,
  platformFee,
  shippingCost,
  total,
  shippingMethod,
  shippingProviders,
  formatCurrency,
  pickupHub,
  setPickupHub,
  deliveryHub,
  setDeliveryHub,
  cargoServiceLevel,
  setCargoServiceLevel,
  cargoWeight,
  setCargoWeight,
  hubs,
  onQuoteUpdate,
  handleNext,
  handleBack,
}: CargoStepProps) {
   const [quote, setQuote] = useState<any>(null);
   const [loadingQuote, setLoadingQuote] = useState(false);

   useEffect(() => {
     if (pickupHub && deliveryHub) {
       fetchQuote();
     } else {
       setQuote(null);
       onQuoteUpdate?.(null);
     }
   }, [pickupHub, deliveryHub, cargoServiceLevel, cargoWeight]);

   const fetchQuote = async () => {
     if (!pickupHub || !deliveryHub) return;
     
     setLoadingQuote(true);
     try {
       const pickupHubId = hubs.find(h => h.code === pickupHub)?.id || 0;
       const deliveryHubId = hubs.find(h => h.code === deliveryHub)?.id || 0;
       
       const res = await fetch(`http://localhost:8001/api/shipments/quote`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           origin_hub_id: pickupHubId,
           destination_hub_id: deliveryHubId,
           weight: cargoWeight,
           service_level: cargoServiceLevel
         })
       });
       
       const data = await res.json();
       setQuote(data);
       onQuoteUpdate?.(data);
     } catch (err) {
       console.error('Failed to fetch quote', err);
     } finally {
       setLoadingQuote(false);
     }
   };

   return (
    <div className="space-y-8 bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-[var(--color-border)]/50">
      <div className="flex items-center gap-3 pb-6 border-b border-[var(--color-border)]">
        <div className="w-10 h-10 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center shrink-0">
          <Ship className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[var(--color-text-heading)] tracking-tight">
            Cargo Shipping Details
          </h2>
          <p className="text-[14px] text-[var(--color-text-muted)]">
            Select pickup and delivery hubs for NatakaHii Cargo
          </p>
        </div>
      </div>

      {/* Order Summary - Hidden for cargo */}
      <div className="opacity-50 pointer-events-none">
        <OrderSummary 
          items={items}
          subtotal={subtotal}
          platformFee={platformFee}
          shippingCost={shippingCost}
          total={total}
          shippingMethod={shippingMethod}
          shippingProviders={shippingProviders}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Hub Selection */}
      <div className="space-y-6">
        <h3 className="font-bold text-[16px] text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
          Route Selection
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[13px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide">
              Pickup Hub
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
               <select
                 className="w-full bg-[var(--color-bg-page)] border border-[var(--color-border)] rounded-[12px] py-3 pl-10 pr-4 text-[14px] font-bold text-[var(--color-text-heading)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                 value={pickupHub}
                 onChange={(e) => setPickupHub(e.target.value)}
               >
                <option value="">Select Pickup Hub</option>
                {hubs.map(h => (
                  <option key={h.id} value={h.code}>
                    {h.name} ({h.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[13px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide">
              Delivery Hub
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
               <select
                 className="w-full bg-[var(--color-bg-page)] border border-[var(--color-border)] rounded-[12px] py-3 pl-10 pr-4 text-[14px] font-bold text-[var(--color-text-heading)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                 value={deliveryHub}
                 onChange={(e) => setDeliveryHub(e.target.value)}
               >
                <option value="">Select Delivery Hub</option>
                {hubs.map(h => (
                  <option key={h.id} value={h.code}>
                    {h.name} ({h.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Service Level Selection */}
      <div className="space-y-4">
        <h3 className="font-bold text-[16px] text-[var(--color-text-heading)]">
          Service Level
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['standard', 'express', 'same_day'] as const).map((level) => (
               <button
               key={level}
               onClick={() => setCargoServiceLevel(level)}
              className={`p-4 rounded-[16px] border-2 transition-all flex flex-col items-center gap-2
                ${cargoServiceLevel === level 
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]' 
                  : 'border-[var(--color-border)] bg-transparent hover:border-[var(--color-primary)]'
                }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                ${cargoServiceLevel === level 
                  ? 'bg-[var(--color-primary)] text-white' 
                  : 'bg-[var(--color-bg-page)] text-[var(--color-text-muted)]'
                }`}
              >
                {level === 'standard' && <Box size={16} />}
                {level === 'express' && <Ship size={16} />}
                {level === 'same_day' && <Truck size={16} />}
              </div>
              <span className="text-[14px] font-bold text-[var(--color-text-heading)]">
                {level.replace('_', ' ').toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Weight Estimation */}
      <div className="space-y-4">
        <h3 className="font-bold text-[16px] text-[var(--color-text-heading)]">
          Approximate Weight
        </h3>

        <div className="bg-[var(--color-bg-page)] rounded-[16px] p-6 border border-[var(--color-border)]/50">
          <div className="flex justify-between items-center mb-4">
            <label className="text-[14px] font-bold text-[var(--color-text-muted)]">
              Total cargo weight
            </label>
            <span className="text-[20px] font-bold text-[var(--color-primary)]">
              {cargoWeight.toFixed(1)} kg
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="50"
            step="0.5"
            value={cargoWeight}
            onChange={(e) => setCargoWeight(parseFloat(e.target.value))}
            className="w-full h-2 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
          />

          <div className="flex justify-between text-[12px] font-bold text-[var(--color-text-muted)] mt-2">
            <span>1 kg (Small Package)</span>
            <span>50 kg (Heavy Cargo)</span>
          </div>

          <div className="mt-4 p-3 bg-[var(--color-primary-bg)]/30 rounded-[12px] border border-[var(--color-primary)]/20 flex items-start gap-3">
            <Info className="w-4 h-4 text-[var(--color-primary)] mt-0.5 shrink-0" />
            <p className="text-[12px] text-[var(--color-text-muted)]">
              Estimate the total weight of all items. Cargo will verify at pickup.
            </p>
          </div>
        </div>
      </div>

      {/* Price Quote */}
      {quote && !loadingQuote && (
        <div className="space-y-4">
          <h3 className="font-bold text-[16px] text-[var(--color-text-heading)]">
            Shipping Cost
          </h3>

          <div className="bg-[var(--color-bg-page)] rounded-[16px] p-6 border border-[var(--color-border)]/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] text-[var(--color-text-muted)]">
                {quote.estimated_days} Delivery
              </span>
              <span className="text-[24px] font-bold text-[var(--color-accent)]">
                {quote.currency} {quote.estimate.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-muted)]">
              <Box size={12} />
              <span>Service: {cargoServiceLevel.replace('_', ' ').toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-muted)] mt-1">
              <Truck size={12} />
              <span>Weight: {cargoWeight} kg</span>
            </div>
          </div>
        </div>
      )}

      {loadingQuote && (
        <div className="text-center py-4">
          <div className="inline-block w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-[14px] text-[var(--color-text-muted)]">Calculating shipping rate...</p>
        </div>
      )}

      {/* Mobile action button - embedded */}
      <div className="sm:hidden mt-6">
        <Button
          onClick={() => handleNext()}
          variant="primary"
          size="xl"
          className="w-full shadow-[var(--shadow-level-2)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] h-14 text-[16px] font-bold"
        >
          CONFIRM CARGO <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
        <button
          onClick={handleBack}
          className="w-full text-center py-2 text-[14px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]"
        >
          Back to Shipping
        </button>
      </div>

      {/* Desktop action buttons */}
      <div className="hidden sm:flex items-center justify-between gap-4 pt-6 border-t border-[var(--color-border)]">
        <Button onClick={handleBack} variant="ghost" className="text-[var(--color-text-muted)] font-bold px-0 hover:bg-transparent hover:text-[var(--color-text-heading)]">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </Button>
        <Button
           onClick={() => {
             if (!pickupHub || !deliveryHub) {
               handleBack();
               return;
             }
             handleNext();
           }}
           variant="primary"
           size="xl"
           className="px-12 shadow-[var(--shadow-level-2)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
         >
           CONFIRM CARGO <ChevronRight className="w-5 h-5 ml-2" />
         </Button>
       </div>
      </div>
    );
  }
