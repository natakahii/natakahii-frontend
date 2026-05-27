type VendorPlanLike = {
  name?: string;
  slug?: string;
  is_free?: boolean;
  product_limit?: number | null;
} | null | undefined;

type VendorVerificationLike = {
  status?: string | null;
  verification_level?: string | null;
  has_kyc_verification?: boolean;
  has_premium_verification?: boolean;
  subscription_plan?: VendorPlanLike;
  product_limit?: number | null;
} | null | undefined;

export function isPremiumVerifiedVendor(vendor: VendorVerificationLike): boolean {
  if (!vendor) {
    return false;
  }

  if (typeof vendor.has_premium_verification === 'boolean') {
    return vendor.has_premium_verification;
  }

  if (vendor.verification_level === 'subscription_verified') {
    return true;
  }

  return vendor.status === 'approved' && Boolean(vendor.subscription_plan) && vendor.subscription_plan?.is_free === false;
}

export function isKycVerifiedVendor(vendor: VendorVerificationLike): boolean {
  if (!vendor) {
    return false;
  }

  if (typeof vendor.has_kyc_verification === 'boolean') {
    return vendor.has_kyc_verification;
  }

  if (vendor.verification_level === 'kyc_verified' || vendor.verification_level === 'subscription_verified') {
    return true;
  }

  return vendor.status === 'approved';
}

export function getVendorVerificationTier(vendor: VendorVerificationLike): 'premium' | 'kyc' | 'none' {
  if (isPremiumVerifiedVendor(vendor)) {
    return 'premium';
  }

  return 'none';
}

export function getVendorVerificationDescriptor(vendor: VendorVerificationLike): {
  tier: 'premium' | 'kyc' | 'none';
  headline: string;
  detail: string;
} {
  const planName = vendor?.subscription_plan?.name || 'paid';

  if (isPremiumVerifiedVendor(vendor)) {
    return {
      tier: 'premium',
      headline: 'Verified vendor',
      detail: `This seller is an approved vendor on the ${planName} plan and carries the marketplace verification tick.`,
    };
  }

  if (isKycVerifiedVendor(vendor)) {
    return {
      tier: 'kyc',
      headline: 'Approved vendor',
      detail: 'This seller passed marketplace review and is approved to trade on Nataka Hii.',
    };
  }

  return {
    tier: 'none',
    headline: 'Active seller',
    detail: 'This storefront is active on the marketplace.',
  };
}
