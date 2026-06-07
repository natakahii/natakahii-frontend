import { getImageUrl } from '../../../utils/images';
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';

interface OrderSummaryProps {
  items: any[];
  subtotal: number;
  platformFee: number;
  shippingCost: number;
  total: number;
  shippingMethod: string;
  shippingProviders: any[];
  formatCurrency: (v: number) => string;
}

export function OrderSummary({
  items,
  subtotal,
  platformFee,
  shippingCost,
  total,
  formatCurrency,
}: OrderSummaryProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-4 bg-[var(--color-bg-page)] rounded-[16px] p-4 border border-[var(--color-border)]/50">
            <div className="w-16 h-16 rounded-[12px] overflow-hidden bg-white shrink-0 border border-[var(--color-border)]">
              <ImageWithFallback 
                src={getImageUrl(item.product?.images?.[0]?.image_path)} 
                alt={item.product?.name || 'Product'} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[14px] text-[var(--color-text-heading)] truncate">
                {item.product?.name || 'Product'}
              </h3>
              <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                {item.variant_id ? `Variant: #${item.variant_id}` : 'Default'} · Qty: {item.quantity}
              </p>
              <p className="text-[14px] font-bold text-[var(--color-accent)] mt-1">
                {formatCurrency((item.product?.effective_price ?? item.product?.price ?? 0) * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
        <div className="flex justify-between text-[14px] font-medium text-[var(--color-text-muted)]">
          <span>Subtotal</span>
          <span className="text-[var(--color-text-heading)]">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[14px] font-medium text-[var(--color-text-muted)]">
          <span>Service Fee (2%)</span>
          <span className="text-[var(--color-text-heading)]">{formatCurrency(platformFee)}</span>
        </div>
        <div className="flex justify-between text-[14px] font-medium text-[var(--color-text-muted)]">
          <span>Shipping Fee</span>
          <span className="text-[var(--color-text-heading)]">
            {shippingCost > 0 ? formatCurrency(shippingCost) : 'Free'}
          </span>
        </div>
        <div className="flex justify-between text-[16px] font-bold text-[var(--color-text-heading)] pt-3 border-t border-[var(--color-border)]">
          <span>Total Amount</span>
          <span className="text-[var(--color-accent)]">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
