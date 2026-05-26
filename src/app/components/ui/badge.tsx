import { cn } from './utils';
import type { ReactNode } from 'react';
import { BadgeCheck } from 'lucide-react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'pending' | 'active' | 'suspended' | 'processing' | 'verified' | 'hot-deal' | 'new' | 'stock' | 'outline' | 'destructive' | 'secondary';
  className?: string;
}

interface VendorVerificationBadgeProps {
  label?: string;
  tone?: 'compact' | 'default' | 'hero';
  className?: string;
}

interface VendorTrustBadgeProps {
  label?: string;
  tone?: 'compact' | 'default' | 'hero';
  className?: string;
}

export function Badge({ children, variant = 'active', className }: BadgeProps) {
  const base = "inline-flex items-center justify-center font-bold tracking-[0.5px] uppercase rounded-[4px] px-2 py-0.5 text-[11px] whitespace-nowrap";
  
  const variants = {
    pending: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
    active: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
    suspended: "bg-[var(--color-error-bg)] text-[var(--color-error)]",
    processing: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
    verified: "rounded-full border border-[rgba(20,36,144,0.10)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(232,235,250,0.98)_58%,rgba(254,240,235,0.94))] text-[var(--color-primary-darker)] shadow-[0_10px_24px_rgba(20,36,144,0.12)] normal-case tracking-[0.24px] px-3 py-1 font-extrabold",
    'hot-deal': "bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] text-white rounded-full px-3",
    new: "bg-[var(--color-primary-darker)] text-white rounded-full px-3",
    stock: "bg-[var(--color-text-muted)] text-white rounded-full px-3",
    outline: "text-foreground",
    destructive: "bg-red-500 text-white hover:bg-red-500/80 border-transparent",
    secondary: "bg-[var(--color-primary-bg)] text-[var(--color-primary)]",
  };

  return (
    <span className={cn(base, variants[variant], className)}>
      {variant === 'verified' && (
        <span className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-light))] text-white shadow-[0_6px_14px_rgba(20,36,144,0.24)]">
          <BadgeCheck className="h-2.75 w-2.75" strokeWidth={2.8} />
        </span>
      )}
      {children}
    </span>
  );
}

export function VendorVerificationBadge({
  label = 'Premium Verified',
  tone = 'default',
  className,
}: VendorVerificationBadgeProps) {
  const toneClasses = {
    compact: "gap-1.5 px-2 py-1 text-[9.5px]",
    default: "gap-2 px-2.5 py-1.5 text-[10.5px]",
    hero: "gap-2.5 px-3.5 py-2 text-[11px]",
  };

  const iconWrapClasses = {
    compact: "h-4 w-4",
    default: "h-5 w-5",
    hero: "h-6 w-6",
  };

  const iconClasses = {
    compact: "h-2.75 w-2.75",
    default: "h-3.25 w-3.25",
    hero: "h-3.5 w-3.5",
  };

  return (
    <span
      className={cn(
        "relative inline-flex items-center overflow-hidden rounded-full border border-[rgba(20,36,144,0.12)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(232,235,250,0.98)_58%,rgba(254,240,235,0.94))] text-[var(--color-primary-darker)] shadow-[0_12px_28px_rgba(20,36,144,0.12)] ring-1 ring-white/80 backdrop-blur-sm",
        toneClasses[tone],
        className
      )}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-white/90" />
      <span
        className={cn(
          "relative z-[1] inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-light))] text-white shadow-[0_8px_18px_rgba(20,36,144,0.24)]",
          iconWrapClasses[tone]
        )}
      >
        <BadgeCheck className={iconClasses[tone]} strokeWidth={2.8} />
      </span>
      <span className="relative z-[1] font-black uppercase tracking-[0.18em] leading-none">
        {label}
      </span>
    </span>
  );
}

export function VendorTrustBadge({
  label = 'KYC Checked',
  tone = 'default',
  className,
}: VendorTrustBadgeProps) {
  const toneClasses = {
    compact: "gap-1.5 px-2 py-1 text-[9.5px]",
    default: "gap-2 px-2.5 py-1.5 text-[10.5px]",
    hero: "gap-2.5 px-3.5 py-2 text-[11px]",
  };

  const iconWrapClasses = {
    compact: "h-4 w-4",
    default: "h-5 w-5",
    hero: "h-6 w-6",
  };

  const iconClasses = {
    compact: "h-2.75 w-2.75",
    default: "h-3.25 w-3.25",
    hero: "h-3.5 w-3.5",
  };

  return (
    <span
      className={cn(
        "relative inline-flex items-center overflow-hidden rounded-full border border-[rgba(20,145,88,0.16)] bg-[linear-gradient(135deg,rgba(248,255,252,0.98),rgba(232,245,238,0.98)_68%,rgba(244,252,247,0.94))] text-[var(--color-success)] shadow-[0_10px_24px_rgba(16,120,74,0.10)] ring-1 ring-white/80 backdrop-blur-sm",
        toneClasses[tone],
        className
      )}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-white/90" />
      <span
        className={cn(
          "relative z-[1] inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-success),#46b97e)] text-white shadow-[0_8px_18px_rgba(16,120,74,0.22)]",
          iconWrapClasses[tone]
        )}
      >
        <BadgeCheck className={iconClasses[tone]} strokeWidth={2.8} />
      </span>
      <span className="relative z-[1] font-black uppercase tracking-[0.18em] leading-none">
        {label}
      </span>
    </span>
  );
}
