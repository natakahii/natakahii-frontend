import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  ArrowRight,
  Building,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Store,
  UploadCloud,
  User,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
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
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

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
      label: 'Identity Document Type',
      value: formatDocumentLabel(form.verification_document_type),
      icon: ShieldCheck,
    },
    {
      label: 'Document File',
      value: form.verification_document?.name || 'Upload required before submission.',
      icon: FileText,
    },
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
    <div className="min-h-screen bg-[var(--color-bg-page)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-black text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto">
        {/* Enrollment Card */}
        <Card className="border-none bg-white rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="h-2 w-full bg-[var(--color-bg-page)]">
              <div 
                className="h-full bg-[var(--color-accent)] transition-all duration-700 ease-in-out" 
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
            
            <CardHeader className="px-8 pt-10 pb-6 sm:px-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  {[1, 2, 3].map((num) => (
                    <div 
                      key={num}
                      className={`flex items-center justify-center transition-all duration-500 ${
                        num === step ? 'w-10 h-3 rounded-full bg-[var(--color-accent)]' : 'w-3 h-3 rounded-full'
                      } ${num < step ? 'bg-[var(--color-primary)]' : num !== step ? 'bg-[var(--color-border)]' : ''}`}
                    >
                      {num < step && <CheckCircle2 className="w-2.5 h-2.5 text-white animate-in zoom-in duration-300" />}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Step {step} of 3
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-bg)] flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <CardTitle className="text-3xl sm:text-4xl font-black text-[var(--color-text-heading)] tracking-tight">
                  {stepLabels[step]}
                </CardTitle>
              </div>
              <CardDescription className="text-base font-medium text-[var(--color-text-body)] mt-2">
                {step === 1 && 'Basic information to set up your seller identity.'}
                {step === 2 && 'Location details for logistics and verification.'}
                {step === 3 && 'Final review and verification documents.'}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit} className="px-8 pb-10 sm:px-12">
              <CardContent className="p-0 space-y-8">
                {application?.status === 'rejected' && (
                  <div className="rounded-[24px] border border-orange-200 bg-orange-50 p-6 flex gap-4 items-start">
                    <XCircle className="w-6 h-6 text-orange-500 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-black text-orange-900 text-sm uppercase tracking-wider">Review Feedback</p>
                      <p className="text-orange-800 text-sm font-medium leading-relaxed">{application.rejection_reason}</p>
                    </div>
                  </div>
                )}

                {pageError && (
                  <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 flex gap-4 items-start">
                    <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                    <p className="text-red-800 text-sm font-bold">{pageError}</p>
                  </div>
                )}

                <div className="transition-all duration-500">
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                      <FormField label="Shop Name" required error={fieldErrors.business_name}>
                        <Input
                          value={form.business_name}
                          onChange={(event) => updateField('business_name', event.target.value)}
                          placeholder="e.g. Serengeti Boutique"
                          className="h-14 rounded-2xl border-2 focus:border-[var(--color-accent)] transition-all font-bold"
                          error={Boolean(fieldErrors.business_name)}
                        />
                      </FormField>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Manager Name" required error={fieldErrors.full_name}>
                          <Input
                            value={form.full_name}
                            onChange={(event) => updateField('full_name', event.target.value)}
                            placeholder="Full Name"
                            className="h-14 rounded-2xl border-2 focus:border-[var(--color-accent)] transition-all font-bold"
                            error={Boolean(fieldErrors.full_name)}
                          />
                        </FormField>
                        <FormField label="Business Email" required error={fieldErrors.business_email}>
                          <Input
                            type="email"
                            value={form.business_email}
                            onChange={(event) => updateField('business_email', event.target.value)}
                            placeholder="business@example.com"
                            className="h-14 rounded-2xl border-2 focus:border-[var(--color-accent)] transition-all font-bold"
                            error={Boolean(fieldErrors.business_email)}
                          />
                        </FormField>
                      </div>

                      <FormField label="Direct Phone" required error={fieldErrors.phone}>
                        <Input
                          type="tel"
                          value={form.phone}
                          onChange={(event) => updateField('phone', event.target.value)}
                          placeholder="+255..."
                          className="h-14 rounded-2xl border-2 focus:border-[var(--color-accent)] transition-all font-bold"
                          error={Boolean(fieldErrors.phone)}
                        />
                      </FormField>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Region" required error={fieldErrors.region}>
                          <Input
                            value={form.region}
                            onChange={(event) => updateField('region', event.target.value)}
                            placeholder="e.g. Dar es Salaam"
                            className="h-14 rounded-2xl border-2 focus:border-[var(--color-accent)] transition-all font-bold"
                            error={Boolean(fieldErrors.region)}
                          />
                        </FormField>
                        <FormField label="City" error={fieldErrors.city}>
                          <Input
                            value={form.city}
                            onChange={(event) => updateField('city', event.target.value)}
                            placeholder="City/Town"
                            className="h-14 rounded-2xl border-2 focus:border-[var(--color-accent)] transition-all font-bold"
                            error={Boolean(fieldErrors.city)}
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Ward" required error={fieldErrors.ward}>
                          <Input
                            value={form.ward}
                            onChange={(event) => updateField('ward', event.target.value)}
                            placeholder="Ward Name"
                            className="h-14 rounded-2xl border-2 focus:border-[var(--color-accent)] transition-all font-bold"
                            error={Boolean(fieldErrors.ward)}
                          />
                        </FormField>
                        <FormField label="Street" required error={fieldErrors.street}>
                          <Input
                            value={form.street}
                            onChange={(event) => updateField('street', event.target.value)}
                            placeholder="Street Name"
                            className="h-14 rounded-2xl border-2 focus:border-[var(--color-accent)] transition-all font-bold"
                            error={Boolean(fieldErrors.street)}
                          />
                        </FormField>
                      </div>

                      <FormField label="Precise Address" required error={fieldErrors.address}>
                        <Textarea
                          value={form.address}
                          onChange={(event) => updateField('address', event.target.value)}
                          placeholder="Building, Floor, Landmarks..."
                          className="min-h-[140px] rounded-3xl border-2 focus:border-[var(--color-accent)] transition-all font-bold p-6"
                          aria-invalid={Boolean(fieldErrors.address)}
                        />
                      </FormField>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                      <section>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-1">Growth Plan</h3>
                            <p className="text-[13px] text-[var(--color-text-body)] font-medium">Select a plan that scales with your business.</p>
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsPlanModalOpen(true)}
                            className="h-12 px-6 rounded-2xl border-2 border-[var(--color-accent)]/20 text-[var(--color-accent)] font-black hover:bg-[var(--color-accent)]/5 transition-all gap-2 shrink-0"
                          >
                            <Rocket className="w-4 h-4" />
                            {form.subscription_plan ? 'Change Selling Plan' : 'Choose Your Plan'}
                          </Button>
                        </div>

                        {selectedPlan ? (
                          <div className="bg-[var(--color-bg-page)] rounded-[32px] p-6 border-2 border-[var(--color-accent)]/10 flex items-center gap-5 group hover:border-[var(--color-accent)]/30 transition-all cursor-pointer" onClick={() => setIsPlanModalOpen(true)}>
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-[var(--color-accent)]/5 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-7 h-7 text-[var(--color-accent)]" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-black text-xl text-[var(--color-text-heading)]">{selectedPlan.name}</p>
                                {selectedPlan.is_free && <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50">Free</Badge>}
                              </div>
                              <p className="text-[13px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">
                                {selectedPlan.is_free ? 'Core Marketplace Tools' : `${formatCurrency(Number(selectedPlan.price))} / ${selectedPlan.billing_cycle === 'yearly' ? 'year' : 'month'}`}
                              </p>
                            </div>
                            <div className="p-3 rounded-full bg-white border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[var(--color-bg-page)] rounded-[32px] p-10 border-2 border-dashed border-[var(--color-border)] flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[var(--color-text-muted)]">
                              <Rocket className="w-7 h-7 opacity-20" />
                            </div>
                            <p className="font-bold text-[var(--color-text-muted)]">No plan selected yet.</p>
                            <Button type="button" variant="ghost" onClick={() => setIsPlanModalOpen(true)} className="text-[var(--color-accent)] font-black">Choose a plan</Button>
                          </div>
                        )}

                        <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
                          <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto p-0 border-none bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] vendor-command-center">
                            <div className="p-8 sm:p-12">
                              <DialogHeader className="mb-10 text-center">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--vendor-accent-action-bg)] flex items-center justify-center mb-4">
                                  <Rocket className="w-8 h-8 text-[var(--vendor-accent-action)]" />
                                </div>
                                <DialogTitle className="text-4xl font-black text-[var(--color-text-heading)] tracking-tight">
                                  Professional Growth Plans
                                </DialogTitle>
                                <p className="text-[var(--color-text-muted)] text-lg mt-2 font-medium max-w-2xl mx-auto">
                                  Choose a plan that scales with your business goals. Each plan unlocks unique marketplace benefits.
                                </p>
                              </DialogHeader>
                              
                              <VendorSubscriptionPlan
                                plans={plans}
                                selectedPlan={form.subscription_plan}
                                onSelectPlan={(plan) => {
                                  updateField('subscription_plan', plan);
                                  setIsPlanModalOpen(false);
                                }}
                                isLoading={isLoadingPlans}
                                error={plansError}
                                title=""
                                description=""
                              />
                              
                              <div className="mt-12 flex justify-center">
                                <Button 
                                  onClick={() => setIsPlanModalOpen(false)}
                                  className="h-14 px-12 rounded-2xl bg-[var(--color-text-heading)] text-white font-black text-lg hover:bg-black transition-all"
                                >
                                  Close Plan Gallery
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </section>

                      <section className="space-y-6">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-1">Identity Verification</h3>
                          <p className="text-[13px] text-[var(--color-text-body)] font-medium">Select a document type and upload a clear digital copy.</p>
                        </div>

                        <div className="space-y-6">
                          <FormField label="Identity Document Type" required error={fieldErrors.verification_document_type}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {vendorVerificationDocumentOptions.map((option) => {
                                const isSelected = form.verification_document_type === option.value;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => updateField('verification_document_type', option.value)}
                                    className={`p-6 rounded-[24px] text-left border-2 transition-all duration-300 ${
                                      isSelected
                                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-[0_8px_20px_-6px_rgba(var(--color-accent-rgb),0.2)]'
                                        : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/30'
                                    }`}
                                  >
                                    <p className={`font-black ${isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-heading)]'}`}>
                                      {option.label}
                                    </p>
                                    <p className="text-[12px] text-[var(--color-text-body)] mt-1 font-medium leading-relaxed opacity-70">{option.description}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </FormField>

                          <FormField label="Upload Document" required error={fieldErrors.verification_document}>
                            <label className="relative block group">
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={handleVerificationDocumentChange}
                              />
                              <div className={`p-10 rounded-[32px] border-2 border-dashed transition-all duration-500 flex flex-col items-center text-center cursor-pointer ${
                                form.verification_document 
                                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
                                  : 'border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-bg-page)]'
                              }`}>
                                <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center transition-all duration-500 ${
                                  form.verification_document ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]'
                                }`}>
                                  <UploadCloud className="w-8 h-8" />
                                </div>
                                <p className="text-lg font-black text-[var(--color-text-heading)]">
                                  {form.verification_document ? form.verification_document.name : 'Drop file here or browse'}
                                </p>
                                <p className="text-[13px] font-medium text-[var(--color-text-body)] mt-1 max-w-xs opacity-70">
                                  Accepted: PDF, JPG, PNG (Max 5MB)
                                </p>
                              </div>
                            </label>
                          </FormField>
                        </div>
                      </section>

                      <section>
                        <div className="p-8 rounded-[40px] bg-[var(--color-bg-page)] border border-[var(--color-border)]/50 space-y-8">
                          <div className="flex items-center justify-between border-b border-[var(--color-border)]/50 pb-4">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Application Summary</h4>
                            <span className="text-[10px] font-black text-[var(--color-accent)] uppercase px-3 py-1 bg-[var(--color-accent)]/10 rounded-full">Final Review</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                            {reviewRows.filter(r => !['Description'].includes(r.label) && r.value !== 'Not provided yet').map((row) => (
                              <div key={row.label} className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <row.icon className="w-3.5 h-3.5 text-[var(--color-primary)] opacity-60" />
                                  <p className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-wider">{row.label}</p>
                                </div>
                                <p className="text-sm font-bold text-[var(--color-text-heading)] break-words leading-tight">{row.value}</p>
                              </div>
                            ))}
                          </div>

                          {form.description && (
                            <div className="pt-6 border-t border-[var(--color-border)]/50 space-y-2">
                              <p className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-wider">Business Description</p>
                              <p className="text-sm font-medium text-[var(--color-text-body)] leading-relaxed">{form.description}</p>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-[12px] text-[var(--color-text-muted)] mt-6 text-center font-medium px-4">
                          By submitting, you confirm all details are accurate and the identification document provided is authentic.
                        </p>
                      </section>
                    </div>
                  )}
                </div>
              </CardContent>

              <div className="flex items-center justify-between pt-12">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={step === 1 || isSubmitting}
                  className="h-14 px-8 rounded-2xl font-black text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]"
                >
                  Previous
                </Button>

                <Button
                  type="submit"
                  className="h-14 px-10 rounded-2xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-black text-lg shadow-xl shadow-[var(--color-accent)]/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-3"
                  isLoading={isSubmitting}
                >
                  {step === 3 ? 'Submit Application' : 'Continue Step'}
                  {step < 3 && <ArrowRight className="w-5 h-5" />}
                </Button>
              </div>
            </form>
          </Card>
        </div>
    </div>
  );
}
