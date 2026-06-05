import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '../../../components/ui/dialog';
import { cn } from '../../../components/ui/utils';

interface PaymentProvider {
  id: string;
  name: string;
  color: string;
  logo?: string;
  textColor?: string;
}

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentDrawerCategory: 'mobile' | 'card' | null;
  mobileProviders: PaymentProvider[];
  cardProviders: PaymentProvider[];
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  setMpesaPhone: (v: string) => void;
}

export function PaymentMethodDialog({
  open,
  onOpenChange,
  paymentDrawerCategory,
  mobileProviders,
  cardProviders,
  paymentMethod,
  setPaymentMethod,
  setMpesaPhone,
}: PaymentMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[480px] p-0 gap-0 overflow-hidden rounded-[20px] flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        <DialogHeader className="border-b border-[var(--color-border)] pb-4 pt-6 px-4 sm:px-6 relative shrink-0">
          <DialogTitle className="text-center text-[18px] text-[var(--color-text-heading)]">
            {paymentDrawerCategory === 'mobile' ? 'Mobile Payment' : paymentDrawerCategory === 'card' ? 'Card / Bank Payment' : 'Select Payment Method'}
          </DialogTitle>
          <DialogDescription className="text-center text-[13px] text-[var(--color-text-muted)]">
            Select your preferred provider
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-3 flex-1">
          {paymentDrawerCategory === 'mobile' && (
            <>
              {mobileProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => {
                    setPaymentMethod(provider.id);
                    setMpesaPhone('');
                    onOpenChange(false);
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
                    onOpenChange(false);
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
                          color: 'textColor' in provider ? (provider as any).textColor : '#fff',
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
      </DialogContent>
    </Dialog>
  );
}
