import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  ChevronDown,
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
  type LucideIcon,
} from 'lucide-react';
import { cn } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ResourceCenterDropdown } from './ResourceCenterDropdown';
import {
  fetchCategories,
  fetchProducts,
  getProductPrice,
  getProductPrimaryImage,
  CatalogCategory,
  CatalogProduct,
} from '../services/productService';
import { getRegions } from '../data/tanzaniaLocations';
import { formatCurrency } from '../utils/currency';
import { getProductPath } from '../utils/products';

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
    if (activeDropdown !== 'findNear') return;

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

    const params = region === ALL_REGION
      ? { per_page: PRODUCTS_PER_CATEGORY }
      : { per_page: PRODUCTS_PER_CATEGORY, region };

    fetchProducts(params)
      .then((response) => {
        if (isMounted) {
          // If API doesn't filter by region, filter client-side
          let filtered = response.products;
          if (region !== ALL_REGION && filtered.length > 0) {
            const regionFiltered = filtered.filter(
              (product) => product.vendor?.region?.toLowerCase() === region.toLowerCase()
            );
            if (regionFiltered.length > 0) {
              filtered = regionFiltered;
            }
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
  }, [activeDropdown, activeRegion]);

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
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {products.map((product) => (
          <Link
            key={product.id}
            to={getProductPath(product)}
            onClick={() => setActiveDropdown(null)}
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
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {Array.from({ length: PRODUCTS_PER_CATEGORY }).map((_, index) => (
          <div key={index} className="flex flex-col gap-1">
            <div className="aspect-square rounded-[8px] bg-[var(--color-bg-page)] animate-pulse" />
            <div className="h-3 w-2/3 rounded-full bg-[var(--color-bg-page)] animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
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
          <div className="w-full px-4">
            <div className="flex bg-white rounded-b-[16px] border border-t-0 border-[var(--color-border)] shadow-[var(--shadow-level-3)] overflow-hidden max-h-[70vh]">
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
                  /* Default: mixed products from all categories */
                  featuredLoading || featuredProducts.length === 0 ? (
                    featuredLoading ? renderLoadingGrid() : (
                      <p className="text-[14px] text-[var(--color-text-muted)]">
                        Products will appear here soon.
                      </p>
                    )
                  ) : (
                    renderProductGrid(featuredProducts)
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
        </div>
      )}

      {/* ─── Find Near Products Dropdown ─── */}
      {activeDropdown === 'findNear' && (
        <div className="absolute left-0 right-0 top-full" onMouseEnter={cancelClose}>
          <div className="w-full px-4">
            <div className="flex bg-white rounded-b-[16px] border border-t-0 border-[var(--color-border)] shadow-[var(--shadow-level-3)] overflow-hidden max-h-[70vh]">
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
                  renderLoadingGrid()
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
        </div>
      )}

      {/* ─── Resource Center Dropdown ─── */}
      {activeDropdown === 'resourceCenter' && (
        <div className="absolute left-0 right-0 top-full" onMouseEnter={cancelClose}>
          <div className="w-full px-4">
            <div className="bg-white rounded-b-[16px] border border-t-0 border-[var(--color-border)] shadow-[var(--shadow-level-3)] overflow-hidden">
              <ResourceCenterDropdown onClose={() => setActiveDropdown(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
