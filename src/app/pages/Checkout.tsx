import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import {
  ShieldCheck, Truck, CreditCard, CheckCircle, ChevronRight, ChevronLeft,
  MapPin, Package, Info, Loader2, Plus, Navigation, MapPinned, ChevronDown,
  Phone, User, Home, ArrowLeft, Box, Download
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { formatCurrency } from '../utils/currency';
import { useCart } from '../providers/CartProvider';
import { orderService } from '../services/orderService';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter,
} from '../components/ui/drawer';
import {
  locationService, openGoogleMapsPicker, type PickupStation,
} from '../services/locationService';
import { cn } from '../components/ui/utils';
import { toast } from '../components/ui/toast';

// Payment provider logos
import mpesaLogo from '../../assets/mpesa.png';
import airtelMoneyLogo from '../../assets/airtelmoney.png';
import halopesaLogo from '../../assets/halopesa.png';
import mixxbyyasLogo from '../../assets/mixxbyyas.png';
import azampesaLogo from '../../assets/azampesa.png';
import selcomLogo from '../../assets/selcom.png';
import crdbLogo from '../../assets/crdb-bank.jpeg';
import nmbLogo from '../../assets/nmb-bank.jpeg';
import nbcLogo from '../../assets/nbc-bank.jpeg';

const mobileProviders = [
  { id: 'mpesa', name: 'M-Pesa', logo: mpesaLogo, color: '#4CAF50' },
  { id: 'airtel_money', name: 'Airtel Money', logo: airtelMoneyLogo, color: '#E40000' },
  { id: 'tigo_pesa', name: 'Tigo Pesa', logo: azampesaLogo, color: '#005BBB' },
  { id: 'halopesa', name: 'HaloPesa', logo: halopesaLogo, color: '#FF6B00' },
  { id: 'mixx_by_yas', name: 'Mixx by Yas', logo: mixxbyyasLogo, color: '#E91E63' },
];

const cardProviders = [
  { id: 'visa', name: 'Visa', color: '#1A1F71', textColor: '#fff' },
  { id: 'mastercard', name: 'Mastercard', color: '#EB001B', textColor: '#fff' },
  { id: 'crdb', name: 'CRDB Bank', logo: crdbLogo, color: '#005BAA' },
  { id: 'nmb', name: 'NMB Bank', logo: nmbLogo, color: '#007A33' },
  { id: 'nbc', name: 'NBC Bank', logo: nbcLogo, color: '#D40000' },
  { id: 'selcom', name: 'Selcom', logo: selcomLogo, color: '#00A859' },
  { id: 'other_card', name: 'Other Card / Bank', color: '#9CA3AF', textColor: '#fff' },
];

const shippingProviders = [
  { id: 'fargo', name: 'Fargo Courier', level: 'Express', days: '1-2 Days', price: 450 },
  { id: 'sendy', name: 'Sendy', level: 'Same Day', days: 'Today', price: 800 }
];

export function Checkout() {
  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState(shippingProviders[0].id);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState<any>(null);
  const navigate = useNavigate();
  const { items, totalAmount } = useCart();

  /* ── Step 1: Address & Order Summary ── */
  const [addressDrawerOpen, setAddressDrawerOpen] = useState(false);

  /* ── Step 2: Payment ── */
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [paymentDrawerCategory, setPaymentDrawerCategory] = useState<'mobile' | 'card' | null>(null);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [altMobileNumber, setAltMobileNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [pickupStation, setPickupStation] = useState<PickupStation | null>(null);
  const [isDefaultAddress, setIsDefaultAddress] = useState(true);
  const [savedAddress, setSavedAddress] = useState(false);
  const [locView, setLocView] = useState<'none' | 'region' | 'district' | 'ward'>('none');
  const [regions, setRegions] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [availableStations, setAvailableStations] = useState<PickupStation[]>([]);

  // Payment form state
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  // Payment execution sub-flow (within step 2)
  const [paymentFlowStep, setPaymentFlowStep] = useState<'select' | 'request' | 'confirm' | 'processing'>('select');
  const [paymentPhoneError, setPaymentPhoneError] = useState('');
  const [providerResponse, setProviderResponse] = useState<'idle' | 'success' | 'incorrect_pin' | 'insufficient_balance' | 'cancelled' | 'timeout'>('idle');

  /* ── provider-specific phone validation ── */
  function validateProviderPhone(providerId: string, phone: string): { valid: boolean; message: string } {
    const digits = phone.replace(/\D/g, '');
    // Support both local (07...) and international (+2557...)
    const normalized = digits.startsWith('255') ? digits.slice(3) : digits;
    if (!normalized) return { valid: false, message: 'Phone number is required' };
    if (normalized.length !== 9 && normalized.length !== 10) {
      return { valid: false, message: 'Phone number must be 10 digits (e.g. 07XX XXX XXX)' };
    }
    // Strip leading 0 for prefix matching
    const prefix = normalized.startsWith('0') ? normalized.slice(1, 4) : normalized.slice(0, 3);
    const providerPrefixes: Record<string, string[]> = {
      mpesa: ['744', '754', '764', '743', '753', '713'],
      airtel_money: ['683', '684', '685', '686', '687', '688', '689', '783', '784', '785', '786', '787', '788', '789', '693', '694'],
      tigo_pesa: ['716', '717', '718', '719', '710', '711', '712', '713', '650', '651', '652', '653', '654', '655', '656', '657', '658', '659'],
      halopesa: ['620', '621', '622', '623', '624', '625', '626', '627', '628', '629', '640', '641', '642', '643', '644', '645', '646', '647', '648', '649'],
      mixx_by_yas: ['650', '651', '652', '653', '654', '655', '656', '657', '658', '659', '710', '711', '712', '713', '714', '715', '716', '717', '718', '719'],
    };
    const allowed = providerPrefixes[providerId];
    if (!allowed) return { valid: true, message: '' };
    const match = allowed.some((p) => prefix.startsWith(p));
    if (!match) {
      const providerNames: Record<string, string> = {
        mpesa: 'M-Pesa', airtel_money: 'Airtel Money', tigo_pesa: 'Tigo Pesa',
        halopesa: 'HaloPesa', mixx_by_yas: 'Mixx by Yas',
      };
      return { valid: false, message: `This number does not appear to be a valid ${providerNames[providerId] || 'provider'} number.` };
    }
    return { valid: true, message: '' };
  }

  const subtotal = totalAmount || items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const platformFee = Math.round(subtotal * 0.02);
  const shippingCost = shippingProviders.find(p => p.id === shippingMethod)?.price || 0;
  const total = subtotal + platformFee + shippingCost;

  const isMobileMoney = ['mpesa', 'airtel_money', 'tigo_pesa', 'halopesa', 'mixx_by_yas'].includes(paymentMethod);

  /* ── load regions when drawer opens ── */
  useEffect(() => {
    if (!addressDrawerOpen) return;
    locationService.fetchRegions().then(setRegions).catch(() => setRegions([]));
  }, [addressDrawerOpen]);

  /* ── cascade: region → districts ── */
  useEffect(() => {
    if (!selectedRegion) { setDistricts([]); setWards([]); return; }
    locationService.fetchDistricts(selectedRegion).then(setDistricts).catch(() => setDistricts([]));
    setSelectedDistrict('');
    setSelectedWard('');
    setPickupStation(null);
  }, [selectedRegion]);

  /* ── cascade: district → wards ── */
  useEffect(() => {
    if (!selectedRegion || !selectedDistrict) { setWards([]); return; }
    locationService.fetchWards(selectedRegion, selectedDistrict).then(setWards).catch(() => setWards([]));
    setSelectedWard('');
    setPickupStation(null);
  }, [selectedDistrict, selectedRegion]);

  /* ── ward → pickup stations ── */
  useEffect(() => {
    if (!selectedRegion || !selectedDistrict || !selectedWard) {
      setAvailableStations([]);
      setPickupStation(null);
      return;
    }
    locationService.fetchPickupStations(selectedRegion, selectedDistrict, selectedWard)
      .then((stations) => {
        setAvailableStations(stations);
        if (stations.length > 0) setPickupStation(stations[0]);
      })
      .catch(() => setAvailableStations([]));
  }, [selectedWard, selectedDistrict, selectedRegion]);

  const handleNext = () => {
    if (step === 1) {
      if (!savedAddress || !fullName || !mobileNumber || !streetAddress || !selectedRegion || !selectedDistrict || !selectedWard) {
        setError('Please add and save a complete shipping address');
        return;
      }
      setError('');
      setStep(2);
      return;
    }
  };

  const handleBack = () => {
    if (step === 2 && paymentFlowStep !== 'select') {
      setPaymentFlowStep('select');
      setProviderResponse('idle');
      setPaymentPhoneError('');
      return;
    }
    setStep(s => Math.max(s - 1, 1));
    setError('');
    setPaymentFlowStep('select');
  };

  const handleStartPaymentFlow = () => {
    if (!paymentMethod) { setError('Please select a payment method'); return; }
    setError('');
    if (isMobileMoney) {
      if (mpesaPhone.trim()) {
        const v = validateProviderPhone(paymentMethod, mpesaPhone);
        if (v.valid) {
          setPaymentFlowStep('confirm');
        } else {
          setPaymentPhoneError(v.message);
          setPaymentFlowStep('request');
        }
      } else {
        setPaymentFlowStep('request');
      }
    } else {
      // Card / COD — skip to order creation
      handlePlaceOrder();
    }
  };

  const handleSaveAddress = () => {
    if (!fullName.trim()) { setError('Full name is required'); return; }
    if (!mobileNumber.trim()) { setError('Mobile number is required'); return; }
    if (!streetAddress.trim()) { setError('Street address is required'); return; }
    if (!selectedRegion || !selectedDistrict || !selectedWard) { setError('Please select Region, District and Ward'); return; }
    if (availableStations.length > 0 && !pickupStation) { setError('Please select a pickup station'); return; }
    setError('');
    setSavedAddress(true);
    setAddressDrawerOpen(false);
    toast({ type: 'success', title: 'Shipping address saved' });
  };

  const handleUseMyLocation = () => {
    if (!selectedRegion || !selectedDistrict || !selectedWard) {
      toast({ type: 'error', title: 'Please select Region, District and Ward first' });
      return;
    }
    const query = `${selectedWard}, ${selectedDistrict}, ${selectedRegion}, Tanzania`;
    openGoogleMapsPicker(undefined, undefined, query);
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const cartItems = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const deliveryAddress = {
        street: streetAddress,
        city: selectedWard,
        district: selectedDistrict,
        region: selectedRegion,
        pickup_station: pickupStation?.name || '',
      };

      const phoneNumber = isMobileMoney ? (mpesaPhone || mobileNumber) : mobileNumber;

      const payload: any = {
        items: cartItems,
        delivery_address: deliveryAddress,
        phone_number: phoneNumber,
        payment_method: paymentMethod,
      };

      if (isMobileMoney && pin) {
        payload.pin = pin;
      }

      const result = await orderService.createOrder(payload);

      if (result.requires_pin) {
        setShowPinModal(true);
        setLoading(false);
        return;
      }

      setOrderResult(result);
      triggerConfetti();
      setStep(3);
    } catch (err: any) {
      if (err.message?.includes('PIN is required')) {
        setShowPinModal(true);
      } else {
        setError(err.message || 'Order failed. Please try again.');
        setPaymentFlowStep('confirm');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPin = async () => {
    if (!pin || pin.length < 4) {
      setError('Please enter a valid PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const phoneNumber = mpesaPhone || mobileNumber;
      const result = await orderService.confirmPayment(orderResult?.order?.id || 0, {
        pin,
        phone_number: phoneNumber,
        payment_method: paymentMethod,
      });

      setOrderResult(result);
      setShowPinModal(false);
      triggerConfetti();
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Payment confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = async () => {
    setProviderResponse('idle');
    setPaymentFlowStep('processing');
    await handlePlaceOrder();
  };

  const triggerConfetti = () => {
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
  };

  if (step === 3) {
    const allProviders = [...mobileProviders, ...cardProviders];
    const selectedProvider = allProviders.find(p => p.id === paymentMethod);
    const estimatedDelivery = shippingProviders.find(p => p.id === shippingMethod)?.days || '3-5';
    const orderStatus = 'confirmed'; // Can be: confirmed, payment_received, processing, packed, shipped, out_for_delivery, delivered

    const timelineSteps = [
      { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, completed: true },
      { id: 'payment_received', label: 'Payment Received', icon: ShieldCheck, completed: true },
      { id: 'processing', label: 'Processing', icon: Package, completed: false },
      { id: 'packed', label: 'Packed', icon: Box, completed: false },
      { id: 'shipped', label: 'Shipped', icon: Truck, completed: false },
      { id: 'out_for_delivery', label: 'Out for Delivery', icon: Navigation, completed: false },
      { id: 'delivered', label: 'Delivered', icon: Home, completed: false },
    ];

    const statusIndex = timelineSteps.findIndex(s => s.id === orderStatus);

    return (
      <div className="bg-[var(--color-bg-page)] min-h-[calc(100vh-72px)] py-8 lg:py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-accent)]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          {/* PROGRESS BAR */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center gap-4 w-full max-w-md">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[16px] transition-all shadow-sm border-2 bg-[var(--color-primary)] text-white border-[var(--color-primary)]">1</div>
                <span className="text-[13px] font-bold text-[var(--color-primary)]">Checkout</span>
              </div>
              <div className="h-[3px] flex-1 rounded-full transition-all bg-[var(--color-primary)]" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[16px] transition-all shadow-sm border-2 bg-[var(--color-primary)] text-white border-[var(--color-primary)]">2</div>
                <span className="text-[13px] font-bold text-[var(--color-primary)]">Payment Method</span>
              </div>
              <div className="h-[3px] flex-1 rounded-full transition-all bg-[var(--color-primary)]" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[16px] transition-all shadow-sm border-2 bg-[var(--color-primary)] text-white border-[var(--color-primary)]">3</div>
                <span className="text-[13px] font-bold text-[var(--color-primary)]">Done</span>
              </div>
            </div>
          </div>

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
                  {timelineSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= statusIndex;
                    const isCurrent = index === statusIndex;
                    return (
                      <div key={step.id} className="flex items-start gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all',
                          isCompleted ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-page)] text-[var(--color-text-muted)] border-2 border-[var(--color-border)]'
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className={cn('text-[15px] font-bold', isCompleted ? 'text-[var(--color-text-heading)]' : 'text-[var(--color-text-muted)]')}>
                            {step.label}
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
                        <ImageWithFallback src={item.product?.images?.[0]?.image_path || ''} alt={item.product?.name || 'Item'} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-[var(--color-text-heading)] truncate">{item.product?.name || 'Product'}</p>
                        <p className="text-[12px] text-[var(--color-text-muted)]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[13px] font-bold text-[var(--color-text-heading)]">{formatCurrency((item.product?.price || 0) * item.quantity)}</p>
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
          <div className="flex items-center gap-4 w-full max-w-lg">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[16px] transition-all shadow-sm border-2 ${step >= 1 ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)]'}`}>1</div>
              <span className={`text-[13px] font-bold ${step >= 1 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>Checkout</span>
            </div>
            <div className={`h-[3px] flex-1 rounded-full transition-all ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[16px] transition-all shadow-sm border-2 ${step >= 2 ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)]'}`}>2</div>
              <span className={`text-[13px] font-bold ${step >= 2 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>Payment Method</span>
            </div>
            <div className={`h-[3px] flex-1 rounded-full transition-all ${step >= 3 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[16px] transition-all shadow-sm border-2 ${step >= 3 ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)]'}`}>3</div>
              <span className={`text-[13px] font-bold ${step >= 3 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>Done</span>
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
                      <h2 className="text-[20px] font-bold text-[var(--color-text-heading)] tracking-tight">Order Summary</h2>
                      <p className="text-[14px] text-[var(--color-text-muted)]">Review your items before confirming</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-4 bg-[var(--color-bg-page)] rounded-[16px] p-4 border border-[var(--color-border)]/50">
                        <div className="w-16 h-16 rounded-[12px] overflow-hidden bg-white shrink-0 border border-[var(--color-border)]">
                          <ImageWithFallback src={item.product?.images?.[0]?.image_path || ''} alt={item.product?.name || 'Product'} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[14px] text-[var(--color-text-heading)] truncate">{item.product?.name || 'Product'}</h3>
                          <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                            {item.variant_id ? `Variant: #${item.variant_id}` : 'Default'} · Qty: {item.quantity}
                          </p>
                          <p className="text-[14px] font-bold text-[var(--color-accent)] mt-1">{formatCurrency((item.product?.price || 0) * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Estimate */}
                  <div className="bg-blue-50 border border-blue-100 rounded-[12px] p-4 flex items-start gap-3">
                    <Truck className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-[13px] text-[var(--color-primary-darker)]">Delivery Estimate</h4>
                      <p className="text-[12px] text-[var(--color-primary)]/80 mt-0.5">
                        {shippingProviders.find(p => p.id === shippingMethod)?.days || '1-2 Days'} via {shippingProviders.find(p => p.id === shippingMethod)?.name || 'Standard'}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
                    <div className="flex justify-between text-[14px] font-medium text-[var(--color-text-muted)]">
                      <span>Subtotal</span>
                      <span className="text-[var(--color-text-heading)]">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[14px] font-medium text-[var(--color-text-muted)]">
                      <span>Shipping Fee</span>
                      <span className="text-[var(--color-text-heading)]">{shippingCost > 0 ? formatCurrency(shippingCost) : 'Free'}</span>
                    </div>
                    <div className="flex justify-between text-[16px] font-bold text-[var(--color-text-heading)] pt-3 border-t border-[var(--color-border)]">
                      <span>Total Amount</span>
                      <span className="text-[var(--color-accent)]">{formatCurrency(total)}</span>
                    </div>
                  </div>

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
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-6 border-b border-[var(--color-border)]">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-accent-bg)] flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <div>
                      <h2 className="text-[20px] font-bold text-[var(--color-text-heading)] tracking-tight">
                        {paymentFlowStep === 'select' ? 'Payment Method' : paymentFlowStep === 'request' ? 'Request Payment' : paymentFlowStep === 'confirm' ? 'Confirm Payment' : 'Processing Payment'}
                      </h2>
                      <p className="text-[14px] text-[var(--color-text-muted)]">
                        {paymentFlowStep === 'select' ? 'All transactions are secure and encrypted.' : paymentFlowStep === 'request' ? 'Enter your mobile number to continue.' : paymentFlowStep === 'confirm' ? 'Follow the instructions on your phone.' : 'Please wait while we process your payment.'}
                      </p>
                    </div>
                  </div>

                  {/* ── SELECT: Payment Categories ── */}
                  {paymentFlowStep === 'select' && (
                    <>
                      {/* Selected Method Summary */}
                      {paymentMethod && (() => {
                        const all = [...mobileProviders, ...cardProviders];
                        const selected = all.find(p => p.id === paymentMethod);
                        if (!selected) return null;
                        return (
                          <div className="flex items-center gap-4 bg-[var(--color-bg-page)] rounded-[16px] p-4 border border-[var(--color-border)]/50">
                            <div className="w-12 h-12 rounded-[10px] overflow-hidden bg-white shrink-0 border border-[var(--color-border)] flex items-center justify-center">
                              {'logo' in selected && selected.logo ? (
                                <img src={selected.logo} alt={selected.name} className="w-full h-full object-contain p-1" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-[14px]" style={{ backgroundColor: selected.color }}>
                                  {selected.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-[14px] font-bold text-[var(--color-text-heading)]">{selected.name}</p>
                              <p className="text-[12px] text-[var(--color-text-muted)]">
                                {mobileProviders.some(p => p.id === paymentMethod) ? 'Mobile Payment' : 'Card / Bank Payment'}
                              </p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-[var(--color-primary)]" />
                          </div>
                        );
                      })()}

                      {/* Payment Categories */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => { setPaymentDrawerCategory('mobile'); setPaymentDrawerOpen(true); }}
                          className="flex flex-col items-center gap-3 p-6 rounded-[16px] border-2 border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:shadow-sm transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center">
                            <Phone className="w-7 h-7 text-[var(--color-primary)]" />
                          </div>
                          <div className="text-center">
                            <p className="text-[15px] font-bold text-[var(--color-text-heading)]">Mobile Payment</p>
                            <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">M-Pesa, Airtel, Tigo, HaloPesa</p>
                          </div>
                        </button>
                        <button
                          onClick={() => { setPaymentDrawerCategory('card'); setPaymentDrawerOpen(true); }}
                          className="flex flex-col items-center gap-3 p-6 rounded-[16px] border-2 border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:shadow-sm transition-all text-left"
                        >
                          <div className="w-14 h-14 rounded-full bg-[var(--color-accent-bg)] flex items-center justify-center">
                            <CreditCard className="w-7 h-7 text-[var(--color-accent)]" />
                          </div>
                          <div className="text-center">
                            <p className="text-[15px] font-bold text-[var(--color-text-heading)]">Card / Bank Payment</p>
                            <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">Visa, Mastercard, CRDB, NMB</p>
                          </div>
                        </button>
                      </div>

                      {error && <div className="text-red-500 text-[14px] font-medium bg-red-50 rounded-[8px] p-3">{error}</div>}

                      {/* Desktop Pay button */}
                      <div className="hidden sm:flex items-center justify-between gap-4 pt-6 border-t border-[var(--color-border)]">
                        <Button onClick={handleBack} variant="ghost" className="text-[var(--color-text-muted)] font-bold px-0 hover:bg-transparent hover:text-[var(--color-text-heading)]">
                          <ChevronLeft className="w-5 h-5 mr-1" /> Back
                        </Button>
                        <Button onClick={handleStartPaymentFlow} disabled={loading} variant="primary" size="xl" className="px-12 shadow-[var(--shadow-level-2)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]">
                          Pay {formatCurrency(total)}
                        </Button>
                      </div>
                    </>
                  )}

                  {/* ── REQUEST: Phone Number Entry ── */}
                  {paymentFlowStep === 'request' && (
                    <>
                      <div className="space-y-6">
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">
                            Enter your {(() => {
                              const p = mobileProviders.find(m => m.id === paymentMethod);
                              return p ? p.name : 'mobile money';
                            })()} number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                            <Input
                              type="tel"
                              value={mpesaPhone}
                              onChange={e => {
                                setMpesaPhone(e.target.value);
                                if (e.target.value) {
                                  const v = validateProviderPhone(paymentMethod, e.target.value);
                                  setPaymentPhoneError(v.valid ? '' : v.message);
                                } else {
                                  setPaymentPhoneError('');
                                }
                              }}
                              placeholder="07XX XXX XXX"
                              className={cn("pl-10", paymentPhoneError && "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]")}
                            />
                          </div>
                          {paymentPhoneError && (
                            <p className="text-[12px] text-[var(--color-error)] ml-1">{paymentPhoneError}</p>
                          )}
                        </div>

                        {/* Tips */}
                        <div className="bg-amber-50 border border-amber-100 rounded-[12px] p-4">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-bold text-[13px] text-amber-800">Tips</h4>
                              <p className="text-[12px] text-amber-700 mt-1">
                                Please make sure your account balance is greater than the payment amount. Otherwise, the payment request will fail.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {error && <div className="text-red-500 text-[14px] font-medium bg-red-50 rounded-[8px] p-3">{error}</div>}

                      {/* Desktop Continue button */}
                      <div className="hidden sm:flex items-center justify-between gap-4 pt-6 border-t border-[var(--color-border)]">
                        <Button onClick={handleBack} variant="ghost" className="text-[var(--color-text-muted)] font-bold px-0 hover:bg-transparent hover:text-[var(--color-text-heading)]">
                          <ChevronLeft className="w-5 h-5 mr-1" /> Back
                        </Button>
                        <Button
                          onClick={() => {
                            const v = validateProviderPhone(paymentMethod, mpesaPhone);
                            if (!v.valid) { setPaymentPhoneError(v.message); return; }
                            setPaymentPhoneError('');
                            setPaymentFlowStep('confirm');
                          }}
                          variant="primary"
                          size="xl"
                          className="px-12 shadow-[var(--shadow-level-2)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]"
                        >
                          Continue to Payment
                        </Button>
                      </div>
                    </>
                  )}

                  {/* ── CONFIRM: STK Push Instructions ── */}
                  {paymentFlowStep === 'confirm' && (
                    <>
                      <div className="bg-blue-50 border border-blue-100 rounded-[16px] p-6 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                          <Phone className="w-8 h-8 text-[var(--color-primary)]" />
                        </div>
                        <p className="text-[14px] text-[var(--color-text-heading)] leading-relaxed">
                          Click the <span className="font-bold">Complete Payment</span> button below to receive a payment confirmation prompt on your phone. Follow the instructions on your mobile device and enter your PIN to authorize the transaction. Thank you.
                        </p>
                        <div className="bg-white rounded-[12px] p-3 border border-blue-100 inline-flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[var(--color-primary)]" />
                          <span className="text-[13px] font-bold text-[var(--color-text-heading)]">{mpesaPhone}</span>
                        </div>
                      </div>

                      {error && <div className="text-red-500 text-[14px] font-medium bg-red-50 rounded-[8px] p-3">{error}</div>}

                      {/* Desktop Complete Payment */}
                      <div className="hidden sm:flex items-center justify-between gap-4 pt-6 border-t border-[var(--color-border)]">
                        <Button onClick={handleBack} variant="ghost" className="text-[var(--color-text-muted)] font-bold px-0 hover:bg-transparent hover:text-[var(--color-text-heading)]">
                          <ChevronLeft className="w-5 h-5 mr-1" /> Back
                        </Button>
                        <Button
                          onClick={handleCompletePayment}
                          disabled={loading}
                          variant="primary"
                          size="xl"
                          className="px-12 shadow-[var(--shadow-level-2)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'COMPLETE PAYMENT'}
                        </Button>
                      </div>
                    </>
                  )}

                  {/* ── PROCESSING ── */}
                  {paymentFlowStep === 'processing' && (
                    <div className="py-12 flex flex-col items-center text-center space-y-4">
                      <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin" />
                      <p className="text-[16px] font-bold text-[var(--color-text-heading)]">Processing your payment...</p>
                      <p className="text-[13px] text-[var(--color-text-muted)] max-w-sm">
                        Please wait while we send a payment request to your {(() => { const p = mobileProviders.find(m => m.id === paymentMethod); return p ? p.name : 'provider'; })()}.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

            {/* PIN Confirmation Modal */}
            {showPinModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-[24px] p-6 sm:p-8 max-w-md w-full shadow-[var(--shadow-level-3)]"
                >
                  <h3 className="text-[20px] font-bold text-[var(--color-text-heading)] mb-2">Confirm Payment</h3>
                  <p className="text-[14px] text-[var(--color-text-muted)] mb-6">
                    Please enter your mobile money PIN to authorize the payment of {formatCurrency(total)}.
                  </p>

                  <div className="space-y-4">
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={pin}
                      onChange={e => setPin(e.target.value)}
                      placeholder="Enter PIN"
                      className="font-mono text-[18px] text-center tracking-[0.3em]"
                      autoFocus
                    />
                    {error && <div className="text-red-500 text-[14px] font-medium">{error}</div>}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button onClick={() => setShowPinModal(false)} variant="secondary" className="flex-1 bg-[var(--color-bg-page)]">
                      Cancel
                    </Button>
                    <Button onClick={handleConfirmPin} disabled={loading || pin.length < 4} variant="primary" className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ─── Address Drawer ─── */}
            <Drawer open={addressDrawerOpen} onOpenChange={setAddressDrawerOpen}>
              <DrawerContent className="bg-white max-h-[92vh]">
                <DrawerHeader className="border-b border-[var(--color-border)] pb-4 relative">
                  <button
                    onClick={() => setAddressDrawerOpen(false)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--color-bg-page)] flex items-center justify-center hover:bg-[var(--color-bg-card)] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-[var(--color-text-heading)]" />
                  </button>
                  <DrawerTitle className="text-center text-[18px] text-[var(--color-text-heading)]">
                    {locView !== 'none' ? 'Where To Ship Your Product' : 'Shipping Address'}
                  </DrawerTitle>
                  <DrawerDescription className="text-center text-[13px] text-[var(--color-text-muted)]">
                    {locView !== 'none' ? 'Select your location below' : 'Enter your delivery details'}
                  </DrawerDescription>
                </DrawerHeader>

                <div className="overflow-y-auto p-4 space-y-5">
                  {/* Location Selector View */}
                  {locView !== 'none' && (
                    <div className="space-y-3">
                      {locView === 'region' && (
                        <>
                          <p className="text-[13px] font-bold text-[var(--color-text-heading)] mb-2">1. Select Region</p>
                          <div className="grid grid-cols-2 gap-2">
                            {regions.map((r) => (
                              <button
                                key={r}
                                onClick={() => { setSelectedRegion(r); setLocView('district'); }}
                                className={cn(
                                  'p-3 rounded-[12px] border-2 text-[13px] font-semibold transition-all text-left',
                                  selectedRegion === r
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                                    : 'border-[var(--color-border)] bg-white text-[var(--color-text-heading)] hover:border-[var(--color-primary)]'
                                )}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                      {locView === 'district' && (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <button onClick={() => setLocView('region')} className="text-[13px] text-[var(--color-primary)] font-bold">← Back</button>
                            <span className="text-[13px] text-[var(--color-text-muted)]">Region: {selectedRegion}</span>
                          </div>
                          <p className="text-[13px] font-bold text-[var(--color-text-heading)] mb-2">2. Select District</p>
                          <div className="grid grid-cols-2 gap-2">
                            {districts.map((d) => (
                              <button
                                key={d}
                                onClick={() => { setSelectedDistrict(d); setLocView('ward'); }}
                                className={cn(
                                  'p-3 rounded-[12px] border-2 text-[13px] font-semibold transition-all text-left',
                                  selectedDistrict === d
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                                    : 'border-[var(--color-border)] bg-white text-[var(--color-text-heading)] hover:border-[var(--color-primary)]'
                                )}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                      {locView === 'ward' && (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <button onClick={() => setLocView('district')} className="text-[13px] text-[var(--color-primary)] font-bold">← Back</button>
                            <span className="text-[13px] text-[var(--color-text-muted)]">{selectedRegion} › {selectedDistrict}</span>
                          </div>
                          <p className="text-[13px] font-bold text-[var(--color-text-heading)] mb-2">3. Select Ward</p>
                          <div className="grid grid-cols-2 gap-2">
                            {wards.map((w) => (
                              <button
                                key={w}
                                onClick={() => { setSelectedWard(w); setLocView('none'); }}
                                className={cn(
                                  'p-3 rounded-[12px] border-2 text-[13px] font-semibold transition-all text-left',
                                  selectedWard === w
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                                    : 'border-[var(--color-border)] bg-white text-[var(--color-text-heading)] hover:border-[var(--color-primary)]'
                                )}
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Address Form */}
                  {locView === 'none' && (
                    <>
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Full Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                          <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" className="pl-10" />
                        </div>
                      </div>

                      {/* Mobile Number */}
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Mobile Number <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                          <Input type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder="+255 7XX XXX XXX" className="pl-10" />
                        </div>
                      </div>

                      {/* Alternative Mobile */}
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Alternative Mobile Number <span className="text-[var(--color-text-muted)] font-normal">(Optional)</span></label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                          <Input type="tel" value={altMobileNumber} onChange={e => setAltMobileNumber(e.target.value)} placeholder="+255 7XX XXX XXX" className="pl-10" />
                        </div>
                      </div>

                      {/* Street Address */}
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Street Address <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                          <Input value={streetAddress} onChange={e => setStreetAddress(e.target.value)} placeholder="Building, Floor, Apartment number" className="pl-10" />
                        </div>
                      </div>

                      {/* Smart Location Input */}
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1">Region / District / Ward <span className="text-red-500">*</span></label>
                        <button
                          onClick={() => setLocView('region')}
                          className={cn(
                            'w-full flex items-center justify-between p-3 rounded-[8px] border-2 text-left transition-all',
                            selectedRegion && selectedDistrict && selectedWard
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                              : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
                            <span className="text-[14px] text-[var(--color-text-heading)]">
                              {selectedRegion && selectedDistrict && selectedWard
                                ? `${selectedWard}, ${selectedDistrict}, ${selectedRegion}`
                                : 'Tap to select location'}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                        </button>
                      </div>

                      {/* Pickup Station */}
                      {selectedWard && (
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold text-[var(--color-text-heading)] ml-1 flex items-center gap-1">
                            <Navigation className="w-3.5 h-3.5" />
                            Select Your Pickup Station
                          </label>
                          {availableStations.length > 0 ? (
                            <div className="space-y-2">
                              {availableStations.map((station) => (
                                <button
                                  key={station.id}
                                  onClick={() => setPickupStation(station)}
                                  className={cn(
                                    'w-full flex items-center gap-3 p-3 rounded-[12px] border-2 text-left transition-all',
                                    pickupStation?.id === station.id
                                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                                      : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]'
                                  )}
                                >
                                  <div className={cn(
                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                                    pickupStation?.id === station.id ? 'border-[var(--color-primary)]' : 'border-[var(--color-text-muted)]'
                                  )}>
                                    {pickupStation?.id === station.id && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                                  </div>
                                  <div>
                                    <p className="text-[13px] font-bold text-[var(--color-text-heading)]">{station.name}</p>
                                    <p className="text-[11px] text-[var(--color-text-muted)]">{station.ward}, {station.district}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[12px] text-[var(--color-text-muted)] bg-[var(--color-bg-page)] rounded-[8px] p-3">No pickup stations available for this area. The nearest station will be assigned automatically.</p>
                          )}
                        </div>
                      )}

                      {/* Preview on Map (Optional) */}
                      <div className="space-y-1">
                        <button
                          onClick={handleUseMyLocation}
                          disabled={!selectedRegion || !selectedDistrict || !selectedWard}
                          className={cn(
                            "w-full flex items-center justify-center gap-2 p-3 rounded-[12px] border-2 transition-all bg-white",
                            selectedRegion && selectedDistrict && selectedWard
                              ? "border-[var(--color-border)] text-[var(--color-text-heading)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                              : "border-[var(--color-border)] text-[var(--color-text-muted)] opacity-60 cursor-not-allowed"
                          )}
                        >
                          <MapPinned className="w-4 h-4" />
                          <span className="text-[13px] font-semibold">Preview on Map</span>
                        </button>
                        <p className="text-[11px] text-[var(--color-text-muted)] text-center">Optional — verify where your order will be shipped</p>
                      </div>

                      {/* Default Address Toggle */}
                      <div className="flex items-center justify-between bg-[var(--color-bg-page)] rounded-[12px] p-4">
                        <span className="text-[13px] font-semibold text-[var(--color-text-heading)]">Set as Default Shipping Address</span>
                        <Switch checked={isDefaultAddress} onCheckedChange={setIsDefaultAddress} />
                      </div>

                      {error && <div className="text-red-500 text-[14px] font-medium bg-red-50 rounded-[8px] p-3">{error}</div>}
                    </>
                  )}
                </div>

                {/* Footer */}
                {locView === 'none' && (
                  <DrawerFooter className="border-t border-[var(--color-border)] p-4">
                    <Button
                      variant="primary"
                      size="xl"
                      className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)]"
                      onClick={handleSaveAddress}
                    >
                      Save Address
                    </Button>
                  </DrawerFooter>
                )}
              </DrawerContent>
            </Drawer>

            {/* ─── Payment Method Drawer ─── */}
            <Drawer open={paymentDrawerOpen} onOpenChange={setPaymentDrawerOpen}>
              <DrawerContent className="bg-white max-h-[92vh]">
                <DrawerHeader className="border-b border-[var(--color-border)] pb-4 relative">
                  <button
                    onClick={() => setPaymentDrawerOpen(false)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--color-bg-page)] flex items-center justify-center hover:bg-[var(--color-bg-card)] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-[var(--color-text-heading)]" />
                  </button>
                  <DrawerTitle className="text-center text-[18px] text-[var(--color-text-heading)]">
                    {paymentDrawerCategory === 'mobile' ? 'Mobile Payment' : 'Card / Bank Payment'}
                  </DrawerTitle>
                  <DrawerDescription className="text-center text-[13px] text-[var(--color-text-muted)]">
                    Select your preferred provider
                  </DrawerDescription>
                </DrawerHeader>

                <div className="overflow-y-auto p-4 space-y-3">
                  {paymentDrawerCategory === 'mobile' && (
                    <>
                      {mobileProviders.map((provider) => (
                        <button
                          key={provider.id}
                          onClick={() => {
                            setPaymentMethod(provider.id);
                            setMpesaPhone('');
                            setPin('');
                            setPaymentDrawerOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-4 p-4 rounded-[16px] border-2 text-left transition-all',
                            paymentMethod === provider.id
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                              : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]'
                          )}
                        >
                          <div className="w-12 h-12 rounded-[10px] overflow-hidden bg-white shrink-0 border border-[var(--color-border)] flex items-center justify-center">
                            <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain p-1.5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[14px] font-bold text-[var(--color-text-heading)]">{provider.name}</p>
                          </div>
                          <div className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                            paymentMethod === provider.id ? 'border-[var(--color-primary)]' : 'border-[var(--color-text-muted)]'
                          )}>
                            {paymentMethod === provider.id && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {paymentDrawerCategory === 'card' && (
                    <>
                      {cardProviders.map((provider) => (
                        <button
                          key={provider.id}
                          onClick={() => {
                            setPaymentMethod(provider.id);
                            setMpesaPhone('');
                            setPin('');
                            setPaymentDrawerOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-4 p-4 rounded-[16px] border-2 text-left transition-all',
                            paymentMethod === provider.id
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)]'
                              : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]'
                          )}
                        >
                          <div className="w-12 h-12 rounded-[10px] overflow-hidden bg-white shrink-0 border border-[var(--color-border)] flex items-center justify-center">
                            {'logo' in provider && provider.logo ? (
                              <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center font-bold text-[13px]"
                                style={{
                                  backgroundColor: provider.color,
                                  color: 'textColor' in provider ? provider.textColor : '#fff',
                                }}
                              >
                                {provider.id === 'visa' ? 'VISA' : provider.id === 'mastercard' ? 'MC' : 'CARD'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-[14px] font-bold text-[var(--color-text-heading)]">{provider.name}</p>
                          </div>
                          <div className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                            paymentMethod === provider.id ? 'border-[var(--color-primary)]' : 'border-[var(--color-text-muted)]'
                          )}>
                            {paymentMethod === provider.id && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
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

      {/* Mobile Fixed Bottom Bar */}
      {step === 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] p-4 flex items-center gap-4 z-40 sm:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex-1">
            <p className="text-[11px] text-[var(--color-text-muted)]">Total Amount</p>
            <p className="text-[18px] font-bold text-[var(--color-accent)]">{formatCurrency(total)}</p>
          </div>
          <Button
            variant="primary"
            size="xl"
            className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)]"
            onClick={handleNext}
          >
            CONFIRM ORDER <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      )}
      {step === 2 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] p-4 flex items-center gap-4 z-40 sm:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex-1">
            <p className="text-[11px] text-[var(--color-text-muted)]">Pay Amount</p>
            <p className="text-[18px] font-bold text-[var(--color-accent)]">{formatCurrency(total)}</p>
          </div>
          {paymentFlowStep === 'select' && (
            <Button
              variant="primary" size="xl"
              className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)]"
              disabled={loading}
              onClick={handleStartPaymentFlow}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>PAY <ChevronRight className="w-5 h-5 ml-1" /></>}
            </Button>
          )}
          {paymentFlowStep === 'request' && (
            <Button
              variant="primary" size="xl"
              className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)]"
              onClick={() => {
                const v = validateProviderPhone(paymentMethod, mpesaPhone);
                if (!v.valid) { setPaymentPhoneError(v.message); return; }
                setPaymentPhoneError('');
                setPaymentFlowStep('confirm');
              }}
            >
              Continue <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
          {paymentFlowStep === 'confirm' && (
            <Button
              variant="primary" size="xl"
              className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)]"
              disabled={loading}
              onClick={handleCompletePayment}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>COMPLETE PAYMENT <ChevronRight className="w-5 h-5 ml-1" /></>}
            </Button>
          )}
          {paymentFlowStep === 'processing' && (
            <Button variant="primary" size="xl" className="flex-1 bg-[var(--color-text-muted)]" disabled>
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
