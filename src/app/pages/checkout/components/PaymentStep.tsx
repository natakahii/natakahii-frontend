import { 
  CreditCard, Phone, CheckCircle, Info, Loader2, QrCode, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { cn } from '../../../components/ui/utils';

interface PaymentProvider {
  id: string;
  name: string;
  color: string;
  logo?: string;
  textColor?: string;
}

interface PaymentStepProps {
  paymentFlowStep: 'select' | 'request' | 'confirm' | 'processing' | 'awaiting' | 'redirecting' | 'hosted_redirect' | 'qr';
  paymentMethod: string;
  mobileProviders: PaymentProvider[];
  cardProviders: PaymentProvider[];
  setPaymentDrawerCategory: (v: 'mobile' | 'card' | null) => void;
  setPaymentDrawerOpen: (v: boolean) => void;
  setPaymentMethod: (v: string) => void;
  mpesaPhone: string;
  setMpesaPhone: (v: string) => void;
  paymentPhoneError: string;
  setPaymentPhoneError: (v: string) => void;
  validateProviderPhone: (provider: string, phone: string) => { valid: boolean; message: string };
  setPaymentFlowStep: (v: any) => void;
  error: string;
  loading: boolean;
  handleBack: () => void;
  handleStartPaymentFlow: (overrideMethod?: string) => void;
  handleCompletePayment: () => void;
  handleRetryPayment: () => void;
  total: number;
  formatCurrency: (v: number) => string;
  paymentStatusMessage: string;
  mobileNumber: string;
  qrCodeUrl: string;
}

export function PaymentStep({
  paymentFlowStep,
  paymentMethod,
  mobileProviders,
  cardProviders,
  setPaymentDrawerCategory,
  setPaymentDrawerOpen,
  setPaymentMethod,
  mpesaPhone,
  setMpesaPhone,
  paymentPhoneError,
  setPaymentPhoneError,
  validateProviderPhone,
  setPaymentFlowStep,
  error,
  loading,
  handleBack,
  handleStartPaymentFlow,
  handleCompletePayment,
  handleRetryPayment,
  total,
  formatCurrency,
  paymentStatusMessage,
  mobileNumber,
  qrCodeUrl,
}: PaymentStepProps) {
  return (
    <div className="space-y-8 bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-[var(--color-border)]/50">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-[var(--color-border)]">
        <div className="w-10 h-10 rounded-full bg-[var(--color-accent-bg)] flex items-center justify-center shrink-0">
          <CreditCard className="w-5 h-5 text-[var(--color-accent)]" />
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[var(--color-text-heading)] tracking-tight">
            {paymentFlowStep === 'select' ? 'Payment Method' : paymentFlowStep === 'request' ? 'Request Payment' : paymentFlowStep === 'confirm' ? 'Confirm Payment' : paymentFlowStep === 'awaiting' ? 'Waiting for Confirmation' : paymentFlowStep === 'redirecting' ? 'Redirecting to Payment' : paymentFlowStep === 'qr' ? 'Scan QR Code' : 'Processing Payment'}
          </h2>
          <p className="text-[14px] text-[var(--color-text-muted)]">
            {paymentFlowStep === 'select' ? 'All transactions are secure and encrypted.' : paymentFlowStep === 'request' ? 'Enter your mobile number to continue.' : paymentFlowStep === 'confirm' ? 'Click Complete Payment to receive a push on your phone.' : paymentFlowStep === 'awaiting' ? 'Please enter your PIN on your mobile device.' : paymentFlowStep === 'redirecting' ? 'Redirecting you to the secure payment page.' : paymentFlowStep === 'qr' ? 'Scan the QR code with your mobile banking app to pay.' : 'Please wait while we process your payment.'}
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
                    {mobileProviders.some(p => p.id === paymentMethod) ? 'Mobile Payment' : 'Credit / Debit Card'}
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
              className="flex flex-col items-center gap-3 p-6 rounded-[16px] bg-[var(--color-bg-page)] hover:bg-[var(--color-primary-bg)] hover:shadow-sm transition-all text-left group"
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-[var(--color-primary-bg)]">
                <Phone className="w-7 h-7 text-[var(--color-primary)]" />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold text-[var(--color-text-heading)]">Mobile Payment</p>
                <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">M-Pesa, Airtel, etc.</p>
              </div>
            </button>
            <button
              onClick={() => { 
                setPaymentMethod('card'); 
                handleStartPaymentFlow('card');
              }}
              className="flex flex-col items-center gap-3 p-6 rounded-[16px] bg-[var(--color-bg-page)] hover:bg-[var(--color-accent-bg)] hover:shadow-sm transition-all text-left group"
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-[var(--color-accent-bg)]">
                <CreditCard className="w-7 h-7 text-[var(--color-accent)]" />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold text-[var(--color-text-heading)]">Card / Bank</p>
                <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">Secure card payment</p>
              </div>
            </button>
          </div>

          {/* Mobile action button - embedded below payment categories */}
          <div className="sm:hidden mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[var(--color-bg-page)] rounded-[16px] border border-[var(--color-border)]/50">
              <span className="text-[13px] font-semibold text-[var(--color-text-muted)]">Pay Amount</span>
              <span className="text-[18px] font-bold text-[var(--color-accent)]">{formatCurrency(total)}</span>
            </div>
            <Button
              onClick={() => handleStartPaymentFlow()}
              disabled={loading}
              variant="primary"
              size="xl"
              className="w-full shadow-[var(--shadow-level-2)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] h-14 text-[16px] font-bold"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>PAY <ChevronRight className="w-5 h-5 ml-2" /></>}
            </Button>
            <button 
              onClick={handleBack}
              className="w-full text-center py-2 text-[14px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]"
            >
              Back to Shipping
            </button>
          </div>

          {error && <div className="text-red-500 text-[14px] font-medium bg-red-50 rounded-[8px] p-3">{error}</div>}

          {/* Desktop Pay button */}
          <div className="hidden sm:flex items-center justify-between gap-4 pt-6 border-t border-[var(--color-border)]">
            <Button onClick={handleBack} variant="ghost" className="text-[var(--color-text-muted)] font-bold px-0 hover:bg-transparent hover:text-[var(--color-text-heading)]">
              <ChevronLeft className="w-5 h-5 mr-1" /> Back
            </Button>
            <Button onClick={() => handleStartPaymentFlow()} disabled={loading} variant="primary" size="xl" className="px-12 shadow-[var(--shadow-level-2)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]">
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

          {/* Mobile action button - embedded below phone input and tips */}
          <div className="sm:hidden mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[var(--color-bg-page)] rounded-[16px] border border-[var(--color-border)]/50">
              <span className="text-[13px] font-semibold text-[var(--color-text-muted)]">Pay Amount</span>
              <span className="text-[18px] font-bold text-[var(--color-accent)]">{formatCurrency(total)}</span>
            </div>
            <Button
              onClick={() => {
                const v = validateProviderPhone(paymentMethod, mpesaPhone);
                if (!v.valid) { setPaymentPhoneError(v.message); return; }
                setPaymentPhoneError('');
                setPaymentFlowStep('confirm');
              }}
              variant="primary"
              size="xl"
              className="w-full shadow-[var(--shadow-level-2)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] h-14 text-[16px] font-bold"
            >
              Continue <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <button 
              onClick={handleBack}
              className="w-full text-center py-2 text-[14px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]"
            >
              Change Payment Method
            </button>
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
              Click <span className="font-bold">Complete Payment</span> and a payment request will be sent directly to your phone. You will receive a USSD push on your mobile device — just enter your PIN there to confirm. No PIN needed on this website.
            </p>
            <div className="bg-white rounded-[12px] p-3 border border-blue-100 inline-flex items-center gap-2">
              <Phone className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-[13px] font-bold text-[var(--color-text-heading)]">{mpesaPhone}</span>
            </div>
          </div>

          {/* Mobile action button - embedded below confirm instructions */}
          <div className="sm:hidden mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[var(--color-bg-page)] rounded-[16px] border border-[var(--color-border)]/50">
              <span className="text-[13px] font-semibold text-[var(--color-text-muted)]">Total to Pay</span>
              <span className="text-[18px] font-bold text-[var(--color-accent)]">{formatCurrency(total)}</span>
            </div>
            <Button
              onClick={handleCompletePayment}
              disabled={loading}
              variant="primary"
              size="xl"
              className="w-full shadow-[var(--shadow-level-2)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] h-14 text-[16px] font-bold"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>COMPLETE PAYMENT <ChevronRight className="w-5 h-5 ml-2" /></>}
            </Button>
            <button 
              onClick={handleBack}
              className="w-full text-center py-2 text-[14px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]"
            >
              Change Details
            </button>
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>COMPLETE PAYMENT <ChevronRight className="w-5 h-5 ml-2" /></>}
            </Button>
          </div>
        </>
      )}

      {/* ── PROCESSING ── */}
      {paymentFlowStep === 'processing' && (
        <div className="py-12 flex flex-col items-center text-center space-y-4">
          <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin" />
          <p className="text-[16px] font-bold text-[var(--color-text-heading)]">Initiating payment...</p>
          <p className="text-[13px] text-[var(--color-text-muted)] max-w-sm">
            Sending a payment request to your {(() => { const p = mobileProviders.find(m => m.id === paymentMethod); return p ? p.name : 'provider'; })()}. Please wait...
          </p>
        </div>
      )}

      {/* ── AWAITING: Waiting for phone confirmation ── */}
      {paymentFlowStep === 'awaiting' && (
        <div className="py-8 flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
              <Phone className="w-10 h-10 text-[var(--color-primary)]" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
          </div>

          <div className="space-y-2 max-w-sm">
            <p className="text-[18px] font-bold text-[var(--color-text-heading)]">Check Your Phone</p>
            <p className="text-[14px] text-[var(--color-text-body)] leading-relaxed">
              {paymentStatusMessage || 'A payment prompt has been sent to your phone. Please enter your PIN on your mobile device to complete the payment.'}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-[16px] p-4 w-full max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-blue-100 shrink-0">
                <Phone className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div className="text-left">
                <p className="text-[12px] text-[var(--color-text-muted)]">Payment sent to</p>
                <p className="text-[14px] font-bold text-[var(--color-text-heading)]">{mpesaPhone || mobileNumber}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Waiting for confirmation from your mobile provider...</span>
          </div>

          <p className="text-[12px] text-[var(--color-text-muted)] max-w-sm">
            Please do not close this page. The status will update automatically once your payment is processed.
          </p>
        </div>
      )}

      {/* ── REDIRECTING: Card payment redirect ── */}
      {paymentFlowStep === 'redirecting' && (
        <div className="py-12 flex flex-col items-center text-center space-y-4">
          <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin" />
          <p className="text-[16px] font-bold text-[var(--color-text-heading)]">Redirecting to secure payment...</p>
          <p className="text-[13px] text-[var(--color-text-muted)] max-w-sm">
            You are being redirected to our payment partner to complete your card payment securely.
          </p>
        </div>
      )}

      {/* ── HOSTED REDIRECT: Snippe checkout redirect ── */}
      {paymentFlowStep === 'hosted_redirect' && (
        <div className="py-12 flex flex-col items-center text-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-[16px] font-bold text-[var(--color-text-heading)]">Redirecting to Snippe checkout...</p>
          <p className="text-[13px] text-[var(--color-text-muted)] max-w-sm">
            You are being redirected to Snippe's secure hosted checkout page to complete your payment.
          </p>
        </div>
      )}

      {/* ── QR: QR code payment ── */}
      {paymentFlowStep === 'qr' && (
        <div className="py-8 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
            <QrCode className="w-10 h-10 text-[var(--color-primary)]" />
          </div>

          <div className="space-y-2 max-w-sm">
            <p className="text-[18px] font-bold text-[var(--color-text-heading)]">Scan to Pay</p>
            <p className="text-[14px] text-[var(--color-text-body)] leading-relaxed">
              Open your mobile banking app and scan the QR code below to complete the payment.
            </p>
          </div>

          {qrCodeUrl && (
            <div className="bg-white border border-[var(--color-border)] rounded-[16px] p-4">
              <QRCodeSVG
                value={qrCodeUrl}
                size={192}
                level="M"
                includeMargin={true}
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Waiting for payment confirmation...</span>
          </div>

          {error && (
            <div className="w-full max-w-sm">
              <div className="text-red-500 text-[14px] font-medium bg-red-50 rounded-[8px] p-3">{error}</div>
              <Button
                onClick={handleRetryPayment}
                disabled={loading}
                variant="primary"
                size="l"
                className="w-full mt-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Retry Payment'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
