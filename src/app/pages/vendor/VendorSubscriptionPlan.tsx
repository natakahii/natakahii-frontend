import { AlertCircle, CheckCircle2, Rocket, ShieldCheck } from 'lucide-react';
import { VendorSubscriptionPlanRecord } from '../../services/vendorApplicationService';
import { formatCurrency } from '../../utils/currency';

interface VendorSubscriptionPlanProps {
  plans: VendorSubscriptionPlanRecord[];
  selectedPlan: string;
  onSelectPlan: (plan: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

function getPlanIcon(plan: VendorSubscriptionPlanRecord) {
  if (plan.is_free) {
    return <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />;
  }

  if ((plan.product_limit ?? 0) >= 200 || !plan.product_limit) {
    return <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />;
  }

  return <Rocket className="w-5 h-5 text-[var(--color-primary)]" />;
}

function formatPlanPrice(plan: VendorSubscriptionPlanRecord) {
  if (plan.is_free) {
    return 'Free';
  }

  const amount = Number(plan.price ?? 0);
  const billingLabel = plan.billing_cycle === 'yearly' ? 'year' : 'month';

  return `${formatCurrency(Number.isFinite(amount) ? amount : 0)} / ${billingLabel}`;
}

function getPlanFeatures(plan: VendorSubscriptionPlanRecord) {
  const features = (plan.features ?? []).filter((feature): feature is string => Boolean(feature && feature.trim()));

  if (features.length > 0) {
    return features;
  }

  const fallbackFeatures: string[] = [];

  if (plan.product_limit) {
    fallbackFeatures.push(`Up to ${plan.product_limit} products`);
  } else {
    fallbackFeatures.push('Unlimited products');
  }

  fallbackFeatures.push(plan.is_free ? 'Core seller tools' : 'Expanded seller tools');

  return fallbackFeatures;
}

export function VendorSubscriptionPlan({
  plans,
  selectedPlan,
  onSelectPlan,
  isLoading = false,
  error = null,
}: VendorSubscriptionPlanProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] bg-white border border-[var(--color-border)] p-6 shadow-sm">
        <h3 className="text-xl font-bold text-[var(--color-text-heading)] mb-2">Choose a subscription plan</h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          Plans are managed by the Nataka Hii team. Pick the option that fits your store today, and we will review it together with your vendor application.
        </p>
      </div>

      {isLoading && (
        <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-text-muted)]">
          Loading available subscription plans...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-[24px] border border-[var(--color-error)] bg-[var(--color-error-bg)] p-5 text-sm text-[var(--color-error)]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">We could not load the subscription options.</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && plans.length === 0 && (
        <div className="rounded-[24px] border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-text-muted)]">
          No subscription plans are available right now. Please try again shortly.
        </div>
      )}

      {!isLoading && !error && plans.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.slug;
            const planFeatures = getPlanFeatures(plan);

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => onSelectPlan(plan.slug)}
                className={`group text-left rounded-[24px] border p-5 transition-all duration-200 focus:outline-none ${
                  isSelected
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-bg)] shadow-[var(--shadow-level-2)]'
                    : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-page)]'
                }`}
              >
                <div className="flex items-center justify-between mb-4 gap-4">
                  <div>
                    <span className="block text-sm font-semibold text-[var(--color-primary)] uppercase tracking-[0.24em]">
                      {plan.name}
                    </span>
                    <p className="mt-2 text-[22px] font-bold text-[var(--color-text-heading)]">{formatPlanPrice(plan)}</p>
                  </div>
                  <div className="rounded-full bg-[var(--color-primary-bg)] p-3">
                    {getPlanIcon(plan)}
                  </div>
                </div>

                {plan.is_free && (
                  <span className="inline-flex items-center rounded-full bg-[var(--color-primary-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)] mb-4">
                    Free starter option
                  </span>
                )}

                <p className="text-sm text-[var(--color-text-muted)] mb-5">
                  {plan.description || 'Seller plan managed by the Nataka Hii team.'}
                </p>

                <ul className="space-y-3">
                  {planFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[var(--color-text-body)]">
                      <span className="text-[var(--color-primary)]">-</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      isSelected ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select plan'}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {plan.product_limit ? `${plan.product_limit} products` : 'Unlimited catalog'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
