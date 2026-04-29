import { Link } from 'react-router';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/empty-state';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useToast } from '../../components/ui/toast';
import { useAuth } from '../../providers/AuthProvider';
import { saveVendorProfile } from '../../services/vendorProfileService';
import { Camera, RefreshCcw, Save, Store, UserRound } from 'lucide-react';
import { getVendorStorefrontPath } from '../../utils/storefront';

type VendorFieldErrors = Partial<Record<'shop_name' | 'shop_slug' | 'description' | 'logo', string>>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractFieldErrors(error: any): VendorFieldErrors {
  const errors = error?.data?.errors;

  if (!errors || typeof errors !== 'object') {
    return {};
  }

  return Object.entries(errors).reduce<VendorFieldErrors>((result, [field, messages]) => {
    if (Array.isArray(messages) && messages[0]) {
      result[field as keyof VendorFieldErrors] = String(messages[0]);
    }

    return result;
  }, {});
}

export function VendorSettings() {
  const { refreshCurrentUser, user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const vendor = user?.vendor;
  const [shopName, setShopName] = useState('');
  const [shopSlug, setShopSlug] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<VendorFieldErrors>({});

  useEffect(() => {
    setShopName(vendor?.shop_name || '');
    setShopSlug(vendor?.shop_slug || '');
    setDescription(vendor?.description || '');
  }, [vendor?.description, vendor?.shop_name, vendor?.shop_slug]);

  useEffect(() => {
    if (!selectedLogoFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedLogoFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedLogoFile]);

  const logoUrl = previewUrl || vendor?.logo || user?.profile_photo || '';
  const statusLabel = vendor?.status ? String(vendor.status).replace(/_/g, ' ') : 'unknown';
  const storefrontUrl = useMemo(() => (shopSlug ? `natakahii.com/shop/${shopSlug}` : 'Choose a store URL'), [shopSlug]);
  const storefrontPath = getVendorStorefrontPath(vendor);

  function clearFieldError(field: keyof VendorFieldErrors) {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setSelectedLogoFile(file);
    clearFieldError('logo');
  }

  async function handleSave() {
    if (!vendor) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await saveVendorProfile({
        shop_name: shopName.trim(),
        shop_slug: shopSlug.trim(),
        description: description.trim(),
        logo: selectedLogoFile,
      });

      await refreshCurrentUser();
      setSelectedLogoFile(null);
      setFieldErrors({});
      toast({
        type: 'success',
        title: 'Store updated',
        message: response.message,
      });
    } catch (error: any) {
      setFieldErrors(extractFieldErrors(error));
      toast({
        type: 'error',
        title: 'Unable to update store',
        message: error?.message || 'Please review your store details and try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (!vendor) {
    return (
      <EmptyState
        variant="products"
        title="Vendor profile not available"
        description="We could not find a seller profile tied to this account yet. Refresh your session or contact support if this keeps happening."
        actionLabel="Refresh Session"
        actionOnClick={() => void refreshCurrentUser()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-heading)]">Store Settings</h1>
          <p className="text-[var(--color-text-muted)]">Manage the public identity and branding of your seller workspace.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {vendor.shop_slug && (
            <Link to={storefrontPath} target="_blank" rel="noreferrer">
              <Button
                type="button"
                variant="outline"
                className="border-[var(--color-primary)] text-[var(--color-primary)]"
              >
                View Storefront
              </Button>
            </Link>
          )}
          <Badge className="bg-[var(--color-primary-bg)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] capitalize">
            {statusLabel}
          </Badge>
          <Button
            type="button"
            variant="outline"
            className="border-[var(--color-primary)] text-[var(--color-primary)]"
            onClick={() => {
              setShopName(vendor.shop_name || '');
              setShopSlug(vendor.shop_slug || '');
              setDescription(vendor.description || '');
              setSelectedLogoFile(null);
              setFieldErrors({});
            }}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            type="button"
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white"
            onClick={handleSave}
            isLoading={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="border-[var(--color-border)] shadow-sm xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg text-[var(--color-text-heading)]">Store Identity</CardTitle>
            <CardDescription>Preview how your seller brand appears inside the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-[24px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-card)]">
                  {logoUrl ? (
                    <ImageWithFallback src={logoUrl} alt={shopName || vendor.shop_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--color-primary-bg)]">
                      <Store className="w-10 h-10 text-[var(--color-primary)]" />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center border-4 border-white shadow-md"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-heading)]">{shopName || vendor.shop_name}</h2>
                <p className="text-sm text-[var(--color-text-muted)]">@{shopSlug || vendor.shop_slug}</p>
              </div>
            </div>

            <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4px] text-[var(--color-text-muted)]">Store URL</p>
                <p className="text-sm font-medium text-[var(--color-text-heading)] break-all">{storefrontUrl}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4px] text-[var(--color-text-muted)]">Owner</p>
                <p className="text-sm text-[var(--color-text-heading)] flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-[var(--color-primary)]" />
                  {user?.name || 'Vendor owner'}
                </p>
              </div>
            </div>

            {fieldErrors.logo && (
              <p className="text-[12px] font-bold text-[var(--color-error)]">{fieldErrors.logo}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-[var(--color-text-heading)]">Public Store Details</CardTitle>
            <CardDescription>These details describe your seller presence across product listings and future storefront views.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[var(--color-text-heading)]">Store Name</label>
                <Input
                  value={shopName}
                  onChange={(event) => {
                    setShopName(event.target.value);
                    clearFieldError('shop_name');
                  }}
                  placeholder="Nataka Seller"
                  error={Boolean(fieldErrors.shop_name)}
                />
                {fieldErrors.shop_name && <p className="text-[12px] font-bold text-[var(--color-error)]">{fieldErrors.shop_name}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[13px] font-semibold text-[var(--color-text-heading)]">Store URL</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShopSlug(slugify(shopName));
                      clearFieldError('shop_slug');
                    }}
                    className="text-[12px] font-bold text-[var(--color-primary)] hover:underline"
                  >
                    Generate from name
                  </button>
                </div>
                <Input
                  value={shopSlug}
                  onChange={(event) => {
                    setShopSlug(event.target.value);
                    clearFieldError('shop_slug');
                  }}
                  placeholder="nataka-seller"
                  error={Boolean(fieldErrors.shop_slug)}
                />
                {fieldErrors.shop_slug && <p className="text-[12px] font-bold text-[var(--color-error)]">{fieldErrors.shop_slug}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[var(--color-text-heading)]">Store Description</label>
              <Textarea
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  clearFieldError('description');
                }}
                placeholder="Tell buyers what you sell and what makes your store special."
                className="min-h-[180px]"
                aria-invalid={Boolean(fieldErrors.description)}
              />
              {fieldErrors.description && <p className="text-[12px] font-bold text-[var(--color-error)]">{fieldErrors.description}</p>}
            </div>

            <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-primary-bg)]/50 p-4">
              <p className="text-sm text-[var(--color-text-body)]">
                Tip: keep your store URL short and stable. Buyers may see it in future storefront, search, and vendor profile experiences.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
