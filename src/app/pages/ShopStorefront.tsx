import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ChevronRight, Heart, MapPin, Search, ShoppingBag, ShoppingCart, Star, Users } from 'lucide-react';
import { Badge, VendorTrustBadge, VendorVerificationBadge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { EmptyState } from '../components/ui/empty-state';
import { Skeleton } from '../components/ui/skeleton';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { CatalogCategory, CatalogProduct, CatalogVendor, getProductDiscountPercent, getProductPrice, getProductPrimaryImage } from '../services/productService';
import { fetchVendorStorefront } from '../services/storefrontService';
import { formatCurrency } from '../utils/currency';
import { getProductPath } from '../utils/products';
import { getVendorVerificationTier } from '../utils/vendorVerification';
import { useCart } from '../providers/CartProvider';
import { useToast } from '../components/ui/toast';

export function ShopStorefront() {
  const { shopSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vendor, setVendor] = useState<CatalogVendor | null>(null);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 12, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const previousFilterKey = useRef('');

  const currentPage = Math.max(1, Number(searchParams.get('page') || '1') || 1);
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortBy = (searchParams.get('sort_by') as 'created_at' | 'price' | 'name' | null) || 'created_at';
  const sortDir = (searchParams.get('sort_dir') as 'asc' | 'desc' | null) || 'desc';

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    if (!shopSlug) {
      setVendor(null);
      setCategories([]);
      setProducts([]);
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const filterKey = JSON.stringify({
      categoryParam,
      searchParam,
      sortBy,
      sortDir,
    });
    const shouldAppend = currentPage > 1 && previousFilterKey.current === filterKey;

    setError(null);
    setNotFound(false);

    if (shouldAppend) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    fetchVendorStorefront(shopSlug, {
      category: categoryParam || undefined,
      search: searchParam || undefined,
      sortBy,
      sortDir,
      page: currentPage,
      per_page: 12,
    })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setVendor(response.vendor);
        setCategories(response.categories);
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

        setVendor(null);
        setCategories([]);
        setProducts([]);
        setMeta({ current_page: 1, last_page: 1, per_page: 12, total: 0 });
        setNotFound(loadError?.status === 404);
        setError(loadError?.message || 'Unable to load this storefront right now.');
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
  }, [categoryParam, currentPage, searchParam, shopSlug, sortBy, sortDir]);

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === categoryParam) || null,
    [categories, categoryParam]
  );

  const activeFilters = [
    selectedCategory ? { key: 'category', label: selectedCategory.name } : null,
    searchParam ? { key: 'search', label: `"${searchParam}"` } : null,
  ].filter((filter): filter is { key: string; label: string } => Boolean(filter));

  const storefrontLabel = vendor?.shop_slug ? `natakahii.com/shop/${vendor.shop_slug}` : null;
  const totalFollowers = vendor?.followers_count ?? 0;
  const totalProducts = vendor?.products_count ?? meta.total;
  const vendorTier = getVendorVerificationTier(vendor);
  const hasFilters = Boolean(categoryParam || searchParam);

  const updateParams = (updates: Record<string, string | null | undefined>, resetPage = true) => {
    const nextParams = new URLSearchParams(searchParams);

    if (resetPage) {
      nextParams.delete('page');
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
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

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const handleLoadMore = () => {
    updateParams({ page: String(meta.current_page + 1) }, false);
  };

  if (isLoading && !vendor) {
    return (
      <div className="container mx-auto px-4 py-8 lg:py-12 space-y-8">
        <Skeleton className="h-[280px] rounded-[28px]" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="w-28 h-10 rounded-full" />
          ))}
        </div>
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
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          variant="search"
          title="Store not found"
          description="This shop link may be wrong, the store may no longer be public, or it has not been approved yet."
          actionLabel="Explore Marketplace"
          actionHref="/explore"
        />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          variant="search"
          title="Store unavailable"
          description={error || 'We could not load this shop right now.'}
          actionLabel="Back to Explore"
          actionHref="/explore"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="text-[13px] text-[var(--color-text-muted)] mb-6 flex flex-wrap items-center gap-2 font-medium">
        <Link to="/" className="hover:text-[var(--color-primary)]">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[var(--color-text-heading)]">Shop</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[var(--color-text-heading)] line-clamp-1 max-w-[220px] truncate">{vendor.shop_name}</span>
      </div>

      <section className="bg-white border border-[var(--color-border)] rounded-[16px] p-6 md:p-8 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-[16px] overflow-hidden border border-[var(--color-border)] shrink-0 bg-[var(--color-bg-card)]">
            <ImageWithFallback src={vendor.logo || '/natakahii-logo.png'} alt={vendor.shop_name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[22px] md:text-[28px] font-bold text-[var(--color-text-heading)] leading-tight">
                {vendor.shop_name}
              </h1>
              {vendorTier === 'premium' && <VendorVerificationBadge tone="hero" label="Premium Verified" />}
              {vendorTier === 'kyc' && <VendorTrustBadge tone="hero" label="KYC Checked" />}
              <p className="text-[13px] text-[var(--color-text-muted)]">
                @{vendor.shop_slug || 'store'}
              </p>
            </div>

            <p className="text-[14px] text-[var(--color-text-body)] leading-relaxed mt-2 max-w-2xl">
              {vendor.description || 'This shop is now live on Nataka Hii. Browse products directly from the vendor storefront and discover everything they have published.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-[13px] text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-[var(--color-text-heading)] font-semibold">{totalProducts.toLocaleString()}</span>
                <span>product{totalProducts === 1 ? '' : 's'}</span>
              </span>
              {vendor.city && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                  <MapPin className="w-4 h-4" />
                  {vendor.city}, {vendor.region}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                <span className="text-[var(--color-text-heading)] font-semibold">{totalFollowers.toLocaleString()}</span>
                <span>follower{totalFollowers === 1 ? '' : 's'}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-2xl">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={`Search inside ${vendor.shop_name}`}
              className="w-full bg-[var(--color-bg-card)] rounded-full pl-11 pr-28 py-3.5 text-[14px] text-[var(--color-text-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <Button type="submit" variant="primary" size="s" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-5">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-3 bg-[var(--color-bg-card)] px-4 py-2.5 rounded-full">
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

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParams({ category: null })}
            className={`px-4 py-2 rounded-full border text-[13px] font-semibold transition-all ${
              !categoryParam
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-text-body)] hover:border-[var(--color-primary)]'
            }`}
          >
            All products
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => updateParams({ category: String(category.id) })}
              className={`px-4 py-2 rounded-full border text-[13px] font-semibold transition-all ${
                categoryParam === String(category.id)
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-body)] hover:border-[var(--color-primary)]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-[14px] text-[var(--color-text-muted)]">
            <span className="font-bold text-[var(--color-text-heading)]">{meta.total.toLocaleString()}</span> result{meta.total === 1 ? '' : 's'}
            {selectedCategory ? ` in ${selectedCategory.name}` : ''}.
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => updateParams({ [filter.key]: null })}
                  className="inline-flex items-center gap-1 bg-[var(--color-primary-bg)] text-[var(--color-primary)] px-3 py-1 rounded-full text-[12px] font-medium"
                >
                  {filter.label}
                </button>
              ))}
              <button className="text-[12px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] underline" onClick={handleClearFilters}>
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {isLoading && products.length === 0 ? (
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
          variant={hasFilters ? 'search' : 'products'}
          title={hasFilters ? 'No products matched this store search' : 'This store has no published products yet'}
          description={
            error ||
            (hasFilters
              ? 'Try a different search or category to find products from this shop.'
              : 'This seller storefront is live, but there are no active products published yet.')
          }
          actionLabel={hasFilters ? 'Clear Filters' : 'Explore Marketplace'}
          actionOnClick={hasFilters ? handleClearFilters : undefined}
          actionHref={hasFilters ? undefined : '/explore'}
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
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <Badge variant={discountPercent ? 'hot-deal' : 'new'}>
                          {discountPercent ? `-${discountPercent}%` : 'Live'}
                        </Badge>
                        {(product.video_count ?? 0) > 0 && (
                          <Badge variant="secondary" className="bg-black/70 text-white border-transparent">
                            {product.video_count} video{product.video_count === 1 ? '' : 's'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="text-[12px] text-[var(--color-text-muted)] mb-1 flex items-center justify-between gap-3">
                        <span className="truncate">{product.category?.name || vendor.shop_name}</span>
                        {rating ? (
                          <span className="flex items-center gap-1 text-[var(--color-text-heading)] font-medium shrink-0">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {rating}
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-[var(--color-primary)] shrink-0">New</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-[14px] text-[var(--color-text-heading)] line-clamp-2 mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                        {product.name}
                      </h3>
                      <div className="mt-auto flex items-end justify-between gap-3">
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

          {meta.current_page < meta.last_page && (
            <div className="mt-12 flex justify-center">
              <Button
                variant="primary"
                size="l"
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-md w-full max-w-[240px] border-none font-bold"
                onClick={handleLoadMore}
                isLoading={isLoadingMore}
              >
                Load More Products
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
