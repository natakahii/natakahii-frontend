import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Heart, Search, ShoppingCart, SlidersHorizontal, Star, X, MapPin } from 'lucide-react';
import { Badge, VendorVerificationBadge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { EmptyState } from '../components/ui/empty-state';
import { Skeleton } from '../components/ui/skeleton';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  CatalogCategory,
  CatalogProduct,
  fetchCategories,
  fetchProducts,
  getProductDiscountPercent,
  getProductPrice,
  getProductPrimaryImage,
} from '../services/productService';
import { formatCurrency } from '../utils/currency';
import { getProductPath } from '../utils/products';
import { useCart } from '../providers/CartProvider';
import { useToast } from '../components/ui/toast';

function parseNumberParam(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 12, total: 0 });
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [draftMinPrice, setDraftMinPrice] = useState(searchParams.get('min_price') || '');
  const [draftMaxPrice, setDraftMaxPrice] = useState(searchParams.get('max_price') || '');
  const previousFilterKey = useRef('');
  const { addToCart } = useCart();
  const { toast } = useToast();

  const currentPage = Math.max(1, Number(searchParams.get('page') || '1') || 1);
  const categoryParam = searchParams.get('category') || '';
  const vendorParam = searchParams.get('vendor') || '';
  const searchParam = searchParams.get('search') || '';
  const minPriceParam = parseNumberParam(searchParams.get('min_price'));
  const maxPriceParam = parseNumberParam(searchParams.get('max_price'));
  const sortBy = (searchParams.get('sort_by') as 'created_at' | 'price' | 'name' | null) || 'created_at';
  const sortDir = (searchParams.get('sort_dir') as 'asc' | 'desc' | null) || 'desc';

  useEffect(() => {
    setSearchInput(searchParam);
    setDraftMinPrice(searchParams.get('min_price') || '');
    setDraftMaxPrice(searchParams.get('max_price') || '');
  }, [searchParam, searchParams]);

  useEffect(() => {
    let isMounted = true;

    fetchCategories()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setCategories(response);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setCategories([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const filterKey = JSON.stringify({
      categoryParam,
      vendorParam,
      searchParam,
      minPriceParam,
      maxPriceParam,
      sortBy,
      sortDir,
    });
    const shouldAppend = currentPage > 1 && previousFilterKey.current === filterKey;

    setError(null);

    if (shouldAppend) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    fetchProducts({
      category: categoryParam || undefined,
      vendorId: vendorParam || undefined,
      search: searchParam || undefined,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
      sortBy,
      sortDir,
      page: currentPage,
      per_page: 12,
    })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setMeta(response.meta);
        setProducts((previousProducts) => {
          if (!shouldAppend) {
            return response.products;
          }

          const seenIds = new Set(previousProducts.map((product) => product.id));
          const nextProducts = [...previousProducts];

          response.products.forEach((product) => {
            if (!seenIds.has(product.id)) {
              nextProducts.push(product);
            }
          });

          return nextProducts;
        });

        previousFilterKey.current = filterKey;
      })
      .catch((loadError: any) => {
        if (!isMounted) {
          return;
        }

        if (!shouldAppend) {
          setProducts([]);
        }

        setError(loadError?.message || 'Unable to load products right now.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [categoryParam, currentPage, maxPriceParam, minPriceParam, searchParam, sortBy, sortDir, vendorParam]);

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === categoryParam) || null,
    [categories, categoryParam]
  );

  const selectedVendorName = useMemo(() => {
    if (!vendorParam) {
      return null;
    }

    const productWithVendor = products.find((product) => String(product.vendor?.id) === vendorParam);
    return productWithVendor?.vendor?.shop_name || `Vendor #${vendorParam}`;
  }, [products, vendorParam]);

  const pageTitle = selectedCategory?.name || selectedVendorName || 'All Products';

  const activeFilters = [
    selectedCategory ? { key: 'category', label: selectedCategory.name } : null,
    selectedVendorName ? { key: 'vendor', label: selectedVendorName } : null,
    searchParam ? { key: 'search', label: `"${searchParam}"` } : null,
    minPriceParam != null || maxPriceParam != null
      ? { key: 'price', label: `${minPriceParam ? formatCurrency(minPriceParam) : 'Min'} - ${maxPriceParam ? formatCurrency(maxPriceParam) : 'Max'}` }
      : null,
  ].filter((filter): filter is { key: string; label: string } => Boolean(filter));

  const updateParams = (updates: Record<string, string | null | undefined>, resetPage = true) => {
    const nextParams = new URLSearchParams(searchParams);

    if (resetPage) {
      nextParams.delete('page');
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value == null || value === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ search: searchInput.trim() || null });
  };

  const handleApplyPrice = () => {
    updateParams({
      min_price: draftMinPrice.trim() || null,
      max_price: draftMaxPrice.trim() || null,
    });
    setIsFilterOpen(false);
  };

  const handleClearAll = () => {
    setSearchInput('');
    setDraftMinPrice('');
    setDraftMaxPrice('');
    setSearchParams(new URLSearchParams());
  };

  const handleLoadMore = () => {
    updateParams({ page: String(meta.current_page + 1) }, false);
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="text-[12px] text-[var(--color-text-muted)] mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-[var(--color-primary)]">Home</Link>
        <span>/</span>
        <span className="text-[var(--color-text-heading)] font-medium">{pageTitle}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:hidden flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <Button variant="secondary" size="s" onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 rounded-full border-[var(--color-border)] text-[var(--color-text-body)] hover:bg-[var(--color-bg-card)]">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <span className="text-[var(--color-text-muted)]">Sort:</span>
            <select
              value={`${sortBy}:${sortDir}`}
              onChange={(event) => {
                const [nextSortBy, nextSortDir] = event.target.value.split(':');
                updateParams({
                  sort_by: nextSortBy,
                  sort_dir: nextSortDir,
                });
              }}
              className="bg-transparent font-bold text-[var(--color-text-heading)] focus:outline-none"
            >
              <option value="created_at:desc">Newest</option>
              <option value="price:asc">Price: Low to High</option>
              <option value="price:desc">Price: High to Low</option>
              <option value="name:asc">Name A-Z</option>
            </select>
          </div>
        </div>

        {isFilterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsFilterOpen(false)}>
            <div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] max-h-[85vh] overflow-y-auto shadow-[var(--shadow-level-4)] transition-transform translate-y-0"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between z-10">
                <span className="text-[18px] font-bold text-[var(--color-text-heading)]">Filters</span>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 -mr-2 bg-[var(--color-bg-card)] rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                  <h3 className="font-bold text-[16px] text-[var(--color-text-heading)]">Search</h3>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Search catalog"
                      className="w-full bg-[var(--color-bg-card)] rounded-[12px] pl-10 pr-4 py-3 text-[14px] text-[var(--color-text-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                </form>

                <div>
                  <h3 className="font-bold text-[16px] text-[var(--color-text-heading)] mb-4">Categories</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => updateParams({ category: null })}
                      className={`w-full text-left px-4 py-3 rounded-[12px] border transition-all ${!categoryParam ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}
                    >
                      All categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => updateParams({ category: String(category.id) })}
                        className={`w-full text-left px-4 py-3 rounded-[12px] border transition-all ${categoryParam === String(category.id) ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-[16px] text-[var(--color-text-heading)]">Price Range (TZS)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={draftMinPrice}
                      onChange={(event) => setDraftMinPrice(event.target.value)}
                      className="w-full bg-[var(--color-bg-card)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--color-text-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={draftMaxPrice}
                      onChange={(event) => setDraftMaxPrice(event.target.value)}
                      className="w-full bg-[var(--color-bg-card)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--color-text-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-[var(--color-border)] p-4 flex gap-3 z-10 pb-[calc(env(safe-area-inset-bottom)+16px)]">
                <Button variant="outline" className="flex-1" onClick={handleClearAll}>Reset</Button>
                <Button variant="primary" className="flex-1" onClick={handleApplyPrice}>Apply</Button>
              </div>
            </div>
          </div>
        )}

        <div className="hidden lg:block lg:w-[280px] shrink-0 sticky top-24 self-start">
          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-[16px] text-[var(--color-text-heading)] mb-4">Search</h3>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search products"
                  className="w-full bg-[var(--color-bg-card)] rounded-[12px] pl-10 pr-4 py-3 text-[14px] text-[var(--color-text-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </form>
            </div>

            <div>
              <h3 className="font-bold text-[16px] text-[var(--color-text-heading)] mb-4">Categories</h3>
              <div className="space-y-3">
                <button
                  onClick={() => updateParams({ category: null })}
                  className={`w-full text-left px-4 py-3 rounded-[12px] border transition-all ${!categoryParam ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}
                >
                  All categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => updateParams({ category: String(category.id) })}
                    className={`w-full text-left px-4 py-3 rounded-[12px] border transition-all ${categoryParam === String(category.id) ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}
                  >
                    <span className="block font-semibold">{category.name}</span>
                    {category.products_count != null && (
                      <span className="block text-[12px] text-[var(--color-text-muted)] mt-1">{category.products_count} products</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-[16px] text-[var(--color-text-heading)] mb-4">Price Range (TZS)</h3>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={draftMinPrice}
                  onChange={(event) => setDraftMinPrice(event.target.value)}
                  className="w-full bg-[var(--color-bg-card)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--color-text-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <span className="text-[var(--color-text-muted)]">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={draftMaxPrice}
                  onChange={(event) => setDraftMaxPrice(event.target.value)}
                  className="w-full bg-[var(--color-bg-card)] rounded-[12px] px-4 py-3 text-[14px] text-[var(--color-text-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setDraftMinPrice(''); setDraftMaxPrice(''); updateParams({ min_price: null, max_price: null }); }}>
                  Clear
                </Button>
                <Button variant="primary" className="flex-1" onClick={handleApplyPrice}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="hidden lg:block mb-8">
            <div className="flex items-center justify-between mb-4 gap-4">
              <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-text-heading)]">
                {pageTitle} <span className="text-[var(--color-text-muted)] text-[16px] font-normal ml-2">{meta.total.toLocaleString()} results</span>
              </h1>
              <div className="flex items-center gap-3 bg-[var(--color-bg-card)] px-4 py-2 rounded-full">
                <span className="text-[13px] font-medium text-[var(--color-text-muted)]">Sort by:</span>
                <select
                  value={`${sortBy}:${sortDir}`}
                  onChange={(event) => {
                    const [nextSortBy, nextSortDir] = event.target.value.split(':');
                    updateParams({
                      sort_by: nextSortBy,
                      sort_dir: nextSortDir,
                    });
                  }}
                  className="bg-transparent font-bold text-[14px] text-[var(--color-text-heading)] focus:outline-none cursor-pointer"
                >
                  <option value="created_at:desc">Newest</option>
                  <option value="price:asc">Price: Low to High</option>
                  <option value="price:desc">Price: High to Low</option>
                  <option value="name:asc">Name A-Z</option>
                </select>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => updateParams({
                      [filter.key === 'category' ? 'category' : filter.key === 'vendor' ? 'vendor' : filter.key === 'search' ? 'search' : 'min_price']: null,
                      ...(filter.key === 'price' ? { max_price: null } : {}),
                    })}
                    className="inline-flex items-center gap-1 bg-[var(--color-primary-bg)] text-[var(--color-primary)] px-3 py-1 rounded-full text-[12px] font-medium"
                  >
                    {filter.label}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                <button className="text-[12px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] underline ml-2" onClick={handleClearAll}>
                  Clear all
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="h-full flex flex-col">
                  <Skeleton className="aspect-[4/5] rounded-t-[16px]" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="w-2/3 h-3" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-1/2 h-5" />
                  </div>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              variant="search"
              title="No products matched"
              description={error || 'Try adjusting your filters, search, or price range to discover more products.'}
              actionLabel="Clear Filters"
              actionOnClick={handleClearAll}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
                {products.map((product) => {
                  const discountPercent = getProductDiscountPercent(product);
                  const rating = product.reviews_avg_rating ? product.reviews_avg_rating.toFixed(1) : null;
                  const price = getProductPrice(product);

                  return (
                    <Link to={getProductPath(product)} key={product.id}>
                      <Card className="group cursor-pointer hover:shadow-[var(--shadow-level-2)] transition-shadow h-full flex flex-col">
                        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-card)]">
                          <ImageWithFallback src={getProductPrimaryImage(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-white transition-all">
                            <Heart className="w-4 h-4" />
                          </button>
                          <Badge variant={discountPercent ? 'hot-deal' : 'new'} className="absolute top-3 left-3">
                            {discountPercent ? `-${discountPercent}%` : 'Live'}
                          </Badge>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="text-[12px] text-[var(--color-text-muted)] mb-1 flex items-center justify-between">
                            <span className="min-w-0 flex items-center gap-2">
                              <span className="truncate font-semibold text-[var(--color-text-body)]">
                                {product.vendor?.shop_name || 'Verified Vendor'}
                              </span>
                              {product.vendor?.status === 'approved' && (
                                <VendorVerificationBadge tone="compact" label="Verified" className="shrink-0" />
                              )}
                            </span>
                            {rating ? (
                              <span className="flex items-center gap-1 text-[var(--color-text-heading)] font-medium">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {rating}
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-[var(--color-primary)]">New</span>
                            )}
                          </div>
                          {product.vendor && (
                            <div className="text-[11px] text-[var(--color-text-muted)] mb-2 flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                {[product.vendor.street, product.vendor.region, product.vendor.city].filter(Boolean).join(', ') || product.vendor.shop_name || 'Verified Vendor'}
                              </span>
                            </div>
                          )}
                          <h3 className="font-semibold text-[14px] text-[var(--color-text-heading)] line-clamp-2 mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                            {product.name}
                          </h3>
                          <div className="mt-auto flex items-end justify-between">
                            <div>
                              {product.discount_price && product.discount_price < product.price && (
                                <div className="text-[12px] text-[var(--color-text-muted)] line-through decoration-red-500/50">{formatCurrency(product.price)}</div>
                              )}
                              <div className="text-[16px] lg:text-[18px] font-bold text-[var(--color-text-heading)] tracking-tight">
                                {formatCurrency(price)}
                              </div>
                            </div>
                            <Button
                              variant="secondary"
                              size="xs"
                              className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-[var(--color-primary-bg)] border-transparent hover:bg-[var(--color-primary)] hover:text-white transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try {
                                  await addToCart(product.id, 1);
                                  toast({ type: 'success', title: 'Added to cart!' });
                                } catch (err: any) {
                                  toast({ type: 'error', title: err?.message || 'Failed to add to cart' });
                                }
                              }}
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Infinite scroll trigger - hidden element that triggers load when visible */}
              {meta.current_page < meta.last_page && (
                <div
                  ref={(el) => {
                    if (!el) return;
                    const observer = new IntersectionObserver(
                      (entries) => {
                        if (entries[0].isIntersecting && !isLoadingMore) {
                          handleLoadMore();
                        }
                      },
                      { rootMargin: '100px' }
                    );
                    observer.observe(el);
                    return () => observer.disconnect();
                  }}
                  className="h-10 mt-8 flex items-center justify-center"
                >
                  {isLoadingMore && (
                    <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                      <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[14px]">Loading more...</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
