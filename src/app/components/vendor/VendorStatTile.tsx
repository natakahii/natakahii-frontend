import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Skeleton } from '../ui/skeleton';
import { safeFormatCurrency } from '../../utils/currency';
import { VendorCard } from './VendorCard';

type Accent = 'success' | 'action' | 'warning' | 'neutral';

const accentStyles: Record<Accent, { icon: string; bg: string }> = {
  success: {
    icon: 'text-[var(--vendor-accent-success)]',
    bg: 'bg-[var(--vendor-accent-success-bg)]',
  },
  action: {
    icon: 'text-[var(--vendor-accent-action)]',
    bg: 'bg-[var(--vendor-accent-action-bg)]',
  },
  warning: {
    icon: 'text-[var(--vendor-accent-warning)]',
    bg: 'bg-[var(--vendor-accent-warning-bg)]',
  },
  neutral: {
    icon: 'text-[var(--color-text-muted)]',
    bg: 'bg-[var(--color-bg-card)]',
  },
};

interface VendorStatTileProps {
  title: string;
  value: string | number | null;
  subtitle?: string;
  icon: LucideIcon;
  accent?: Accent;
  isLoading?: boolean;
  isCurrency?: boolean;
}

export function VendorStatTile({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'neutral',
  isLoading,
  isCurrency,
}: VendorStatTileProps) {
  const styles = accentStyles[accent];

  const displayValue =
    value === null || value === undefined
      ? '—'
      : isCurrency
        ? safeFormatCurrency(value)
        : typeof value === 'number'
          ? value.toLocaleString()
          : value;

  return (
    <VendorCard className="p-6">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-muted)] vendor-body">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-2xl font-bold text-[var(--color-text-heading)] vendor-heading truncate"
            >
              {displayValue}
            </motion.p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-2xl ${styles.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${styles.icon}`} />
        </div>
      </div>
      {subtitle &&
        (isLoading ? (
          <Skeleton className="h-4 w-full mt-4" />
        ) : (
          <p className="mt-4 text-sm text-[var(--color-text-muted)] vendor-body">{subtitle}</p>
        ))}
    </VendorCard>
  );
}
