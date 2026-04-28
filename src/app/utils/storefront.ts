export interface StorefrontVendorLike {
  id?: number | string | null;
  shop_slug?: string | null;
}

export function getVendorStorefrontPath(vendor?: StorefrontVendorLike | null): string {
  if (vendor?.shop_slug) {
    return `/shop/${encodeURIComponent(vendor.shop_slug)}`;
  }

  if (vendor?.id != null) {
    return `/explore?vendor=${vendor.id}`;
  }

  return '/explore';
}
