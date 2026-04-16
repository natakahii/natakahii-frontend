import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'icon' | 'outline' | 'link';
  size?: 'xs' | 's' | 'sm' | 'm' | 'l' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'm', isLoading, children, disabled, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-lighter)] focus:ring-offset-2";
    
    const variants = {
      primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-accent)]",
      secondary: "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)]",
      outline: "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)]",
      destructive: "bg-[var(--color-error)] text-white hover:bg-red-700",
      ghost: "bg-transparent text-[var(--color-text-heading)] hover:bg-[var(--color-bg-card)]",
      icon: "rounded-full flex items-center justify-center",
      link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
    };

    const sizes = {
      xs: "text-[11px] px-3 py-1.5 h-7",
      s: "text-[13px] px-4 py-2 h-9",
      sm: "text-[13px] px-4 py-2 h-9",
      m: "text-[14px] px-6 py-2.5 h-11",
      l: "text-[16px] px-8 py-3 h-14",
      lg: "text-[16px] px-8 py-3 h-14",
      xl: "text-[18px] px-10 py-4 h-16",
      icon: "h-9 w-9",
    };

    const iconSizes = {
      xs: "h-7 w-7",
      s: "h-9 w-9",
      sm: "h-9 w-9",
      m: "h-11 w-11",
      l: "h-14 w-14",
      lg: "h-14 w-14",
      xl: "h-16 w-16",
      icon: "h-9 w-9",
    };

    const appliedSize = variant === 'icon' ? iconSizes[size] : sizes[size] || sizes['m'];
    
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          baseStyles,
          variants[variant],
          appliedSize,
          isDisabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';