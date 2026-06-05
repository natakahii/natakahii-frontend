import { ReactNode } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  BarChart3,
  Package,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Button } from '../ui/button';
import { VendorCard } from './VendorCard';

type VendorEmptyVariant = 'no-sales' | 'no-products' | 'no-transactions' | 'no-analytics' | 'no-payouts';

interface VendorEmptyStateProps {
  variant: VendorEmptyVariant;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  className?: string;
}

const variantConfig: Record<
  VendorEmptyVariant,
  { icon: typeof Package; accent: string; secondary: string }
> = {
  'no-sales': {
    icon: ShoppingBag,
    accent: 'bg-[var(--vendor-accent-success-bg)] text-[var(--vendor-accent-success)]',
    secondary: 'bg-[var(--vendor-accent-action-bg)]',
  },
  'no-products': {
    icon: Package,
    accent: 'bg-[var(--vendor-accent-action-bg)] text-[var(--vendor-accent-action)]',
    secondary: 'bg-[var(--vendor-accent-warning-bg)]',
  },
  'no-transactions': {
    icon: Wallet,
    accent: 'bg-[var(--vendor-accent-action-bg)] text-[var(--vendor-accent-action)]',
    secondary: 'bg-[var(--vendor-accent-success-bg)]',
  },
  'no-analytics': {
    icon: BarChart3,
    accent: 'bg-[var(--vendor-accent-success-bg)] text-[var(--vendor-accent-success)]',
    secondary: 'bg-[var(--vendor-accent-action-bg)]',
  },
  'no-payouts': {
    icon: TrendingUp,
    accent: 'bg-[var(--vendor-accent-warning-bg)] text-[var(--vendor-accent-warning)]',
    secondary: 'bg-[var(--vendor-accent-action-bg)]',
  },
};

function ActionButton({
  label,
  href,
  onClick,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const button = (
    <Button className="bg-[var(--vendor-accent-action)] hover:bg-[#6d28d9] text-white px-8 py-6 rounded-xl font-bold flex items-center gap-2 shadow-xl text-[15px]">
      {label} <ArrowRight className="w-4 h-4" />
    </Button>
  );

  if (href) return <Link to={href}>{button}</Link>;
  if (onClick) return <div onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>{button}</div>;
  return button;
}

export function VendorEmptyState({
  variant,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  className = '',
}: VendorEmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <VendorCard glow className={`py-16 px-6 text-center ${className}`}>
      <div className="relative w-56 h-56 mb-8 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--vendor-border-card)] animate-[spin_60s_linear_infinite] opacity-40" />
        <div className={`absolute top-[12%] right-[8%] w-16 h-16 rounded-full ${config.secondary} opacity-60`} />
        <div className={`absolute bottom-[15%] left-[10%] w-20 h-20 rounded-[20px] ${config.secondary} opacity-40 rotate-12`} />
        <div className={`relative z-10 p-6 rounded-[24px] bg-white shadow-xl border border-[var(--color-border)]`}>
          <div className={`w-16 h-16 rounded-2xl ${config.accent} flex items-center justify-center mx-auto`}>
            <Icon className="w-8 h-8" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <h3 className="text-xl md:text-2xl font-extrabold text-[var(--color-text-heading)] vendor-heading mb-2">
        {title}
      </h3>
      <p className="text-[15px] text-[var(--color-text-body)] max-w-sm mx-auto mb-8 vendor-body leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        <ActionButton label={actionLabel} href={actionHref} onClick={actionOnClick} />
      )}
    </VendorCard>
  );
}

export function VendorEmptyInline({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]/50 p-8 text-center">
      <h3 className="font-bold text-[var(--color-text-heading)] vendor-heading">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] mt-2 vendor-body">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
