import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { safeFormatCurrency } from '../../utils/currency';

type BalanceVariant = 'available' | 'pending' | 'held' | 'lifetime';

const variantStyles: Record<
  BalanceVariant,
  { border: string; accent: string; bg: string }
> = {
  available: {
    border: 'border-[var(--vendor-accent-success)]/30',
    accent: 'text-[var(--vendor-accent-success)]',
    bg: 'bg-gradient-to-br from-emerald-50 to-white',
  },
  pending: {
    border: 'border-[var(--vendor-accent-warning)]/30',
    accent: 'text-[var(--vendor-accent-warning)]',
    bg: 'bg-gradient-to-br from-amber-50 to-white',
  },
  held: {
    border: 'border-[var(--color-border)]',
    accent: 'text-[var(--color-text-muted)]',
    bg: 'bg-gradient-to-br from-neutral-50 to-white',
  },
  lifetime: {
    border: 'border-[var(--vendor-accent-action)]/30',
    accent: 'text-[var(--vendor-accent-action)]',
    bg: 'bg-gradient-to-br from-violet-50 to-white',
  },
};

interface VendorBalanceTileProps {
  title: string;
  amount: number;
  description: string;
  icon: ReactNode;
  variant: BalanceVariant;
  index?: number;
}

export function VendorBalanceTile({
  title,
  amount,
  description,
  icon,
  variant,
  index = 0,
}: VendorBalanceTileProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
      whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
      className={`rounded-[var(--vendor-radius-card)] border ${styles.border} ${styles.bg} p-6 shadow-xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-white shadow-sm ${styles.accent}`}>{icon}</div>
      </div>
      <h3 className="text-sm font-medium text-[var(--color-text-muted)] vendor-body">{title}</h3>
      <p className="text-2xl font-bold text-[var(--color-text-heading)] vendor-heading mt-1 mb-2">
        {safeFormatCurrency(amount)}
      </p>
      <p className="text-xs text-[var(--color-text-muted)] vendor-body">{description}</p>
    </motion.div>
  );
}
