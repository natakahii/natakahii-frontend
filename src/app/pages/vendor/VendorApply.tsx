import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight,
  Building,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Store,
  UploadCloud,
  User,
  XCircle,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { FormField } from '../../components/ui/form-field';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../components/ui/toast';
import { VendorSubscriptionPlan } from './VendorSubscriptionPlan';
import { useAuth } from '../../providers/AuthProvider';
import { AuthUser, hasUserRole } from '../../services/authService';
import {
  fetchVendorSubscriptionPlans,
  fetchVendorApplicationStatus,
  submitVendorApplication,
  VendorApplicationPayload,
  VendorApplicationRecord,
  VendorVerificationDocumentType,
  VendorSubscriptionPlanRecord,
  vendorVerificationDocumentOptions,
} from '../../services/vendorApplicationService';
import { formatCurrency } from '../../utils/currency';

type ApplicationView = 'checking' | 'form' | 'pending' | 'rejected' | 'redirecting';
type ApplicationStep = 1 | 2 | 3;
type FieldErrors = Partial<Record<keyof VendorApplicationPayload, string>>;

const stepLabels: Record<ApplicationStep, string> = {
  1: 'Business Information',
  2: 'Location Details',
  3: 'Verification & Review',
};

const requiredFieldsByStep: Record<ApplicationStep, Array<keyof VendorApplicationPayload>> = {
  1: ['business_name', 'full_name', 'business_email', 'phone'],
  2: ['region', 'ward', 'street', 'address'],
  3: ['subscription_plan', 'verification_document_type', 'verification_document'],
};

function buildInitialForm(user: AuthUser | null, application?: VendorApplicationRecord | null): VendorApplicationPayload {
  return {
    business_name: application?.business_name || user?.vendor?.shop_name || '',
    business_email: application?.business_email || user?.email || '',
    full_name: application?.full_name || user?.name || '',
    phone: application?.phone || user?.phone || '',
    region: application?.region || '',
    city: application?.city || '',
    ward: application?.ward || '',
    street: application?.street || '',
    address: application?.address || '',
    description: application?.description || '',
    subscription_plan: application?.subscription_plan?.slug || '',
    verification_document_type: application?.verification_document_type || '',
    verification_document: null,
  };
}

function hasStartedForm(form: VendorApplicationPayload) {
  return Object.entries(form).some(([field, value]) => {
    if (field === 'subscription_plan') {
      return false;
    }

    if (field === 'verification_document') {
      return value instanceof File;
    }

    return typeof value === 'string' && value.trim().length > 0;
  });
}

function extractFieldErrors(error: any): FieldErrors {
  const errors = error?.data?.errors;

  if (!errors || typeof errors !== 'object') {
    return {};
  }

  return Object.entries(errors).reduce<FieldErrors>((result, [field, messages]) => {
    if (Array.isArray(messages) && messages[0]) {
      result[field as keyof VendorApplicationPayload] = String(messages[0]);
    }

    return result;
  }, {});
}

function getStepErrors(form: VendorApplicationPayload, targetStep: ApplicationStep): FieldErrors {
  const nextErrors: FieldErrors = {};

  for (const field of requiredFieldsByStep[targetStep]) {
    if (field === 'verification_document') {
      if (!form.verification_document) {
        nextErrors.verification_document = 'Upload one verification document before continuing.';
      }
      continue;
    }

    const value = form[field];

    if (typeof value !== 'string' || !value.trim()) {
      nextErrors[field] = 'This field is required.';
    }
  }

  if (targetStep === 1 && form.business_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.business_email.trim())) {
    nextErrors.business_email = 'Enter a valid business email address.';
  }

  return nextErrors;
}

function getDefaultPlanSlug(plans: VendorSubscriptionPlanRecord[]) {
  return plans.find((plan) => plan.is_free)?.slug || plans[0]?.slug || '';
}

function formatDocumentLabel(documentType?: VendorVerificationDocumentType | '' | null) {
  return vendorVerificationDocumentOptions.find((option) => option.value === documentType)?.label || 'Not selected yet';
}

function formatPlanSummary(plan?: VendorSubscriptionPlanRecord | null) {
  if (!plan) {
    return 'Not selected yet';
  }

  if (plan.is_free) {
    return `${plan.name} (Free)`;
  }

  const amount = Number(plan.price ?? 0);
  const billingLabel = plan.billing_cycle === 'yearly' ? 'year' : 'month';

  return `${plan.name} (${formatCurrency(Number.isFinite(amount) ? amount : 0)} / ${billingLabel})`;
}

function formatDate(dateString?: string) {
  if (!dateString) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function VendorApply() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshCurrentUser, user } = useAuth();
  const [view, setView] = useState<ApplicationView>('checking');
  const [step, setStep] = useState<ApplicationStep>(1);
  const [application, setApplication] = useState<VendorApplicationRecord | null>(null);
  const [form, setForm] = useState<VendorApplicationPayload>(() => buildInitialForm(user));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [plans, setPlans] = useState<VendorSubscriptionPlanRecord[]>([]);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    if (hasUserRole(user, 'vendor')) {
      navigate('/vendor/dashboard', { replace: true });
      return;
    }

    void loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, user]);

  useEffect(() => {
    void loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function syncApprovedAccess() {
    setView('redirecting');

    try {
      const refreshedUser = await refreshCurrentUser();

      if (refreshedUser && hasUserRole(refreshedUser, 'vendor')) {
        navigate('/vendor/dashboard', { replace: true });
        return;
      }

      setPageError('Your vendor application is approved, but your session has not updated yet. Please refresh your status again.');
    } catch (error: any) {
      setPageError(error?.message || 'Your application is approved, but we could not refresh your session yet.');
    }
  }

  async function loadPlans() {
    setIsLoadingPlans(true);
    setPlansError(null);

    try {
      const response = await fetchVendorSubscriptionPlans();
      const availablePlans = response.plans;
      const defaultPlanSlug = getDefaultPlanSlug(availablePlans);

      setPlans(availablePlans);
      setForm((currentForm) => (
        currentForm.subscription_plan
          ? currentForm
          : {
              ...currentForm,
              subscription_plan: defaultPlanSlug,
            }
      ));
    } catch (error: any) {
      setPlansError(error?.message || 'Unable to load subscription plans right now.');
    } finally {
      setIsLoadingPlans(false);
    }
  }

  async function loadStatus(options: { silent?: boolean } = {}) {
    if (options.silent) {
      setIsRefreshingStatus(true);
    } else {
      setView('checking');
    }

    setPageError(null);

    try {
      const response = await fetchVendorApplicationStatus();
      const latestApplication = response.application;

      setApplication(latestApplication);
      setFieldErrors({});

      if (!latestApplication) {
        setForm((currentForm) => (hasStartedForm(currentForm) ? currentForm : buildInitialForm(user)));
        setView('form');
        if (options.silent) {
          toast({
            type: 'info',
            title: 'Application Status',
            message: 'No application found.',
          });
        }
        return;
      }

      if (latestApplication.status === 'approved') {
        setForm(buildInitialForm(user, latestApplication));
        await syncApprovedAccess();
        return;
      }

      setForm(buildInitialForm(user, latestApplication));
      setStep(1);
      setView(latestApplication.status === 'pending' ? 'pending' : 'rejected');

      if (options.silent) {
        toast({
          type: latestApplication.status === 'rejected' ? 'error' : 'info',
          title: 'Application Status',
          message: `Current status: ${latestApplication.status}`,
        });
      }
    } catch (error: any) {
      setPageError(error?.message || 'Unable to load your vendor application right now.');
      setForm((currentForm) => (hasStartedForm(currentForm) ? currentForm : buildInitialForm(user)));
      setView('form');
    } finally {
      setIsRefreshingStatus(false);
    }
  }

  function updateField<K extends keyof VendorApplicationPayload>(field: K, value: VendorApplicationPayload[K]) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setPageError(null);

    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleVerificationDocumentChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] || null;
    updateField('verification_document', nextFile);
    event.target.value = '';
  }

  function validateStep(targetStep: ApplicationStep) {
    const nextErrors = getStepErrors(form, targetStep);

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      ...nextErrors,
    }));

    return Object.keys(nextErrors).length === 0;
  }

  function validateForm() {
    const stepOneErrors = getStepErrors(form, 1);
    const stepTwoErrors = getStepErrors(form, 2);
    const stepThreeErrors = getStepErrors(form, 3);

    setFieldErrors({
      ...stepOneErrors,
      ...stepTwoErrors,
      ...stepThreeErrors,
    });

    if (Object.keys(stepOneErrors).length > 0) {
      setStep(1);
      return false;
    }

    if (Object.keys(stepTwoErrors).length > 0) {
      setStep(2);
      return false;
    }

    if (Object.keys(stepThreeErrors).length > 0) {
      setStep(3);
      return false;
    }

    return true;
  }

  function handleContinue() {
    if (!validateStep(step)) {
      return;
    }

    setStep((currentStep) => Math.min(currentStep + 1, 3) as ApplicationStep);
  }

  function handleBack() {
    setStep((currentStep) => Math.max(currentStep - 1, 1) as ApplicationStep);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step < 3) {
      handleContinue();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setPageError(null);

    try {
      const payload: VendorApplicationPayload = {
        ...form,
        business_name: form.business_name.trim(),
        business_email: form.business_email.trim(),
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        region: form.region.trim(),
        city: form.city?.trim() ?? '',
        ward: form.ward.trim(),
        street: form.street.trim(),
        address: form.address.trim(),
        description: form.description?.trim() ?? '',
        subscription_plan: form.subscription_plan.trim(),
        verification_document_type: form.verification_document_type.trim() as VendorVerificationDocumentType | '',
        verification_document: form.verification_document,
      };

      const response = await submitVendorApplication(payload);
      setApplication(response.application);
      setFieldErrors({});
      setView('pending');
      setStep(1);
      toast({
        type: 'success',
        title: 'Application submitted',
        message: response.message,
      });
    } catch (error: any) {
      const nextFieldErrors = extractFieldErrors(error);
      const message = error?.message || 'Unable to submit your vendor application right now.';

      setFieldErrors(nextFieldErrors);
      setPageError(message);

      if (message === 'You are already a vendor.') {
        await syncApprovedAccess();
        return;
      }

      if (message === 'You already have a pending vendor application.') {
        await loadStatus({ silent: true });
        return;
      }

      toast({
        type: 'error',
        title: 'Submission failed',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedPlan = useMemo(() => (
    plans.find((plan) => plan.slug === form.subscription_plan) || application?.subscription_plan || null
  ), [application, form.subscription_plan, plans]);

  const reviewRows = useMemo(() => ([
    { label: 'Shop Display Name', value: form.business_name || 'Not provided yet', icon: Building },
    { label: 'Contact Person', value: form.full_name || 'Not provided yet', icon: User },
    { label: 'Business Email', value: form.business_email || 'Not provided yet', icon: Mail },
    { label: 'Phone', value: form.phone || 'Not provided yet', icon: Phone },
    {
      label: 'Subscription Plan',
      value: formatPlanSummary(selectedPlan),
      icon: ShieldCheck,
    },
    {
      label: 'Location',
      value: [form.street, form.ward, form.city, form.region].filter(Boolean).join(', ') || 'Not provided yet',
      icon: MapPin,
    },
    { label: 'Address', value: form.address || 'Not provided yet', icon: MapPin },
    {
      label: 'Verification Document Type',
      value: formatDocumentLabel(form.verification_document_type),
      icon: ShieldCheck,
    },
    {
      label: 'Verification Document File',
      value: form.verification_document?.name || 'Upload required before submission.',
      icon: FileText,
    },
    { label: 'Description', value: form.description || 'No description added yet.', icon: Store },
  ]), [form, selectedPlan]);

  if (view === 'checking' || view === 'redirecting') {
    return (
      <div className="min-h-[70vh] bg-[var(--color-bg-page)] flex items-center justify-center px-4 py-12">
        <Card className="max-w-lg w-full text-center border-[var(--color-border)] shadow-[var(--shadow-level-2)]">
          <CardContent className="pt-12 pb-10 px-8 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[var(--color-text-heading)]">
                {view === 'checking' ? 'Checking your vendor status' : 'Unlocking your vendor workspace'}
              </h2>
              <p className="text-[15px] text-[var(--color-text-body)]">
                {view === 'checking'
                  ? 'We are loading your latest vendor application details.'
                  : 'Your application is approved. We are refreshing your session so you can access the dashboard.'}
              </p>
            </div>
            {pageError && (
              <div className="rounded-[16px] border border-[var(--color-error)] bg-[var(--color-error-bg)] px-4 py-3 text-left text-[13px] font-medium text-[var(--color-error)]">
                {pageError}
              </div>
            )}
            {view === 'redirecting' && pageError && (
              <Button
                variant="outline"
                className="mx-auto"
                onClick={() => void loadStatus({ silent: true })}
                isLoading={isRefreshingStatus}
              >
                Retry Status Refresh
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'pending') {
    return (
      <div className="min-h-[70vh] bg-[var(--color-bg-page)] flex items-center justify-center px-4 py-12">
        <Card className="max-w-xl w-full text-center border-[var(--color-border)] shadow-[var(--shadow-level-2)]">
          <CardContent className="pt-12 pb-10 px-8 space-y-6">
            <div className="w-20 h-20 bg-[var(--color-warning-bg)] rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 text-[var(--color-warning)]" />
            </div>
            <Badge className="bg-[var(--color-warning)] text-white hover:bg-[var(--color-warning)] mx-auto px-4 py-1">
              Application Pending Review
            </Badge>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[var(--color-text-heading)]">Your application is under review</h2>
              <p className="text-[15px] text-[var(--color-text-body)]">
                Submitted {formatDate(application?.created_at)}. Our team will review your business details and identification document before activating your seller workspace.
              </p>
            </div>
            <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 text-left text-[14px] text-[var(--color-text-body)] space-y-3">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-[var(--color-primary)]" />
                <span className="font-semibold">{application?.business_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--color-primary)]" />
                <span>{application?.business_email}</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
                <span>{formatPlanSummary(application?.subscription_plan)}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                <span>{[application?.street, application?.ward, application?.city, application?.region].filter(Boolean).join(', ')}</span>
              </div>
              {application?.has_verification_document && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-[var(--color-primary)] mt-0.5" />
                  <div>
                    <p className="font-semibold text-[var(--color-text-heading)]">{application?.verification_document_type_label || 'Verification document'}</p>
                    <p className="text-[13px] text-[var(--color-text-body)]">{application?.verification_document_original_name || 'Document uploaded'}</p>
                  </div>
                </div>
              )}
            </div>
            {pageError && (
              <div className="rounded-[16px] border border-[var(--color-error)] bg-[var(--color-error-bg)] px-4 py-3 text-left text-[13px] font-medium text-[var(--color-error)]">
                {pageError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => void loadStatus({ silent: true })}
                isLoading={isRefreshingStatus}
              >
                <RefreshCw className="w-4 h-4" />
                Check Status
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/profile')}>
                Back to Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'rejected') {
    return (
      <div className="min-h-[70vh] bg-[var(--color-bg-page)] flex items-center justify-center px-4 py-12">
        <Card className="max-w-xl w-full border-[var(--color-border)] shadow-[var(--shadow-level-2)]">
          <CardContent className="pt-12 pb-10 px-8 space-y-6 text-center">
            <div className="w-20 h-20 bg-[var(--color-error-bg)] rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-[var(--color-error)]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[var(--color-text-heading)]">Your last application was not approved</h2>
              <p className="text-[15px] text-[var(--color-text-body)]">
                Review the feedback below, update your details, and submit a new application when you are ready.
              </p>
            </div>
            {application?.has_verification_document && (
              <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-5 py-4 text-left">
                <p className="text-[12px] font-bold uppercase tracking-[0.3px] text-[var(--color-text-muted)] mb-2">Previous verification document</p>
                <p className="text-[14px] font-semibold text-[var(--color-text-heading)]">{application?.verification_document_type_label || 'Verification document'}</p>
                <p className="text-[13px] text-[var(--color-text-body)]">{application?.verification_document_original_name || 'Document uploaded'}</p>
              </div>
            )}
            <div className="rounded-[18px] border border-[var(--color-error)] bg-[var(--color-error-bg)] px-5 py-4 text-left">
              <p className="text-[12px] font-bold uppercase tracking-[0.3px] text-[var(--color-error)] mb-2">Rejection reason</p>
              <p className="text-[14px] text-[var(--color-text-heading)]">
                {application?.rejection_reason || 'The review team requested updated business details.'}
              </p>
            </div>
            {pageError && (
              <div className="rounded-[16px] border border-[var(--color-error)] bg-[var(--color-error-bg)] px-4 py-3 text-left text-[13px] font-medium text-[var(--color-error)]">
                {pageError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white gap-2"
                onClick={() => {
                  setStep(1);
                  setPageError(null);
                  setView('form');
                }}
              >
                Update and Reapply
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => void loadStatus({ silent: true })}
                isLoading={isRefreshingStatus}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-primary-darker)] mb-2">Sell on Nataka Hii</h2>
            <p className="text-[var(--color-text-body)]">
              Start your vendor enrollment so we can review your business and unlock your seller workspace.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                title: 'Verified Seller Trust',
                description: 'Every application is reviewed with a government-issued identity document before a vendor can publish products on the marketplace.',
                icon: ShieldCheck,
              },
              {
                title: 'Fast Store Activation',
                description: 'Approved vendors can move straight into the dashboard and begin managing inventory.',
                icon: Store,
              },
              {
                title: 'Location-Ready Fulfillment',
                description: 'We collect your business address early so shipping and dropoff flows can build on it later.',
                icon: MapPin,
              },
              {
                title: 'Real Seller Workspace',
                description: 'This is now a live application flow backed by the Nataka Hii API, not a demo wizard.',
                icon: CheckCircle2,
              },
            ].map((benefit) => (
              <div key={benefit.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center shrink-0">
                  <benefit.icon className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text-heading)]">{benefit.title}</h3>
                  <p className="text-sm text-[var(--color-text-body)]">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <Card className="border-[var(--color-border)] shadow-[var(--shadow-level-2)]">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        stepNumber === step
                          ? 'bg-[var(--color-accent)] text-white'
                          : stepNumber < step
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--color-primary-bg)] text-[var(--color-text-muted)]'
                      }`}
                    >
                      {stepNumber < step ? <CheckCircle2 className="w-5 h-5" /> : stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div
                        className={`w-10 sm:w-16 h-1 mx-2 rounded ${
                          stepNumber < step ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <CardTitle className="text-2xl text-[var(--color-text-heading)]">{stepLabels[step]}</CardTitle>
              <CardDescription>
                {step === 1 && 'Tell us who will manage the business account.'}
                {step === 2 && 'Share the business location details we need for seller verification.'}
                {step === 3 && 'Choose your seller plan, add one verification document, and review everything before sending it for approval.'}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                {application?.status === 'rejected' && (
                  <div className="rounded-[18px] border border-[var(--color-warning)] bg-[var(--color-warning-bg)] px-4 py-3 text-[13px] text-[var(--color-text-heading)]">
                    <span className="font-bold">Previous feedback:</span> {application.rejection_reason || 'Please review your business details before reapplying.'}
                  </div>
                )}

                {pageError && (
                  <div className="rounded-[18px] border border-[var(--color-error)] bg-[var(--color-error-bg)] px-4 py-3 text-[13px] font-medium text-[var(--color-error)]">
                    {pageError}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                    <FormField label="Shop Display Name" required error={fieldErrors.business_name}>
                      <Input
                        value={form.business_name}
                        onChange={(event) => updateField('business_name', event.target.value)}
                        placeholder="e.g. Mambo Jambo Store"
                        error={Boolean(fieldErrors.business_name)}
                      />
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Contact Person" required error={fieldErrors.full_name}>
                        <Input
                          value={form.full_name}
                          onChange={(event) => updateField('full_name', event.target.value)}
                          placeholder="Full name"
                          error={Boolean(fieldErrors.full_name)}
                        />
                      </FormField>
                      <FormField label="Business Email" required error={fieldErrors.business_email}>
                        <Input
                          type="email"
                          value={form.business_email}
                          onChange={(event) => updateField('business_email', event.target.value)}
                          placeholder="contact@example.com"
                          error={Boolean(fieldErrors.business_email)}
                        />
                      </FormField>
                    </div>

                    <FormField label="Phone Number" required error={fieldErrors.phone}>
                      <Input
                        type="tel"
                        value={form.phone}
                        onChange={(event) => updateField('phone', event.target.value)}
                        placeholder="+255 700 000 000"
                        error={Boolean(fieldErrors.phone)}
                      />
                    </FormField>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Region" required error={fieldErrors.region}>
                        <Input
                          value={form.region}
                          onChange={(event) => updateField('region', event.target.value)}
                          placeholder="Dar es Salaam"
                          error={Boolean(fieldErrors.region)}
                        />
                      </FormField>
                      <FormField label="City / Town" error={fieldErrors.city}>
                        <Input
                          value={form.city}
                          onChange={(event) => updateField('city', event.target.value)}
                          placeholder="Dar es Salaam"
                          error={Boolean(fieldErrors.city)}
                        />
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Ward / Area" required error={fieldErrors.ward}>
                        <Input
                          value={form.ward}
                          onChange={(event) => updateField('ward', event.target.value)}
                          placeholder="Mikocheni"
                          error={Boolean(fieldErrors.ward)}
                        />
                      </FormField>
                      <FormField label="Street" required error={fieldErrors.street}>
                        <Input
                          value={form.street}
                          onChange={(event) => updateField('street', event.target.value)}
                          placeholder="Sam Nujoma Road"
                          error={Boolean(fieldErrors.street)}
                        />
                      </FormField>
                    </div>

                    <FormField label="Physical Address" required error={fieldErrors.address}>
                      <Textarea
                        value={form.address}
                        onChange={(event) => updateField('address', event.target.value)}
                        placeholder="Building, floor, nearest landmark"
                        className="min-h-[120px]"
                        aria-invalid={Boolean(fieldErrors.address)}
                      />
                    </FormField>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <VendorSubscriptionPlan
                      plans={plans}
                      selectedPlan={form.subscription_plan}
                      onSelectPlan={(plan) => updateField('subscription_plan', plan)}
                      isLoading={isLoadingPlans}
                      error={plansError}
                    />

                    {fieldErrors.subscription_plan && (
                      <p className="text-sm font-medium text-[var(--color-error)]">{fieldErrors.subscription_plan}</p>
                    )}

                    {plansError && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void loadPlans()}
                        isLoading={isLoadingPlans}
                      >
                        Reload Plans
                      </Button>
                    )}

                    <FormField label="Business Description" error={fieldErrors.description}>
                      <Textarea
                        value={form.description}
                        onChange={(event) => updateField('description', event.target.value)}
                        placeholder="Tell us what you sell and how customers should recognize your business."
                        className="min-h-[120px]"
                        aria-invalid={Boolean(fieldErrors.description)}
                      />
                    </FormField>

                    <div className="space-y-4">
                      <FormField label="Verification Document Type" required error={fieldErrors.verification_document_type}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {vendorVerificationDocumentOptions.map((option) => {
                            const isSelected = form.verification_document_type === option.value;

                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => updateField('verification_document_type', option.value)}
                                className={`rounded-[18px] border px-4 py-4 text-left transition-all ${
                                  isSelected
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)] shadow-sm'
                                    : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-card)]'
                                }`}
                              >
                                <p className={`font-semibold ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-heading)]'}`}>
                                  {option.label}
                                </p>
                                <p className="mt-1 text-sm text-[var(--color-text-body)]">
                                  {option.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </FormField>

                      <FormField label="Upload Verification Document" required error={fieldErrors.verification_document}>
                        <label className="block rounded-[20px] border-2 border-dashed border-[var(--color-primary)] bg-[var(--color-primary-bg)]/35 px-5 py-6 cursor-pointer hover:bg-[var(--color-primary-bg)]/55 transition-colors">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                            className="hidden"
                            onChange={handleVerificationDocumentChange}
                          />
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center shrink-0">
                              <UploadCloud className="w-6 h-6 text-[var(--color-primary)]" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-semibold text-[var(--color-text-heading)]">
                                {form.verification_document ? form.verification_document.name : 'Choose a PDF, JPG, or PNG file'}
                              </p>
                              <p className="text-sm text-[var(--color-text-body)]">
                                Upload one clear government-issued identity document. Maximum size: 5 MB.
                              </p>
                              {application?.status === 'rejected' && application?.has_verification_document && !form.verification_document && (
                                <p className="text-xs text-[var(--color-text-muted)]">
                                  Previous file: {application.verification_document_original_name}. Upload a fresh copy before you resubmit.
                                </p>
                              )}
                            </div>
                          </div>
                        </label>
                      </FormField>
                    </div>

                    <div className="rounded-[20px] bg-[var(--color-bg-card)] p-5 space-y-4 border border-[var(--color-border)]">
                      {reviewRows.map((row) => (
                        <div key={row.label} className="flex items-start gap-3 text-sm">
                          <div className="w-9 h-9 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center shrink-0">
                            <row.icon className="w-4 h-4 text-[var(--color-primary)]" />
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--color-text-heading)]">{row.label}</p>
                            <p className="text-[var(--color-text-body)]">{row.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm text-[var(--color-text-muted)]">
                      By submitting this application, you confirm that the business information and verification document above are accurate and ready for review.
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between border-t border-[var(--color-border)] pt-6 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1 || isSubmitting}
                  className="text-[var(--color-primary)] border-[var(--color-primary)]"
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white gap-2"
                  isLoading={isSubmitting}
                  disabled={step === 3 && (isLoadingPlans || plans.length === 0)}
                >
                  {step === 3 ? 'Submit Application' : 'Continue'}
                  {step < 3 && <ChevronRight className="w-4 h-4" />}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
