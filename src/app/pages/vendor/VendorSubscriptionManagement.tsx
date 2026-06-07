import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { useToast } from '../../components/ui/toast';
import { useAuth } from '../../providers/AuthProvider';
import { AuthSubscriptionPlan, AuthVendor } from '../../services/authService';
import { fetchVendorSubscriptionPlans, VendorSubscriptionPlanRecord } from '../../services/vendorApplicationService';
import { fetchVendorSubscription, updateVendorSubscriptionPlan } from '../../services/vendorSubscriptionService';
import { formatCurrency } from '../../utils/currency';
import { getVendorVerificationDescriptor, isPremiumVerifiedVendor } from '../../utils/vendorVerification';
import { VendorVerificationBadge } from '../../components/ui/badge';
import { VendorSubscriptionPlan } from './VendorSubscriptionPlan';

function formatPlanPrice(plan: Pick<AuthSubscriptionPlan, 'is_free' | 'price' | 'billing_cycle'> | Pick<VendorSubscriptionPlanRecord, 'is_free' | 'price' | 'billing_cycle'> | null | undefined) {
  if (!plan) {
    return 'No plan assigned';
  }

  if (plan.is_free) {
    return 'Free';
  }

  const billingLabel = plan.billing_cycle === 'yearly' ? 'year' : 'month';
  return `${formatCurrency(Number(plan.price ?? 0))} / ${billingLabel}`;
}

export function VendorSubscriptionManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshCurrentUser } = useAuth();
  const [vendor, setVendor] = useState<AuthVendor | null>(user?.vendor ?? null);
  const [plans, setPlans] = useState<VendorSubscriptionPlanRecord[]>([]);
  const [selectedPlan, setSelectedPlan] = useState(user?.vendor?.subscription_plan?.slug ?? '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setVendor(user?.vendor ?? null);
    setSelectedPlan((currentSelection) => currentSelection || user?.vendor?.subscription_plan?.slug || '');
  }, [user?.vendor]);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError(null);

    Promise.all([fetchVendorSubscription(), fetchVendorSubscriptionPlans()])
      .then(([subscriptionResponse, plansResponse]) => {
        if (!isMounted) {
          return;
        }

        const nextVendor = subscriptionResponse.vendor;
        const nextPlans = plansResponse.plans ?? [];

        setVendor(nextVendor);
        setPlans(nextPlans);
        setSelectedPlan(nextVendor.subscription_plan?.slug || nextPlans.find((plan) => plan.is_free)?.slug || nextPlans[0]?.slug || '');
      })
      .catch((nextError: any) => {
        if (!isMounted) {
          return;
        }

        setVendor(user?.vendor ?? null);
        setPlans([]);
        setError(nextError?.message || 'Unable to load your subscription settings right now.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.vendor]);

  const verification = useMemo(() => getVendorVerificationDescriptor(vendor), [vendor]);
  const currentPlan = vendor?.subscription_plan ?? null;
  const selectedPlanRecord = useMemo(
    () => plans.find((plan) => plan.slug === selectedPlan) ?? null,
    [plans, selectedPlan],
  );
  const recommendedUpgradePlan = useMemo(
    () => plans.find((plan) => !plan.is_free) ?? null,
    [plans],
  );
  const isCurrentSelection = Boolean(selectedPlan && selectedPlan === currentPlan?.slug);
  const canUpgrade = Boolean(vendor?.can_upgrade_subscription);
  const currentProductLimit = vendor?.product_limit ?? currentPlan?.product_limit ?? null;

  async function handleSave() {
    if (!selectedPlan || isSaving) {
      return;
    }

    if (isCurrentSelection) {
      toast({
        type: 'info',
        title: 'Plan already active',
        message: 'Your current vendor plan is already selected.',
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await updateVendorSubscriptionPlan(selectedPlan);
      setVendor(response.vendor);
      await refreshCurrentUser();

      toast({
        type: 'success',
        title: 'Plan updated',
        message: response.message || 'Your vendor subscription plan was updated successfully.',
      });
    } catch (nextError: any) {
      toast({
        type: 'error',
        title: 'Unable to update plan',
        message: nextError?.message || 'Please try again in a moment.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Subscription & Growth</h1>
          <p className="text-[var(--vendor-text-muted-on-dark)] mt-2 text-lg">
            Manage your professional presence and marketplace benefits.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-white/10 text-white hover:bg-white/5 rounded-2xl px-6 h-12"
          onClick={() => navigate('/vendor/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>

      {error && !isLoading && (
        <div className="rounded-[32px] border border-red-500/20 bg-red-500/5 p-6 flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-8">
          {/* Main Plan Selection */}
          <VendorSubscriptionPlan
            plans={plans}
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            isLoading={isLoading}
          />

          {/* Verification Status Card */}
          <div className="bg-gradient-to-br from-[var(--vendor-bg-card)] to-[var(--vendor-bg)] rounded-[40px] p-8 border border-[var(--vendor-border)] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <ShieldCheck className="w-48 h-48" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--vendor-accent-action)] mb-2 block">Identity & Trust</span>
                  <h2 className="text-3xl font-black text-white">{verification.headline}</h2>
                </div>
                {isPremiumVerifiedVendor(vendor) && (
                  <div className="bg-[var(--vendor-accent-action)] text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-[var(--vendor-accent-action)]/20">
                    <ShieldCheck className="w-5 h-5" />
                    Premium Verified
                  </div>
                )}
              </div>

              <p className="text-[var(--vendor-text-muted-on-dark)] text-lg leading-relaxed max-w-3xl mb-8">
                {verification.detail}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Marketplace Badge', value: isPremiumVerifiedVendor(vendor) ? 'Unlocked' : 'Locked', icon: Sparkles },
                  { label: 'Search Priority', value: isPremiumVerifiedVendor(vendor) ? 'Maximum' : 'Standard', icon: ArrowUpRight },
                  { label: 'Storefront Tools', value: 'Pro Suite', icon: ShieldCheck }
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-[24px] p-6 border border-white/5 hover:border-white/10 transition-colors">
                    <stat.icon className="w-6 h-6 text-[var(--vendor-accent-action)] mb-4" />
                    <p className="text-xs font-bold text-[var(--vendor-text-muted-on-dark)] uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-xl font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-black/5">
              <h3 className="text-2xl font-black text-[var(--vendor-bg)] mb-6">Plan Summary</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center py-4 border-b border-black/5">
                  <span className="text-[var(--color-text-muted)] font-medium">New Plan</span>
                  <span className="font-black text-[var(--vendor-bg)]">{selectedPlanRecord?.name || '---'}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-black/5">
                  <span className="text-[var(--color-text-muted)] font-medium">Price</span>
                  <span className="font-black text-[var(--vendor-accent-action)] text-xl">
                    {selectedPlanRecord ? formatPlanPrice(selectedPlanRecord) : '---'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-[var(--color-text-muted)] font-medium">Products</span>
                  <span className="font-black text-[var(--vendor-bg)]">
                    {selectedPlanRecord?.product_limit || 'Unlimited'}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving || isCurrentSelection || !selectedPlan}
                className={`w-full h-16 rounded-[24px] font-black text-lg transition-all duration-300 ${
                  isCurrentSelection 
                    ? 'bg-black/5 text-black/40 cursor-default' 
                    : 'bg-[var(--vendor-accent-action)] hover:bg-[var(--vendor-accent-action)]/90 text-white shadow-xl shadow-[var(--vendor-accent-action)]/20'
                }`}
              >
                {isSaving ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : isCurrentSelection ? (
                  'Active Plan'
                ) : (
                  'Confirm Upgrade'
                )}
              </Button>

              <p className="text-center text-xs text-[var(--color-text-muted)] mt-6 font-medium leading-relaxed">
                By upgrading, you agree to our vendor terms. Changes take effect immediately after successful payment.
              </p>
            </div>

            {/* Quick Tip */}
            <div className="mt-6 bg-[var(--vendor-accent-action)]/10 rounded-[32px] p-6 border border-[var(--vendor-accent-action)]/20">
              <div className="flex gap-4">
                <div className="bg-[var(--vendor-accent-action)] text-white p-2 rounded-xl h-fit">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium text-[var(--vendor-bg)]/80 leading-relaxed">
                  Paid plans increase your storefront trust score by <span className="font-bold text-[var(--vendor-accent-action)]">45%</span> on average.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
