import { CheckCircle2, ShieldCheck, Rocket } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const plans = [
  {
    id: 'basic',
    title: 'Basic Account',
    price: `${formatCurrency(0)} / month`,
    description: 'Start selling with essential tools for beginner vendors.',
    features: [
      'Up to 50 products',
      'Standard product visibility',
      'Basic support',
      'Monthly payouts',
    ],
    icon: <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />,
  },
  {
    id: 'pro',
    title: 'Pro Account',
    price: `${formatCurrency(2499)} / month`,
    description: 'Grow faster with analytics, priority placement and better support.',
    features: [
      'Up to 250 products',
      'Priority placement in search',
      'Advanced sales reports',
      'Faster payout processing',
    ],
    icon: <Rocket className="w-5 h-5 text-[var(--color-primary)]" />,
  },
  {
    id: 'enterprise',
    title: 'Enterprise Account',
    price: `${formatCurrency(7499)} / month`,
    description: 'Premium onboarding, dedicated support and unlimited scale.',
    features: [
      'Unlimited products',
      'Dedicated account manager',
      'Custom onboarding & training',
      'Lowest transaction fees',
    ],
    icon: <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />,
  },
];

interface VendorSubscriptionPlanProps {
  selectedPlan: 'basic' | 'pro' | 'enterprise';
  onSelectPlan: (plan: 'basic' | 'pro' | 'enterprise') => void;
}

export function VendorSubscriptionPlan({ selectedPlan, onSelectPlan }: VendorSubscriptionPlanProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] bg-white border border-[var(--color-border)] p-6 shadow-sm">
        <h3 className="text-xl font-bold text-[var(--color-text-heading)] mb-2">Choose a subscription plan</h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          Select the plan that fits your store size and growth goals. Each plan includes the core vendor tools you need to sell on Nataka Hii.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelectPlan(plan.id as 'basic' | 'pro' | 'enterprise')}
              className={`group text-left rounded-[24px] border p-5 transition-all duration-200 focus:outline-none ${
                isSelected
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-bg)] shadow-[var(--shadow-level-2)]'
                  : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-page)]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="block text-sm font-semibold text-[var(--color-primary)] uppercase tracking-[0.24em]">
                    {plan.title}
                  </span>
                  <p className="mt-2 text-[22px] font-bold text-[var(--color-text-heading)]">{plan.price}</p>
                </div>
                <div className="rounded-full bg-[var(--color-primary-bg)] p-3">
                  {plan.icon}
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mb-5">{plan.description}</p>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[var(--color-text-body)]">
                    <span className="text-[var(--color-primary)]">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  isSelected ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}>
                  {isSelected ? 'Selected' : 'Select plan'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
