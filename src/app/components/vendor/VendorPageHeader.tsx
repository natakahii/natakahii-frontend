import { ReactNode } from 'react';

interface VendorPageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}

export function VendorPageHeader({ title, description, badge, actions }: VendorPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-heading)] vendor-heading">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-[var(--color-text-muted)] vendor-body max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
