import { cn } from './utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'pending' | 'active' | 'suspended' | 'processing' | 'verified' | 'hot-deal' | 'new' | 'stock' | 'outline' | 'destructive' | 'secondary';
  className?: string;
}

export function Badge({ children, variant = 'active', className }: BadgeProps) {
  const base = "inline-flex items-center justify-center font-bold tracking-[0.5px] uppercase rounded-[4px] px-2 py-0.5 text-[11px] whitespace-nowrap";
  
  const variants = {
    pending: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
    active: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
    suspended: "bg-[var(--color-error-bg)] text-[var(--color-error)]",
    processing: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
    verified: "bg-[var(--color-primary)] text-white",
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
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
      )}
      {children}
    </span>
  );
}