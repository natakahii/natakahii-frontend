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
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-heading)]">Subscription & Verification</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            Manage the seller plan behind your storefront benefits, catalog allowance, and verification tick.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full text-[var(--color-primary)] border-[var(--color-primary)] sm:w-auto"
            onClick={() => navigate('/vendor/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {error && !isLoading && (
        <Card className="border-[var(--color-error)] bg-[var(--color-error-bg)] shadow-sm">
          <CardContent className="p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--color-error)] shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-[var(--color-text-heading)]">Subscription settings unavailable</h2>
              <p className="text-sm text-[var(--color-text-body)]">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.95fr] gap-6">
        <Card className="border-[var(--color-border)] shadow-[var(--shadow-level-1)] overflow-hidden">
          <CardContent className="p-6 lg:p-7 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--color-primary)]">Current Verification</p>
                <h2 className="text-2xl font-bold text-[var(--color-text-heading)] mt-2">{verification.headline}</h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-2xl">{verification.detail}</p>
              </div>
              {isPremiumVerifiedVendor(vendor) && (
                <VendorVerificationBadge tone="hero" label="Verified vendor" />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">Current Plan</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-32 mt-3" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-[var(--color-text-heading)] mt-3">{currentPlan?.name || 'No plan assigned'}</p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-2">{formatPlanPrice(currentPlan)}</p>
                  </>
                )}
              </div>

              <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">Catalog Allowance</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-24 mt-3" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-[var(--color-text-heading)] mt-3">
                      {currentProductLimit ? `${currentProductLimit} products` : 'Unlimited'}
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-2">
                      {currentProductLimit
                        ? 'Upgrade when you need more room for your catalog.'
                        : 'This plan does not cap your product catalog.'}
                    </p>
                  </>
                )}
              </div>

              <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">Marketplace Badge</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-28 mt-3" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-[var(--color-text-heading)] mt-3">
                      {isPremiumVerifiedVendor(vendor) ? 'Unlocked' : 'Available'}
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)] mt-2">
                      {isPremiumVerifiedVendor(vendor)
                        ? 'Your storefront now carries the blue verification tick.'
                        : 'Upgrade to a paid vendor plan to unlock the verification tick.'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {!isPremiumVerifiedVendor(vendor) && (
              <div className="rounded-[24px] border border-[var(--color-primary)]/15 bg-[linear-gradient(135deg,rgba(20,36,144,0.04),rgba(255,105,49,0.05))] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-[var(--color-primary-bg)] p-3 text-[var(--color-primary)]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--color-text-heading)]">Upgrade for premium visibility</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                      Free-plan sellers keep approved-vendor status with no public badge, while paid plans unlock the verification tick and higher selling limits.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white"
                  onClick={() => {
                    if (recommendedUpgradePlan?.slug) {
                      setSelectedPlan(recommendedUpgradePlan.slug);
                    }
                  }}
                >
                  Explore Paid Plans
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] shadow-[var(--shadow-level-1)]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
              Plan Summary
            </CardTitle>
            <CardDescription>Review the plan you are about to keep or activate for your storefront.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </>
            ) : (
              <>
                <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">Selected Plan</p>
                  <p className="text-2xl font-bold text-[var(--color-text-heading)] mt-3">
                    {selectedPlanRecord?.name || currentPlan?.name || 'Choose a plan'}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-2">
                    {formatPlanPrice(selectedPlanRecord || currentPlan)}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-4">
                    {selectedPlanRecord?.description || currentPlan?.description || 'Seller plan managed by the Nataka Hii team.'}
                  </p>
                </div>

                <Button
                  type="button"
                  className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white"
                  disabled={!selectedPlan || isSaving}
                  onClick={handleSave}
                >
                  {isSaving ? 'Updating Plan...' : isCurrentSelection ? 'Keep Current Plan' : 'Activate Selected Plan'}
                </Button>

                {canUpgrade && (
                  <p className="text-xs text-[var(--color-text-muted)] text-center">
                    Paid plans unlock the verification tick shoppers now see across the marketplace.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <VendorSubscriptionPlan
        plans={plans}
        selectedPlan={selectedPlan}
        onSelectPlan={setSelectedPlan}
        isLoading={isLoading}
        error={error}
        title="Choose the plan behind your storefront"
        description="Free plans keep your store in approved-vendor status without a public badge. Paid plans unlock the verification tick and can raise your catalog ceiling."
        selectedLabel="Current choice"
        unselectedLabel="Choose plan"
      />
    </div>
  );
}
