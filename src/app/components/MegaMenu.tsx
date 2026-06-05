import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  MapPin,
  Menu,
  Star,
  Smartphone,
  Shirt,
  Home as HomeIcon,
  Watch,
  Sparkles,
  Zap,
  Dumbbell,
  Users,
  Heart,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from './ui/button';
import { VendorVerificationBadge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ResourceCenterDropdown } from './ResourceCenterDropdown';
import {
  fetchCategories,
  fetchProducts,
  getProductPrice,
  getProductPrimaryImage,
  CatalogCategory,
  CatalogProduct,
  CatalogVendor,
} from '../services/productService';
import { getRegions } from '../data/tanzaniaLocations';
import { formatCurrency } from '../utils/currency';
import { getProductPath } from '../utils/products';
import { getVendorStorefrontPath } from '../utils/storefront';
import { getVendorVerificationTier } from '../utils/vendorVerification';

const PRODUCTS_PER_CATEGORY = 16;
const ALL_REGION = 'All';

const CATEGORY_ICON_MAP: { pattern: RegExp; icon: LucideIcon }[] = [
  { pattern: /fashion|apparel|clothing|dress|shoe/, icon: Shirt },
  { pattern: /electronics|phone|tech|device|smart/, icon: Smartphone },
  { pattern: /home|living|furniture|decor/, icon: HomeIcon },
  { pattern: /accessories|watch|jewelry/, icon: Watch },
  { pattern: /beauty|cosmetic|skin/, icon: Sparkles },
  { pattern: /sport|fitness/, icon: Dumbbell },
];

function getCategoryIcon(category: CatalogCategory): LucideIcon {
  const label = `${category.icon || ''} ${category.slug} ${category.name}`.toLowerCase();
  return CATEGORY_ICON_MAP.find((entry) => entry.pattern.test(label))?.icon || Zap;
}

const FEATURED = 'featured' as const;
type ActiveKey = number | typeof FEATURED;
type ActiveDropdown = 'categories' | 'findNear' | 'resourceCenter' | 'appMenu' | null;

const TANZANIA_REGIONS = [ALL_REGION, ...getRegions()];

export function MegaMenu() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null);
  const [activeKey, setActiveKey] = useState<ActiveKey>(FEATURED);
  const [productsByCategory, setProductsByCategory] = useState<Record<number, CatalogProduct[]>>({});
  const [featuredProducts, setFeaturedProducts] = useState<CatalogProduct[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState<number | null>(null);
  const [activeRegion, setActiveRegion] = useState(ALL_REGION);
  const [regionProducts, setRegionProducts] = useState<CatalogProduct[]>([]);
  const [regionLoading, setRegionLoading] = useState(false);
  const [mobileActiveSection, setMobileActiveSection] = useState<ActiveDropdown>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestedCategories = useRef<Set<number>>(new Set());
  const featuredRequested = useRef(false);
  const regionRequested = useRef<Set<string>>(new Set());
  const regionProductsCache = useRef<Record<string, CatalogProduct[]>>({});

  useEffect(() => {
    let isMounted = true;
    fetchCategories()
      .then((data) => {
        if (isMounted) setCategories(data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch featured/mixed products for "Categories for you"
  useEffect(() => {
    if (activeKey !== FEATURED || featuredRequested.current) return;
    featuredRequested.current = true;
    let isMounted = true;
    setFeaturedLoading(true);
    fetchProducts({ per_page: PRODUCTS_PER_CATEGORY })
      .then((response) => {
        if (isMounted) setFeaturedProducts(response.products);
      })
      .catch(() => {
        featuredRequested.current = false;
      })
      .finally(() => {
        if (isMounted) setFeaturedLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [activeKey]);

  // Fetch products per category
  useEffect(() => {
    if (activeKey === FEATURED) return;
    const categoryId = activeKey;
    if (requestedCategories.current.has(categoryId)) return;
    requestedCategories.current.add(categoryId);

    let isMounted = true;
    setLoadingCategory(categoryId);
    fetchProducts({ category: String(categoryId), per_page: PRODUCTS_PER_CATEGORY })
      .then((response) => {
        if (isMounted) {
          setProductsByCategory((prev) => ({ ...prev, [categoryId]: response.products }));
        }
      })
      .catch(() => {
        requestedCategories.current.delete(categoryId);
      })
      .finally(() => {
        if (isMounted) setLoadingCategory((current) => (current === categoryId ? null : current));
      });

    return () => {
      isMounted = false;
    };
  }, [activeKey]);

  // Fetch products for active region
  useEffect(() => {
    if (activeDropdown !== 'findNear' && mobileActiveSection !== 'findNear') return;

    const region = activeRegion;

    // Check cache
    if (regionProductsCache.current[region]) {
      setRegionProducts(regionProductsCache.current[region]);
      return;
    }

    if (regionRequested.current.has(region)) return;
    regionRequested.current.add(region);

    let isMounted = true;
    setRegionLoading(true);

    // Always fetch all products, then filter client-side by vendor location
    fetchProducts({ per_page: 100 })
      .then((response) => {
        if (isMounted) {
          let filtered = response.products;
          if (region !== ALL_REGION) {
            filtered = filtered.filter(
              (product) => product.vendor?.region?.toLowerCase() === region.toLowerCase()
            );
          }
          regionProductsCache.current[region] = filtered;
          setRegionProducts(filtered);
        }
      })
      .catch(() => {
        regionRequested.current.delete(region);
      })
      .finally(() => {
        if (isMounted) setRegionLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeDropdown, activeRegion, mobileActiveSection]);

  // Extract unique vendors from featured products
  const spotlightVendors = useMemo(() => {
    const uniqueVendors = new Map<number, CatalogVendor & { featuredProductCount: number; totalLikes: number }>();
    const sourceProducts = featuredProducts.length > 0 ? featuredProducts : regionProducts;

    sourceProducts.forEach((product) => {
      const vendor = product.vendor;
      if (!vendor?.id) return;

      const existing = uniqueVendors.get(vendor.id);
      if (existing) {
        existing.featuredProductCount += 1;
        existing.totalLikes += product.likes_count || 0;
        return;
      }

      uniqueVendors.set(vendor.id, {
        ...vendor,
        featuredProductCount: 1,
        totalLikes: product.likes_count || 0,
      });
    });

    return Array.from(uniqueVendors.values()).slice(0, 8);
  }, [featuredProducts, regionProducts]);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const closeAll = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 120);
  };

  const openDropdown = (dropdown: ActiveDropdown) => {
    cancelClose();
    setActiveDropdown(dropdown);
  };

  const closeNonCategory = () => {
    cancelClose();
    setActiveDropdown(null);
  };

  const activeCategory =
    activeKey === FEATURED ? null : categories.find((category) => category.id === activeKey) || null;

  const activeProducts = activeCategory ? productsByCategory[activeCategory.id] : undefined;
  const isLoadingProducts = activeCategory != null && loadingCategory === activeCategory.id;

  const panelTitle = activeCategory ? activeCategory.name : 'Categories for you';

  const linkClass =
    'px-3 py-2 text-[14px] font-medium text-[var(--color-text-body)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap';

  function renderProductGrid(products: CatalogProduct[]) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3">
        {products.map((product) => (
          <Link
            key={product.id}
            to={getProductPath(product)}
            onClick={() => { setActiveDropdown(null); setMobileActiveSection(null); }}
            className="group flex flex-col gap-1"
          >
            <div className="aspect-square overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-page)]">
              <ImageWithFallback
                src={getProductPrimaryImage(product)}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="text-[12px] font-semibold text-[var(--color-text-heading)]">
              {formatCurrency(getProductPrice(product))}
            </span>
          </Link>
        ))}
      </div>
    );
  }

  function renderLoadingGrid() {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3">
        {Array.from({ length: PRODUCTS_PER_CATEGORY }).map((_, index) => (
          <div key={index} className="flex flex-col gap-1">
            <div className="aspect-square rounded-[8px] bg-[var(--color-bg-page)] animate-pulse" />
            <div className="h-3 w-2/3 rounded-full bg-[var(--color-bg-page)] animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  function renderVendorCards() {
    if (spotlightVendors.length === 0) {
      return (
        <p className="text-[14px] text-[var(--color-text-muted)]">
          Vendor spotlight loading...
        </p>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {spotlightVendors.map((vendor) => {
          const vendorTier = getVendorVerificationTier(vendor);
          const location = [vendor.street, vendor.region, vendor.city].filter(Boolean).join(', ');

          return (
            <Link
              key={vendor.id}
              to={getVendorStorefrontPath(vendor)}
              onClick={() => { setActiveDropdown(null); setMobileActiveSection(null); }}
              className="group flex items-start gap-3 p-3 rounded-[12px] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-sm transition-all bg-white"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--color-border)] shrink-0">
                <ImageWithFallback
                  src={vendor.logo || '/natakahii-logo.png'}
                  alt={vendor.shop_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[13px] font-bold text-[var(--color-text-heading)] truncate">
                    {vendor.shop_name}
                  </span>
                  {vendorTier === 'premium' && (
                    <VendorVerificationBadge tone="compact" label="" className="shrink-0" />
                  )}
                </div>
                {location && (
                  <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] mb-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {vendor.followers_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {vendor.totalLikes || 0}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  function renderSpinner() {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <>
      {/* ─── Desktop Mega Menu ─── */}
      <div
        className="hidden lg:block w-full bg-white border-b border-[var(--color-border)] relative z-40"
        onMouseLeave={closeAll}
      >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-12">
            {/* Left group */}
            <div className="flex items-center">
              <button
                type="button"
                onMouseEnter={() => openDropdown('categories')}
                onClick={() => openDropdown('categories')}
                aria-expanded={activeDropdown === 'categories'}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-[14px] font-semibold transition-colors whitespace-nowrap border-b-2',
                  activeDropdown === 'categories'
                    ? 'text-[var(--color-primary)] border-[var(--color-primary)]'
                    : 'text-[var(--color-text-heading)] border-transparent hover:text-[var(--color-primary)]',
                )}
              >
                <Menu className="w-4 h-4" />
                All Categories
                <ChevronDown
                  className={cn('w-4 h-4 transition-transform', activeDropdown === 'categories' && 'rotate-180')}
                />
              </button>

              <Link to="/explore" className={linkClass} onMouseEnter={closeNonCategory}>
                Top Verified Seller/Vendor
              </Link>
              <button
                type="button"
                onMouseEnter={() => openDropdown('findNear')}
                onClick={() => openDropdown('findNear')}
                className={cn(
                  linkClass,
                  'flex items-center gap-1 border-b-2',
                  activeDropdown === 'findNear'
                    ? 'text-[var(--color-primary)] border-[var(--color-primary)]'
                    : 'border-transparent',
                )}
              >
                Find near products
                <ChevronDown
                  className={cn('w-4 h-4 transition-transform', activeDropdown === 'findNear' && 'rotate-180')}
                />
              </button>
            </div>

            {/* Right group */}
            <div className="flex items-center">
              <button
                type="button"
                onMouseEnter={() => openDropdown('resourceCenter')}
                onClick={() => openDropdown('resourceCenter')}
                className={cn(
                  linkClass,
                  'flex items-center gap-1 border-b-2',
                  activeDropdown === 'resourceCenter'
                    ? 'text-[var(--color-primary)] border-[var(--color-primary)]'
                    : 'border-transparent',
                )}
              >
                Resource Center
                <ChevronDown
                  className={cn('w-4 h-4 transition-transform', activeDropdown === 'resourceCenter' && 'rotate-180')}
                />
              </button>

              <div className="relative" onMouseEnter={() => openDropdown('appMenu')}>
                <button
                  type="button"
                  onClick={() => openDropdown('appMenu')}
                  aria-expanded={activeDropdown === 'appMenu'}
                  className={cn(linkClass, 'flex items-center gap-1')}
                >
                  App &amp; extension
                  <ChevronDown
                    className={cn('w-4 h-4 transition-transform', activeDropdown === 'appMenu' && 'rotate-180')}
                  />
                </button>
                {activeDropdown === 'appMenu' && (
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-[12px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-level-2)] p-4">
                    <p className="text-[14px] font-medium text-[var(--color-text-muted)]">
                      Coming soon...
                    </p>
                  </div>
                )}
              </div>

              <Link
                to="/vendor/apply"
                className="ml-2 px-4 py-2 text-[14px] font-semibold text-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap"
                onMouseEnter={closeNonCategory}
              >
                Sell on natakahii
              </Link>
            </div>
          </nav>
        </div>

        {/* ─── All Categories Dropdown ─── */}
        {activeDropdown === 'categories' && (
          <div className="absolute left-0 right-0 top-full" onMouseEnter={cancelClose}>
            <div className="flex bg-white border border-t-0 border-[var(--color-border)] shadow-[var(--shadow-level-3)] overflow-hidden max-h-[70vh]">
              {/* Sidebar */}
              <div className="w-[220px] shrink-0 border-r border-[var(--color-border)] py-3 overflow-y-auto">
                <button
                  type="button"
                  onMouseEnter={() => setActiveKey(FEATURED)}
                  className={cn(
                    'flex items-center gap-3 w-full text-left px-5 py-2.5 text-[13px] font-medium transition-colors',
                    activeKey === FEATURED
                      ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-body)] hover:bg-[var(--color-bg-page)]',
                  )}
                >
                  <Star className="w-4 h-4" />
                  Categories for you
                </button>

                {categories.map((category) => {
                  const Icon = getCategoryIcon(category);
                  const isActive = activeKey === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onMouseEnter={() => setActiveKey(category.id)}
                      className={cn(
                        'flex items-center gap-3 w-full text-left px-5 py-2.5 text-[13px] font-medium transition-colors',
                        isActive
                          ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                          : 'text-[var(--color-text-body)] hover:bg-[var(--color-bg-page)]',
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {category.name}
                    </button>
                  );
                })}
              </div>

              {/* Grid */}
              <div className="flex-1 p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-bold text-[var(--color-text-heading)]">
                    {panelTitle}
                  </h3>
                  {activeCategory && (
                    <Link
                      to={`/explore?category=${activeCategory.id}`}
                      onClick={() => setActiveDropdown(null)}
                      className="text-[13px] font-semibold text-[var(--color-primary)] hover:text-[var(--color-accent)] whitespace-nowrap"
                    >
                      View all
                    </Link>
                  )}
                </div>

                {activeCategory == null ? (
                  featuredLoading || featuredProducts.length === 0 ? (
                    featuredLoading ? renderLoadingGrid() : (
                      <p className="text-[14px] text-[var(--color-text-muted)]">
                        Products will appear here soon.
                      </p>
                    )
                  ) : (
                    <>
                      {renderProductGrid(featuredProducts)}
                      {/* Vendor Spotlight */}
                      <div className="mt-6 pt-5 border-t border-[var(--color-border)]">
                        <h4 className="text-[14px] font-bold text-[var(--color-text-heading)] mb-3">
                          Top Verified Vendors
                        </h4>
                        {renderVendorCards()}
                      </div>
                    </>
                  )
                ) : isLoadingProducts || activeProducts === undefined ? (
                  renderLoadingGrid()
                ) : activeProducts.length === 0 ? (
                  <p className="text-[14px] text-[var(--color-text-muted)]">
                    No products in {activeCategory.name} yet.{' '}
                    <Link
                      to={`/explore?category=${activeCategory.id}`}
                      onClick={() => setActiveDropdown(null)}
                      className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-accent)]"
                    >
                      Browse the category
                    </Link>
                  </p>
                ) : (
                  renderProductGrid(activeProducts)
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Find Near Products Dropdown ─── */}
        {activeDropdown === 'findNear' && (
          <div className="absolute left-0 right-0 top-full" onMouseEnter={cancelClose}>
            <div className="flex bg-white border border-t-0 border-[var(--color-border)] shadow-[var(--shadow-level-3)] overflow-hidden max-h-[70vh]">
              {/* Region Sidebar */}
              <div className="w-[220px] shrink-0 border-r border-[var(--color-border)] py-3 overflow-y-auto">
                {TANZANIA_REGIONS.map((region) => {
                  const isActive = activeRegion === region;
                  return (
                    <button
                      key={region}
                      type="button"
                      onMouseEnter={() => setActiveRegion(region)}
                      className={cn(
                        'flex items-center gap-3 w-full text-left px-5 py-2.5 text-[13px] font-medium transition-colors',
                        isActive
                          ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                          : 'text-[var(--color-text-body)] hover:bg-[var(--color-bg-page)]',
                      )}
                    >
                      <MapPin className="w-4 h-4" />
                      {region}
                    </button>
                  );
                })}
              </div>

              {/* Products Grid */}
              <div className="flex-1 p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-bold text-[var(--color-text-heading)]">
                    Products in {activeRegion === ALL_REGION ? 'all regions' : activeRegion}
                  </h3>
                  <Link
                    to={activeRegion === ALL_REGION ? '/explore' : `/explore?region=${encodeURIComponent(activeRegion)}`}
                    onClick={() => setActiveDropdown(null)}
                    className="text-[13px] font-semibold text-[var(--color-primary)] hover:text-[var(--color-accent)] whitespace-nowrap"
                  >
                    View all
                  </Link>
                </div>

                {regionLoading ? (
                  renderSpinner()
                ) : regionProducts.length === 0 ? (
                  <p className="text-[14px] text-[var(--color-text-muted)]">
                    No products found in {activeRegion === ALL_REGION ? 'any region' : activeRegion} yet.{' '}
                    <Link
                      to="/explore"
                      onClick={() => setActiveDropdown(null)}
                      className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-accent)]"
                    >
                      Browse the catalog
                    </Link>
                  </p>
                ) : (
                  renderProductGrid(regionProducts)
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Resource Center Dropdown ─── */}
        {activeDropdown === 'resourceCenter' && (
          <div className="absolute left-0 right-0 top-full" onMouseEnter={cancelClose}>
            <div className="bg-white border border-t-0 border-[var(--color-border)] shadow-[var(--shadow-level-3)] overflow-hidden">
              <ResourceCenterDropdown onClose={() => setActiveDropdown(null)} />
            </div>
          </div>
        )}
      </div>

      {/* ─── Mobile Mega Menu ─── */}
      <div className="lg:hidden w-full bg-white border-b border-[var(--color-border)] relative z-30 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-1 px-3 h-11 min-w-max">
          <button
            type="button"
            onClick={() => setMobileActiveSection(mobileActiveSection === 'categories' ? null : 'categories')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors',
              mobileActiveSection === 'categories'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-bg-page)] text-[var(--color-text-body)]',
            )}
          >
            <Menu className="w-3.5 h-3.5" />
            Categories
            <ChevronDown className={cn('w-3 h-3 transition-transform', mobileActiveSection === 'categories' && 'rotate-180')} />
          </button>

          <button
            type="button"
            onClick={() => setMobileActiveSection(mobileActiveSection === 'findNear' ? null : 'findNear')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors',
              mobileActiveSection === 'findNear'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-bg-page)] text-[var(--color-text-body)]',
            )}
          >
            <MapPin className="w-3.5 h-3.5" />
            Near Me
            <ChevronDown className={cn('w-3 h-3 transition-transform', mobileActiveSection === 'findNear' && 'rotate-180')} />
          </button>

          <button
            type="button"
            onClick={() => setMobileActiveSection(mobileActiveSection === 'resourceCenter' ? null : 'resourceCenter')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors',
              mobileActiveSection === 'resourceCenter'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-bg-page)] text-[var(--color-text-body)]',
            )}
          >
            Resources
            <ChevronDown className={cn('w-3 h-3 transition-transform', mobileActiveSection === 'resourceCenter' && 'rotate-180')} />
          </button>

          <Link
            to="/vendor/apply"
            className="flex items-center px-3 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap text-[var(--color-accent)] bg-[var(--color-accent-bg)]"
          >
            Sell
          </Link>
        </div>
      </div>

      {/* ─── Mobile Dropdown Panels ─── */}
      {mobileActiveSection && (
        <div className="lg:hidden fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" onClick={() => setMobileActiveSection(null)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] max-h-[80vh] overflow-hidden shadow-[var(--shadow-level-4)] animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[var(--color-text-heading)]">
                {mobileActiveSection === 'categories' && 'All Categories'}
                {mobileActiveSection === 'findNear' && 'Find Near Products'}
                {mobileActiveSection === 'resourceCenter' && 'Resource Center'}
              </h3>
              <button onClick={() => setMobileActiveSection(null)} className="p-1.5 rounded-full bg-[var(--color-bg-page)]">
                <X className="w-5 h-5 text-[var(--color-text-muted)]" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-56px)]">
              {/* Mobile Categories */}
              {mobileActiveSection === 'categories' && (
                <div className="p-4">
                  {/* Category pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setActiveKey(FEATURED)}
                      className={cn(
                        'px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors',
                        activeKey === FEATURED
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-[var(--color-bg-page)] text-[var(--color-text-body)]',
                      )}
                    >
                      For you
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveKey(cat.id)}
                        className={cn(
                          'px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors',
                          activeKey === cat.id
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--color-bg-page)] text-[var(--color-text-body)]',
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Products */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[14px] font-bold text-[var(--color-text-heading)]">{panelTitle}</h4>
                      {activeCategory && (
                        <Link
                          to={`/explore?category=${activeCategory.id}`}
                          onClick={() => setMobileActiveSection(null)}
                          className="text-[12px] font-semibold text-[var(--color-primary)]"
                        >
                          View all <ChevronRight className="w-3 h-3 inline" />
                        </Link>
                      )}
                    </div>
                    {activeCategory == null ? (
                      featuredLoading ? renderLoadingGrid() : renderProductGrid(featuredProducts)
                    ) : isLoadingProducts || activeProducts === undefined ? (
                      renderLoadingGrid()
                    ) : activeProducts.length === 0 ? (
                      <p className="text-[13px] text-[var(--color-text-muted)]">No products yet</p>
                    ) : (
                      renderProductGrid(activeProducts)
                    )}
                  </div>

                  {/* Vendor spotlight (mobile) */}
                  {activeKey === FEATURED && spotlightVendors.length > 0 && (
                    <div className="pt-4 border-t border-[var(--color-border)]">
                      <h4 className="text-[14px] font-bold text-[var(--color-text-heading)] mb-3">Top Vendors</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {spotlightVendors.slice(0, 4).map((vendor) => {
                          const vendorTier = getVendorVerificationTier(vendor);
                          return (
                            <Link
                              key={vendor.id}
                              to={getVendorStorefrontPath(vendor)}
                              onClick={() => setMobileActiveSection(null)}
                              className="flex items-center gap-2 p-2.5 rounded-[10px] border border-[var(--color-border)] bg-white"
                            >
                              <div className="w-9 h-9 rounded-full overflow-hidden border border-[var(--color-border)] shrink-0">
                                <ImageWithFallback src={vendor.logo || '/natakahii-logo.png'} alt={vendor.shop_name} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-[12px] font-bold text-[var(--color-text-heading)] truncate">{vendor.shop_name}</span>
                                  {vendorTier === 'premium' && <VendorVerificationBadge tone="compact" label="" className="shrink-0" />}
                                </div>
                                <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                                  <Users className="w-2.5 h-2.5" /> {vendor.followers_count || 0}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Find Near */}
              {mobileActiveSection === 'findNear' && (
                <div className="p-4">
                  {/* Region pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {TANZANIA_REGIONS.map((region) => (
                      <button
                        key={region}
                        onClick={() => {
                          setActiveRegion(region);
                          regionRequested.current.delete(region);
                          delete regionProductsCache.current[region];
                        }}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors',
                          activeRegion === region
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--color-bg-page)] text-[var(--color-text-body)]',
                        )}
                      >
                        <MapPin className="w-3 h-3" />
                        {region}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[14px] font-bold text-[var(--color-text-heading)]">
                      Products in {activeRegion === ALL_REGION ? 'all regions' : activeRegion}
                    </h4>
                    <Link
                      to={activeRegion === ALL_REGION ? '/explore' : `/explore?region=${encodeURIComponent(activeRegion)}`}
                      onClick={() => setMobileActiveSection(null)}
                      className="text-[12px] font-semibold text-[var(--color-primary)]"
                    >
                      View all <ChevronRight className="w-3 h-3 inline" />
                    </Link>
                  </div>

                  {regionLoading ? (
                    renderSpinner()
                  ) : regionProducts.length === 0 ? (
                    <p className="text-[13px] text-[var(--color-text-muted)]">No products found in this region yet.</p>
                  ) : (
                    renderProductGrid(regionProducts)
                  )}
                </div>
              )}

              {/* Mobile Resource Center */}
              {mobileActiveSection === 'resourceCenter' && (
                <ResourceCenterDropdown onClose={() => setMobileActiveSection(null)} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
