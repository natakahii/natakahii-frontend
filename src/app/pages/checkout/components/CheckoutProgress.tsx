import { cn } from '../../../components/ui/utils';

interface CheckoutProgressProps {
  step: number;
  className?: string;
}

export function CheckoutProgress({ step, className }: CheckoutProgressProps) {
  const steps = [
    { id: 1, label: 'Checkout' },
    { id: 2, label: 'Payment' },
    { id: 3, label: 'Done' },
  ];

  return (
    <div className={cn("hidden lg:block bg-white rounded-[24px] shadow-lg p-4 sm:p-6 mb-6", className)}>
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 sm:gap-4 w-full max-w-lg px-2">
          {steps.map((s, index) => (
            <div key={s.id} className="flex flex-1 items-center last:flex-none last:w-auto">
              <div className="flex flex-col items-center gap-2 min-w-0">
                <div 
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-[14px] sm:text-[16px] transition-all shadow-sm border-2",
                    step >= s.id 
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" 
                      : "bg-white text-[var(--color-text-muted)] border-[var(--color-border)]"
                  )}
                >
                  {s.id}
                </div>
                <span 
                  className={cn(
                    "text-[10px] sm:text-[13px] font-bold whitespace-nowrap",
                    step >= s.id ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "h-[3px] flex-1 mx-2 sm:mx-4 rounded-full transition-all",
                    step > s.id ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
                  )} 
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
