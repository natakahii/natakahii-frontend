import { AlertCircle, CheckCircle2, Rocket, ShieldCheck } from 'lucide-react';
import { VendorSubscriptionPlanRecord } from '../../services/vendorApplicationService';
import { formatCurrency } from '../../utils/currency';

interface VendorSubscriptionPlanProps {
  plans: VendorSubscriptionPlanRecord[];
  selectedPlan: string;
  onSelectPlan: (plan: string) => void;
  isLoading?: boolean;
  error?: string | null;
  title?: string;
  description?: string;
  selectedLabel?: string;
  unselectedLabel?: string;
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
  title = 'Pick Your Professional Growth Plan',
  description = 'Choose a plan that scales with your business goals. Each plan unlocks unique marketplace benefits.',
  selectedLabel = 'Current Plan',
  unselectedLabel = 'Choose Plan',
}: VendorSubscriptionPlanProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-bg-card)] rounded-[32px] p-8 border border-[var(--color-border)] shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-extrabold text-[var(--color-text-heading)] mb-3 tracking-tight">{title}</h3>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl leading-relaxed">{description}</p>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[400px] rounded-[32px] bg-[var(--color-bg-card)] animate-pulse border border-[var(--color-border)]" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-[32px] border border-red-500/20 bg-red-500/5 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-bold text-[var(--color-text-heading)] mb-2">Sync Error</p>
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {!isLoading && !error && plans.length === 0 && (
        <div className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-12 text-center">
          <p className="text-[var(--color-text-muted)] text-lg">No plans available at the moment.</p>
        </div>
      )}

      {!isLoading && !error && plans.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.slug;
            const planFeatures = getPlanFeatures(plan);
            const isPremium = !plan.is_free;

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => onSelectPlan(plan.slug)}
                className={`group relative text-left rounded-[32px] border p-6 transition-all duration-500 hover:shadow-xl ${
                  isSelected
                    ? 'border-[var(--vendor-accent-action)] bg-white shadow-2xl scale-[1.02] z-10'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--vendor-accent-action)]/30'
                }`}
              >
                {isPremium && (
                  <div className="absolute -top-3 right-8 bg-[var(--vendor-accent-action)] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Recommended
                  </div>
                )}

                <div className="flex items-center justify-between mb-8">
                  <div className={`rounded-2xl p-4 transition-colors duration-500 ${isSelected ? 'bg-[var(--vendor-accent-action-bg)] text-[var(--vendor-accent-action)]' : 'bg-[var(--color-bg-page)] text-[var(--color-text-muted)]'}`}>
                    {getPlanIcon(plan)}
                  </div>
                  {isSelected && (
                    <div className="bg-[var(--color-success-bg)] text-[var(--color-success)] p-1.5 rounded-full">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <h4 className={`text-sm font-black uppercase tracking-[0.2em] mb-2 ${isSelected ? 'text-[var(--vendor-accent-action)]' : 'text-[var(--color-text-muted)]'}`}>
                    {plan.name}
                  </h4>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black tracking-tight ${isSelected ? 'text-[var(--color-text-heading)]' : 'text-[var(--color-text-heading)]'}`}>
                      {formatPlanPrice(plan).split(' / ')[0]}
                    </span>
                    {!plan.is_free && (
                      <span className={`text-sm font-medium ${isSelected ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-muted)]'}`}>
                        /{plan.billing_cycle === 'yearly' ? 'year' : 'mo'}
                      </span>
                    )}
                  </div>
                </div>

                <p className={`text-sm leading-relaxed mb-8 min-h-[48px] ${isSelected ? 'text-[var(--color-text-body)]' : 'text-[var(--color-text-body)]'}`}>
                  {plan.description || 'Professional seller tools to help you scale your business in our marketplace.'}
                </p>

                <div className={`space-y-4 mb-8 p-6 rounded-2xl ${isSelected ? 'bg-[var(--color-bg-page)]' : 'bg-[var(--color-bg-page)]'}`}>
                  {planFeatures.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className={`mt-1 rounded-full p-0.5 ${isSelected ? 'bg-[var(--vendor-accent-action)] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-[var(--color-text-heading)]' : 'text-[var(--color-text-heading)]'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={`w-full py-4 rounded-2xl font-bold text-center transition-all duration-300 ${
                  isSelected 
                    ? 'bg-[var(--vendor-accent-action)] text-white shadow-xl' 
                    : 'bg-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-page)]'
                }`}>
                  {isSelected ? selectedLabel : unselectedLabel}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
