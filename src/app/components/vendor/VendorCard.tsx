import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../ui/utils';

interface VendorCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  glow?: boolean;
  className?: string;
}

export function VendorCard({ children, glow = false, className, ...props }: VendorCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
      }}
      whileHover={{ y: -2, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      className={cn(
        'rounded-[var(--vendor-radius-card)] border bg-[var(--vendor-surface-glass)] backdrop-blur-sm',
        glow
          ? 'border-[var(--vendor-border-card)] shadow-[var(--vendor-shadow-glow)]'
          : 'border-[var(--color-border)] shadow-xl',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
