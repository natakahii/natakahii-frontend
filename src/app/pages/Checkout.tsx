   import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useCart } from '../providers/CartProvider';
import { orderService, type CargoShippingDetails } from '../services/orderService';
import { pollPaymentStatus, paymentService } from '../services/paymentService';
import { locationService, type PickupStation } from '../services/locationService';
import { formatCurrency } from '../utils/currency';
import { calculateCargoQuote, getServiceDays } from '../utils/cargoPricing';

// Components
import { CheckoutProgress } from './checkout/components/CheckoutProgress';
import { DeliveryStep } from './checkout/components/DeliveryStep';
import { PaymentStep } from './checkout/components/PaymentStep';
import { SuccessStep } from './checkout/components/SuccessStep';
import { AddressDialog } from './checkout/components/AddressDialog';
import { PaymentMethodDialog } from './checkout/components/PaymentMethodDialog';
import { CargoStep } from './checkout/components/CargoStep';

// Payment provider logos
import mpesaLogo from '../../assets/mpesa.png';
import airtelMoneyLogo from '../../assets/airtelmoney.png';
import halopesaLogo from '../../assets/halopesa.png';
import mixxbyyasLogo from '../../assets/mixxbyyas.png';

interface PaymentProvider {
  id: string;
  name: string;
  color: string;
  logo?: string;
  textColor?: string;
}

const mobileProviders: PaymentProvider[] = [
  { id: 'mpesa', name: 'M-Pesa', logo: mpesaLogo, color: '#4CAF50' },
  { id: 'airtel_money', name: 'Airtel Money', logo: airtelMoneyLogo, color: '#E40000' },
  { id: 'halopesa', name: 'HaloPesa', logo: halopesaLogo, color: '#FF6B00' },
  { id: 'mixx_by_yas', name: 'Mixx by Yas', logo: mixxbyyasLogo, color: '#E91E63' },
];

   const cardProviders: PaymentProvider[] = [
     { id: 'card', name: 'Credit / Debit Card', color: '#1A1F71', textColor: '#fff' },
   ];

   // Calculate cargo shipping cost from backend quote
   const cargoShippingCost = useMemo(() => {
     if (shippingMethod !== 'natakahii_cargo' || !quote) return 0;
     return quote.estimate || 0;
   }, [shippingMethod, quote]);

const shippingProviders = [
  { id: 'fargo', name: 'Fargo Courier', level: 'Express', days: '1-2 Days', price: 450 },
  { id: 'sendy', name: 'Sendy', level: 'Same Day', days: 'Today', price: 800 },
  { id: 'natakahii_cargo', name: 'NatakaHii Cargo', level: 'Inter-city', days: '2-4 Days', price: 5000 }
];

function formatPaymentFailureError(statusResult: { status: string; error_message?: string }): string {
  const baseMessages: Record<string, string> = {
    failed: 'Payment failed',
    expired: 'Payment expired',
    cancelled: 'Payment was cancelled',
  };

  const base = baseMessages[statusResult.status] || `Payment ${statusResult.status}`;
  const detail = statusResult.error_message ? `: ${statusResult.error_message}` : '';

   return `${base}${detail}. You can retry below.`;
 }

 export function Checkout() {
   const [step, setStep] = useState(1);
   const [shippingMethod, setShippingMethod] = useState('natakahii_cargo');
   const [paymentMethod, setPaymentMethod] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [orderResult, setOrderResult] = useState<any>(null);
   const [quote, setQuote] = useState<any>(null);
   const pollingAborted = useRef(false);
   const navigate = useNavigate();
   const { items } = useCart();
   const [searchParams] = useSearchParams();

  // Load hubs from cargo backend
  useEffect(() => {
    const fetchHubs = async () => {
      try {
        const res = await fetch('http://localhost:8001/api/hubs');
        const data = await res.json();
        setHubs(data);
      } catch (err) {
        console.error('Failed to fetch hubs', err);
      }
    };
    fetchHubs();
  }, []);

  /* ── Step 1: Address ── */
  const [addressDrawerOpen, setAddressDrawerOpen] = useState(false);
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

  /* ── Step 1.5: Cargo Selection ── */
  const [cargoStepOpen, setCargoStepOpen] = useState(false);
  const [pickupHub, setPickupHub] = useState<string>('');
  const [deliveryHub, setDeliveryHub] = useState<string>('');
  const [cargoServiceLevel, setCargoServiceLevel] = useState<'standard' | 'express' | 'same_day'>('standard');
  const [cargoWeight, setCargoWeight] = useState<number>(1);
  const [hubs, setHubs] = useState<{id: number; name: string; code: string}[]>([]);

  /* ── Step 2: Payment ── */
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [paymentDrawerCategory, setPaymentDrawerCategory] = useState<'mobile' | 'card' | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [paymentFlowStep, setPaymentFlowStep] = useState<'select' | 'request' | 'confirm' | 'processing' | 'awaiting' | 'redirecting' | 'hosted_redirect' | 'qr'>('select');
  const [paymentPhoneError, setPaymentPhoneError] = useState('');
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Abort any active polling when the component unmounts
  useEffect(() => {
    return () => {
      pollingAborted.current = true;
    };
  }, []);

  /* ── handle cargo step transitions ── */
  const handleCargoNext = async () => {
    if (!pickupHub || !deliveryHub) {
      setError('Please select both pickup and delivery hubs');
      return;
    }
    
    await handleCargoPlaceOrder();
    if (!error) {
      setCargoStepOpen(false);
      setStep(3); // Go directly to success step
    }
  };

  const handleCargoBack = () => {
    if (step === 1) {
      navigate(-1);
    } else {
      setCargoStepOpen(true);
      setStep(1);
    }
  };

  /* ── detect returning user after card payment or hosted checkout redirect ── */
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const pendingOrderId = localStorage.getItem('natakahii_pending_order_id');
    const sessionRef = localStorage.getItem('natakahii_session_reference');

    if (paymentStatus === 'cancelled') {
      localStorage.removeItem('natakahii_pending_order_id');
      localStorage.removeItem('natakahii_session_reference');
      setError('Payment was cancelled. You can retry below.');
      setPaymentFlowStep('confirm');
      navigate('/checkout', { replace: true });
      return;
    }

    if (pendingOrderId && step === 2) {
      localStorage.removeItem('natakahii_pending_order_id');
      setLoading(true);
      setPaymentFlowStep('processing');
      const checkStatus = async () => {
        try {
          if (sessionRef) {
            localStorage.removeItem('natakahii_session_reference');
            try { await paymentService.syncSession(sessionRef); } catch (syncErr) { /* ignore */ }
          }
          pollingAborted.current = false;
          const statusResult = await pollPaymentStatus(parseInt(pendingOrderId), 10, 2000);
          if (pollingAborted.current) return;
          if (statusResult.status === 'successful') {
            triggerConfetti();
            setStep(3);
          } else {
            setError(formatPaymentFailureError(statusResult));
            setPaymentFlowStep('confirm');
          }
        } catch (err: any) {
          setError(err.message || 'Could not verify payment status. Please check your order history.');
          setPaymentFlowStep('confirm');
        } finally {
          setLoading(false);
        }
      };
      checkStatus();
    }
  }, [step, searchParams, navigate]);

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

   const subtotal = items.reduce((sum, item) => {
     const price = item.product?.effective_price ?? item.product?.price ?? 0;
     return sum + price * item.quantity;
   }, 0);
   const platformFee = Math.round(subtotal * 0.02);
   const isCargoShipping = shippingMethod === 'natakahii_cargo';
   const total = isCargoShipping ? subtotal + platformFee + (quote?.estimate || 0) : subtotal + platformFee + (shippingProviders.find(p => p.id === shippingMethod)?.price || 0);

  const isMobileMoney = ['mpesa', 'airtel_money', 'halopesa', 'mixx_by_yas'].includes(paymentMethod);
  const isCardPayment = paymentMethod === 'card';

  function validateTanzaniaPhone(phone: string): { valid: boolean; message: string } {
    const digits = phone.replace(/\D/g, '');
    const normalized = digits.startsWith('255') ? digits.slice(3) : digits;
    
    if (!normalized) return { valid: false, message: 'Phone number is required' };
    
    if (normalized.length !== 9 && normalized.length !== 10) {
      return { valid: false, message: 'Phone number must be 10 digits (e.g. 07XX XXX XXX)' };
    }

    const prefix = normalized.startsWith('0') ? normalized.slice(1, 4) : normalized.slice(0, 3);
    
    // Comprehensive list of all valid Tanzanian mobile prefixes (3 digits)
    const allValidPrefixes = [
      // Vodacom
      '741','742','743','744','745','746','747','748','749','751','752','753','754','755','756','757','758','759','761','762','763','764','765','766','767','768','769','771','772','773','774','775','776','777','778','779','781','782','783','784','785','786','787','788','789','795', '713', '797', '792', '799',
      // Airtel
      '683','684','685','686','687','688','689', '690','691','692','693','694','695','696','697','698','699', '783','784','785','786','787','788','789',
                               
      // Halotel
      '620', '621', '622', '623', '624', '625', '626', '627', '628', '629', '640', '641', '642', '643', '644', '645', '646', '647', '648', '649',
      // Tigo / Zantel / Mixx
      '650', '651', '652', '653', '654', '655', '656', '657', '658', '659', '710', '711', '712', '713', '714', '715', '716', '717', '718', '719', '670', '671', '672', '673', '674', '675', '676', '677', '678', '679', '770', '771', '772', '773', '774', '775', '776', '777', '778', '779',
      // TTCL & Others
      '730', '731', '732', '733', '734', '735', '736', '737', '738', '739', '610', '611', '612', '613', '614', '615', '616', '617', '618', '619'
    ];

    if (!allValidPrefixes.includes(prefix)) {
      return { valid: false, message: 'Please enter a valid Tanzanian mobile number' };
    }

    return { valid: true, message: '' };
  }

  function validateProviderPhone(providerId: string, phone: string): { valid: boolean; message: string } {
    const digits = phone.replace(/\D/g, '');
    const normalized = digits.startsWith('255') ? digits.slice(3) : digits;
    if (!normalized) return { valid: false, message: 'Phone number is required' };
    if (normalized.length !== 9 && normalized.length !== 10) {
      return { valid: false, message: 'Phone number must be 10 digits (e.g. 07XX XXX XXX)' };
    }
    const prefix = normalized.startsWith('0') ? normalized.slice(1, 4) : normalized.slice(0, 3);
    const providerPrefixes: Record<string, string[]> = {
      mpesa: ['741','742','743','744','745','746','747','748','749','751','752','753','754','755','756','757','758','759','761','762','763','764','765','766','767','768','769','771','772','773','774','775','776','777','778','779','781','782','783','784','785','786','787','788','789','795', '713', '797', '792', '799'],
      airtel_prefixes: [
                        '683','684','685','686','687','688','689',
                        '690','691','692','693','694','695','696','697','698','699',
                        '783','784','785','786','787','788','789'
                     ],
      halopesa: ['620', '621', '622', '623', '624', '625', '626', '627', '628', '629', '640', '641', '642', '643', '644', '645', '646', '647', '648', '649'],
      mixx_by_yas: ['650', '651', '652', '653', '654', '655', '656', '657', '658', '659', '710', '711', '712', '713', '714', '715', '716', '717', '718', '719'],
    };
    const allowed = providerPrefixes[providerId];
    if (!allowed) return { valid: true, message: '' };
    const match = allowed.some((p) => prefix.startsWith(p));
    if (!match) {
      const providerNames: Record<string, string> = {
        mpesa: 'M-Pesa', airtel_money: 'Airtel Money',
        halopesa: 'HaloPesa', mixx_by_yas: 'Mixx by Yas',
      };
      return { valid: false, message: `This number does not appear to be a valid ${providerNames[providerId] || 'provider'} number.` };
    }
    return { valid: true, message: '' };
  }

  const handleNext = () => {
    if (step === 1) {
      if (shippingMethod === 'natakahii_cargo') {
        handleCargoNext();
      } else {
        if (!savedAddress || !fullName || !mobileNumber || !streetAddress || !selectedRegion || !selectedDistrict || !selectedWard) {
          setError('Please add and save a complete shipping address');
          return;
        }
        setError('');
        setStep(2);
      }
    }
  };

  const handleBack = () => {
    if (step === 1) {
      if (cargoStepOpen) {
        navigate(-1);
      }
      return;
    }
    if (step === 2) {
      if (shippingMethod === 'natakahii_cargo') {
        handleCargoBack();
        return;
      }
      if (paymentFlowStep !== 'select') {
        setPaymentFlowStep('select');
        setPaymentPhoneError('');
        return;
      }
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
        if (v.valid) { setPaymentFlowStep('confirm'); } 
        else { setPaymentPhoneError(v.message); setPaymentFlowStep('request'); }
      } else {
        setPaymentFlowStep('request');
      }
    } else {
      handlePlaceOrder();
    }
  };

  const handleSaveAddress = () => {
    if (!fullName.trim()) { setError('Full name is required'); return; }
    if (fullName.trim().length < 3) { setError('Please enter a valid full name'); return; }
    
    const phoneValid = validateTanzaniaPhone(mobileNumber);
    if (!phoneValid.valid) { setError(phoneValid.message); return; }

    if (altMobileNumber.trim()) {
      const altPhoneValid = validateTanzaniaPhone(altMobileNumber);
      if (!altPhoneValid.valid) { setError(`Alternative Phone: ${altPhoneValid.message}`); return; }
    }

    if (!streetAddress.trim()) { setError('Street address is required'); return; }
    if (streetAddress.trim().length < 5) { setError('Please provide a more detailed street address'); return; }
    
    if (!selectedRegion || !selectedDistrict || !selectedWard) { setError('Please select Region, District and Ward'); return; }
    if (!pickupStation) { setError('Please select a pickup station'); return; }
    
    setError('');
    setSavedAddress(true);
    setAddressDrawerOpen(false);
  };

  const handleUseMyLocation = () => {
    if (!selectedRegion || !selectedDistrict || !selectedWard) return;
    locationService.fetchNearestPickupStation(selectedRegion, selectedDistrict, selectedWard)
      .then((station) => {
        if (station) {
          setPickupStation(station);
        }
      })
      .catch(() => {
        setError('Could not find a nearby pickup station. Please select one manually.');
      });
  };

  const handleCargoPlaceOrder = async () => {
    if (items.length === 0) { setError('Your cart is empty'); return; }
    setError('');
    setLoading(true);

   try {
     // Calculate quote from cargo backend
     const pickupHubId = hubs.find(h => h.code === pickupHub)?.id || 1;
     const deliveryHubId = hubs.find(h => h.code === deliveryHub)?.id || 1;
     const shipmentQuote = await fetch(`http://localhost:8001/api/shipments/quote`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         origin_hub_id: pickupHubId,
         destination_hub_id: deliveryHubId,
         weight: cargoWeight,
         service_level: cargoServiceLevel
       })
     });
     
     const quoteData = await shipmentQuote.json();
     setQuote(quoteData);
     
     const cartItems = items.map(item => ({ product_id: item.product_id, quantity: item.quantity }));
     const customerName = fullName || 'Customer';
     const customerPhone = mobileNumber || '0700000000';

     const result = await orderService.createCargoOrder({
       items: cartItems,
       pickup_hub_code: pickupHub,
       delivery_hub_code: deliveryHub,
       service_level: cargoServiceLevel,
       weight_kg: cargoWeight,
       customer_name: customerName,
       customer_phone: customerPhone,
       customer_email: null,
       delivery_address: {
         street: streetAddress || '',
         city: selectedWard || '',
         district: selectedDistrict || '',
         region: selectedRegion || ''
       },
       special_instructions: null
     });

     setLoading(false);
     setError('');
     
     // Show order has been placed for cargo
     alert(`Order placed successfully!\nTracking: ${result.tracking_number}\nEstimated delivery: ${result.estimated_delivery}`);
     navigate('/tracking');
   } catch (err: any) {
     setError(err.message || 'Cargo order failed. Please try again.');
     setLoading(false);
   }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) { setError('Your cart is empty'); return; }
    setError('');
    setLoading(true);
    setPaymentFlowStep('processing');

    try {
      const cartItems = items.map(item => ({ product_id: item.product_id, quantity: item.quantity }));
      const deliveryAddress = { street: streetAddress, city: selectedWard, district: selectedDistrict, region: selectedRegion, pickup_station: pickupStation?.name || '' };
      const phoneNumber = isMobileMoney ? (mpesaPhone || mobileNumber) : mobileNumber;

      const result = await orderService.createOrder({
        items: cartItems,
        delivery_address: deliveryAddress,
        phone_number: phoneNumber,
        payment_method: paymentMethod,
      });

      setOrderResult(result);

      if (isMobileMoney) {
        setPaymentFlowStep('awaiting');
        setPaymentStatusMessage('A payment prompt has been sent to your phone. Please enter your PIN on your mobile device.');
        setLoading(false);
        pollingAborted.current = false;
        try {
          const orderId = result.order?.id;
          if (orderId) {
            const statusResult = await pollPaymentStatus(orderId, 60, 3000);
            if (pollingAborted.current) return;
            if (statusResult.status === 'successful') { triggerConfetti(); setStep(3); } 
            else { setError(formatPaymentFailureError(statusResult)); setPaymentFlowStep('confirm'); }
          }
        } catch (pollErr: any) {
          if (pollingAborted.current) return;
          setError(pollErr.message || 'Payment status check timed out. Please check your phone and try again.');
          setPaymentFlowStep('confirm');
        }
      } else if (isCardPayment) {
        const paymentUrl = result.payment?.payment_url;
        if (paymentUrl) {
          localStorage.setItem('natakahii_pending_order_id', result.order?.id?.toString() || '');
          setPaymentFlowStep('redirecting');
          setLoading(false);
          window.location.href = paymentUrl;
        } else {
          setError('Card payment URL not received from provider. Please try again.');
          setPaymentFlowStep('confirm');
          setLoading(false);
        }
      } else if (paymentMethod === 'dynamic_qr' || paymentMethod === 'qr') {
        const qrCode = result.payment?.payment_qr_code;
        if (qrCode) {
          setQrCodeUrl(qrCode);
          setPaymentFlowStep('qr');
          setLoading(false);
          try {
            pollingAborted.current = false;
            const orderId = result.order?.id;
            if (orderId) {
              const statusResult = await pollPaymentStatus(orderId, 60, 3000);
              if (pollingAborted.current) return;
              if (statusResult.status === 'successful') { triggerConfetti(); setStep(3); } 
              else { setError(formatPaymentFailureError(statusResult)); setPaymentFlowStep('confirm'); }
            }
          } catch (pollErr: any) {
            if (pollingAborted.current) return;
            setError(pollErr.message || 'Payment status check timed out. Please scan the QR code again.');
            setPaymentFlowStep('confirm');
          }
        } else {
          setError('QR code not received from provider. Please try again.');
          setPaymentFlowStep('confirm');
          setLoading(false);
        }
      } else {
        triggerConfetti();
        setStep(3);
      }
    } catch (err: any) {
      const backendError = err?.response?.data?.error || err?.response?.data?.message;
      setError(backendError || err.message || 'Order failed. Please try again.');
      setPaymentFlowStep('confirm');
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!orderResult?.order?.id) return;
    setError('');
    setLoading(true);
    setPaymentFlowStep('processing');
    try {
      const phoneNumber = mpesaPhone || mobileNumber;
      const result = await orderService.retryPayment(orderResult.order.id, {
        phone_number: phoneNumber,
        payment_method: paymentMethod,
      });
      setOrderResult(result);
      if (isMobileMoney) {
        setPaymentFlowStep('awaiting');
        setPaymentStatusMessage('A new payment prompt has been sent to your phone. Please enter your PIN on your mobile device.');
        setLoading(false);
        try {
          pollingAborted.current = false;
          const statusResult = await pollPaymentStatus(orderResult.order.id, 60, 3000);
          if (pollingAborted.current) return;
          if (statusResult.status === 'successful') { triggerConfetti(); setStep(3); } 
          else { setError(formatPaymentFailureError(statusResult)); setPaymentFlowStep('confirm'); }
        } catch (pollErr: any) {
          if (pollingAborted.current) return;
          setError(pollErr.message || 'Payment status check timed out. Please check your phone and try again.');
          setPaymentFlowStep('confirm');
        }
      } else if (isCardPayment) {
        const paymentUrl = result.payment?.payment_url;
        if (paymentUrl) {
          localStorage.setItem('natakahii_pending_order_id', result.order?.id?.toString() || '');
          setPaymentFlowStep('redirecting');
          setLoading(false);
          window.location.href = paymentUrl;
        } else {
          setError('Card payment URL not received from provider. Please try again.');
          setPaymentFlowStep('confirm');
          setLoading(false);
        }
      } else if (paymentMethod === 'dynamic_qr' || paymentMethod === 'qr') {
        const qrCode = result.payment?.payment_qr_code;
        if (qrCode) {
          setQrCodeUrl(qrCode);
          setPaymentFlowStep('qr');
          setLoading(false);
          try {
            pollingAborted.current = false;
            const statusResult = await pollPaymentStatus(orderResult.order.id, 60, 3000);
            if (pollingAborted.current) return;
            if (statusResult.status === 'successful') { triggerConfetti(); setStep(3); } 
            else { setError(formatPaymentFailureError(statusResult)); setPaymentFlowStep('confirm'); }
          } catch (pollErr: any) {
            if (pollingAborted.current) return;
            setError(pollErr.message || 'Payment status check timed out. Please scan the QR code again.');
            setPaymentFlowStep('confirm');
          }
        } else {
          setError('QR code not received from provider. Please try again.');
          setPaymentFlowStep('confirm');
          setLoading(false);
        }
      } else {
        triggerConfetti();
        setStep(3);
      }
    } catch (err: any) {
      const backendError = err?.response?.data?.error || err?.response?.data?.message;
      setError(backendError || err.message || 'Payment retry failed. Please try again.');
      setPaymentFlowStep('confirm');
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#142490', '#F05A28'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#142490', '#F05A28'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  if (step === 3) {
    return (
      <div className="bg-black/50 fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 lg:p-12 backdrop-blur-sm">
        <div className="w-full max-w-6xl relative z-10 my-auto">
          <CheckoutProgress step={3} />
          <SuccessStep 
            orderResult={orderResult}
            fullName={fullName}
            mobileNumber={mobileNumber}
            streetAddress={streetAddress}
            selectedWard={selectedWard}
            selectedDistrict={selectedDistrict}
            selectedRegion={selectedRegion}
            pickupStation={pickupStation}
            paymentMethod={paymentMethod}
            subtotal={subtotal}
            platformFee={platformFee}
            shippingCost={shippingCost}
            total={total}
            items={items}
            formatCurrency={formatCurrency}
            navigate={navigate}
            mobileProviders={mobileProviders}
            cardProviders={cardProviders}
            shippingProviders={shippingProviders}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/50 fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 lg:p-12 backdrop-blur-sm">
      <div className="w-full max-w-[720px] relative z-10 my-auto">
        <CheckoutProgress step={step} />

        <div className="w-full">
          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && cargoStepOpen && (
              <CargoStep 
                key="cargo-step"
                shippingMethod={shippingMethod}
                shippingProviders={shippingProviders}
                formatCurrency={formatCurrency}
                pickupHub={pickupHub}
                 setPickupHub={setPickupHub}
                 deliveryHub={deliveryHub}
                 setDeliveryHub={setDeliveryHub}
                 cargoServiceLevel={cargoServiceLevel}
                 setCargoServiceLevel={setCargoServiceLevel}
                 cargoWeight={cargoWeight}
                 setCargoWeight={setCargoWeight}
                 hubs={hubs}
                 onQuoteUpdate={(q) => setQuote(q)}
                 error={error}
                 handleNext={() => {
                  if (!pickupHub || !deliveryHub) {
                    setError('Please select both pickup and delivery hubs');
                    return;
                  }
                  setError('');
                  if (quote || quote === null) {
                    handleCargoPlaceOrder();
                    if (!error) {
                      setCargoStepOpen(false);
                      setStep(3);
                    }
                  }
                }}
                handleBack={() => {
                  if (step === 1) {
                    navigate(-1);
                  } else {
                    setCargoStepOpen(true);
                    setStep(1);
                  }
                }}
              />
            )}

            {step === 1 && !cargoStepOpen && (
              <DeliveryStep 
                key="step1"
                items={items}
                subtotal={subtotal}
                platformFee={platformFee}
                shippingCost={shippingCost}
                total={total}
                shippingMethod={shippingMethod}
                shippingProviders={shippingProviders}
                formatCurrency={formatCurrency}
                savedAddress={savedAddress}
                fullName={fullName}
                mobileNumber={mobileNumber}
                altMobileNumber={altMobileNumber}
                streetAddress={streetAddress}
                selectedWard={selectedWard}
                selectedDistrict={selectedDistrict}
                selectedRegion={selectedRegion}
                pickupStation={pickupStation}
                setAddressDrawerOpen={setAddressDrawerOpen}
                setError={setError}
                handleBack={handleBack}
                handleNext={handleNext}
                error={error}
              />
            )}

            {step === 2 && (
              <PaymentStep 
                key="step2"
                paymentFlowStep={paymentFlowStep}
                paymentMethod={paymentMethod}
                mobileProviders={mobileProviders}
                cardProviders={cardProviders}
                setPaymentDrawerCategory={setPaymentDrawerCategory}
                setPaymentDrawerOpen={setPaymentDrawerOpen}
                setPaymentMethod={setPaymentMethod}
                mpesaPhone={mpesaPhone}
                setMpesaPhone={setMpesaPhone}
                paymentPhoneError={paymentPhoneError}
                setPaymentPhoneError={setPaymentPhoneError}
                validateProviderPhone={validateProviderPhone}
                setPaymentFlowStep={setPaymentFlowStep}
                error={error}
                loading={loading}
                handleBack={handleBack}
                handleStartPaymentFlow={handleStartPaymentFlow}
                handleCompletePayment={handlePlaceOrder}
                handleRetryPayment={handleRetryPayment}
                total={total}
                formatCurrency={formatCurrency}
                paymentStatusMessage={paymentStatusMessage}
                mobileNumber={mobileNumber}
                qrCodeUrl={qrCodeUrl}
              />
            )}
          </AnimatePresence>

          <AddressDialog 
            open={addressDrawerOpen}
            onOpenChange={setAddressDrawerOpen}
            locView={locView}
            setLocView={setLocView}
            regions={regions}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            districts={districts}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            wards={wards}
            selectedWard={selectedWard}
            setSelectedWard={setSelectedWard}
            fullName={fullName}
            setFullName={setFullName}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            altMobileNumber={altMobileNumber}
            setAltMobileNumber={setAltMobileNumber}
            streetAddress={streetAddress}
            setStreetAddress={setStreetAddress}
            availableStations={availableStations}
            pickupStation={pickupStation}
            setPickupStation={setPickupStation}
            handleUseMyLocation={handleUseMyLocation}
            isDefaultAddress={isDefaultAddress}
            setIsDefaultAddress={setIsDefaultAddress}
            error={error}
            handleSaveAddress={handleSaveAddress}
          />

          <PaymentMethodDialog 
            open={paymentDrawerOpen}
            onOpenChange={setPaymentDrawerOpen}
            paymentDrawerCategory={paymentDrawerCategory}
            mobileProviders={mobileProviders}
            cardProviders={cardProviders}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            setMpesaPhone={setMpesaPhone}
          />
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar removed for embedded design */}
    </div>
  );
}
