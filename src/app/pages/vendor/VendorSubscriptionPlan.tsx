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
      <div className="bg-gradient-to-r from-[var(--vendor-bg)] to-[var(--vendor-bg-card)] rounded-[32px] p-8 border border-[var(--vendor-border)] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--vendor-accent-action)]/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10">
          <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">{title}</h3>
          <p className="text-[var(--vendor-text-muted-on-dark)] text-lg max-w-2xl leading-relaxed">{description}</p>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[400px] rounded-[32px] bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-[32px] border border-red-500/20 bg-red-500/5 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-bold text-white mb-2">Sync Error</p>
          <p className="text-red-400/80">{error}</p>
        </div>
      )}

      {!isLoading && !error && plans.length === 0 && (
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-[var(--vendor-text-muted-on-dark)] text-lg">No plans available at the moment.</p>
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
                className={`group relative text-left rounded-[32px] border p-6 transition-all duration-500 hover:scale-[1.02] ${
                  isSelected
                    ? 'border-[var(--vendor-accent-action)] bg-white shadow-2xl scale-[1.02] z-10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {isPremium && (
                  <div className="absolute -top-3 right-8 bg-gradient-to-r from-[var(--vendor-accent-action)] to-[#7c3aed] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Recommended
                  </div>
                )}

                <div className="flex items-center justify-between mb-8">
                  <div className={`rounded-2xl p-4 transition-colors duration-500 ${isSelected ? 'bg-[var(--vendor-accent-action-bg)] text-[var(--vendor-accent-action)]' : 'bg-white/10 text-white'}`}>
                    {getPlanIcon(plan)}
                  </div>
                  {isSelected && (
                    <div className="bg-[var(--vendor-accent-success-bg)] text-[var(--vendor-accent-success)] p-1.5 rounded-full">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <h4 className={`text-sm font-black uppercase tracking-[0.2em] mb-2 ${isSelected ? 'text-[var(--vendor-accent-action)]' : 'text-white/40'}`}>
                    {plan.name}
                  </h4>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black tracking-tight ${isSelected ? 'text-[var(--vendor-bg)]' : 'text-white'}`}>
                      {formatPlanPrice(plan).split(' / ')[0]}
                    </span>
                    {!plan.is_free && (
                      <span className={`text-sm font-medium ${isSelected ? 'text-[var(--vendor-bg)]/60' : 'text-white/40'}`}>
                        /{plan.billing_cycle === 'yearly' ? 'year' : 'mo'}
                      </span>
                    )}
                  </div>
                </div>

                <p className={`text-sm leading-relaxed mb-8 min-h-[48px] ${isSelected ? 'text-[var(--vendor-bg)]/70' : 'text-white/50'}`}>
                  {plan.description || 'Professional seller tools to help you scale your business in our marketplace.'}
                </p>

                <div className={`space-y-4 mb-8 p-6 rounded-2xl ${isSelected ? 'bg-[var(--vendor-bg)]/5' : 'bg-white/5'}`}>
                  {planFeatures.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className={`mt-1 rounded-full p-0.5 ${isSelected ? 'bg-[var(--vendor-accent-action)] text-white' : 'bg-white/20 text-white/40'}`}>
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-[var(--vendor-bg)]' : 'text-white/80'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={`w-full py-4 rounded-2xl font-bold text-center transition-all duration-300 ${
                  isSelected 
                    ? 'bg-[var(--vendor-accent-action)] text-white shadow-xl' 
                    : 'bg-white/10 text-white hover:bg-white/20'
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
