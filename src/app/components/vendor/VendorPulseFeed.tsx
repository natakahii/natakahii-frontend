import { AlertTriangle, Package, ShoppingBag } from 'lucide-react';
import { Badge } from '../ui/badge';
import { VendorRecentOrder, VendorLowStockProduct } from '../../services/analyticsService';
import { safeFormatCurrency } from '../../utils/currency';
import { VendorCard } from './VendorCard';

function formatDateLabel(value?: string) {
  if (!value) return 'Recently';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function getOrderStatusClasses(status: string) {
  const normalized = status.toLowerCase();
  if (['delivered', 'paid'].includes(normalized)) {
    return 'border-[var(--vendor-accent-success)] text-[var(--vendor-accent-success)] bg-[var(--vendor-accent-success-bg)]';
  }
  if (['processing', 'shipped', 'in_transit'].includes(normalized)) {
    return 'border-[var(--color-info)] text-[var(--color-info)] bg-[var(--color-info-bg)]';
  }
  if (['cancelled', 'failed'].includes(normalized)) {
    return 'border-[var(--color-error)] text-[var(--color-error)] bg-[var(--color-error-bg)]';
  }
  return 'border-[var(--vendor-accent-warning)] text-[var(--vendor-accent-warning)] bg-[var(--vendor-accent-warning-bg)]';
}

interface PulseFeedProps {
  orders: VendorRecentOrder[];
  lowStockProducts: VendorLowStockProduct[];
}

export function VendorPulseFeed({ orders, lowStockProducts }: PulseFeedProps) {
  const items = [
    ...orders.slice(0, 5).map((order) => ({
      id: `order-${order.id}`,
      type: 'order' as const,
      title: order.customer_name,
      subtitle: `${order.order_number} • ${formatDateLabel(order.created_at)}`,
      value: safeFormatCurrency(order.vendor_total),
      meta: order.status,
      detail: order.products.slice(0, 2).join(', ') || 'Products pending',
    })),
    ...lowStockProducts.slice(0, 3).map((product) => ({
      id: `stock-${product.id}`,
      type: 'stock' as const,
      title: product.name,
      subtitle: 'Low stock alert',
      value: `${product.stock} left`,
      meta: 'low_stock',
      detail: String(product.status).replace(/_/g, ' '),
    })),
  ].slice(0, 8);

  if (items.length === 0) {
    return (
      <VendorCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--vendor-accent-action-bg)] flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-[var(--vendor-accent-action)]" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-text-heading)] vendor-heading">Pulse Feed</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Recent activity across your store</p>
          </div>
        </div>
        <div className="rounded-[16px] border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)] vendor-body">
          Activity will appear here as orders and inventory events come in.
        </div>
      </VendorCard>
    );
  }

  return (
    <VendorCard glow className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[var(--vendor-accent-action-bg)] flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-[var(--vendor-accent-action)]" />
        </div>
        <div>
          <h3 className="font-bold text-[var(--color-text-heading)] vendor-heading">Pulse Feed</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Live stream of orders & alerts</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-[16px] border border-[var(--color-border)]/60 bg-white/60 hover:bg-white transition-colors"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                item.type === 'stock'
                  ? 'bg-[var(--vendor-accent-warning-bg)]'
                  : 'bg-[var(--vendor-accent-success-bg)]'
              }`}
            >
              {item.type === 'stock' ? (
                <AlertTriangle className="w-4 h-4 text-[var(--vendor-accent-warning)]" />
              ) : (
                <Package className="w-4 h-4 text-[var(--vendor-accent-success)]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm text-[var(--color-text-heading)] truncate">{item.title}</p>
                <span className="text-sm font-bold text-[var(--color-text-heading)] shrink-0">{item.value}</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.subtitle}</p>
              <p className="text-xs text-[var(--color-text-body)] mt-1 truncate">{item.detail}</p>
              {item.type === 'order' && (
                <Badge variant="outline" className={`text-[10px] uppercase mt-2 ${getOrderStatusClasses(item.meta)}`}>
                  {String(item.meta).replace(/_/g, ' ')}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </VendorCard>
  );
}
