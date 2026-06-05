import { ReactNode } from 'react';
import { Skeleton } from '../ui/skeleton';

export function VendorDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-[24px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Skeleton className="h-[360px] xl:col-span-2 rounded-[24px]" />
        <Skeleton className="h-[360px] rounded-[24px]" />
      </div>
    </div>
  );
}

export function VendorAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-[24px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Skeleton className="h-[340px] rounded-[24px]" />
        <Skeleton className="h-[340px] rounded-[24px]" />
      </div>
    </div>
  );
}

export function VendorWalletSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 rounded-[24px]" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-[24px]" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-[24px]" />
    </div>
  );
}

export function VendorProductsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-12 rounded-[16px]" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-[24px]" />
        ))}
      </div>
    </div>
  );
}

interface VendorInlineErrorProps {
  message: string;
  onRetry?: () => void;
}

export function VendorInlineError({ message, onRetry }: VendorInlineErrorProps) {
  return (
    <div className="rounded-[24px] border border-[var(--color-error)]/30 bg-[var(--color-error-bg)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="font-bold text-[var(--color-text-heading)] vendor-heading">Something went wrong</h2>
        <p className="text-sm text-[var(--color-text-body)] vendor-body mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-xl border border-[var(--color-border)] bg-white text-sm font-medium hover:bg-[var(--color-bg-card)] transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function VendorTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function VendorSkeletonBlock({ children }: { children?: ReactNode }) {
  return children ?? null;
}
