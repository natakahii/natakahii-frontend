import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { BellRing, CheckCircle, ChevronRight, Clock, Heart, Minus, Plus, Share2, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { AnimatedPrice } from '../components/ui/animated-price';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { EmptyState } from '../components/ui/empty-state';
import { FloatingCart } from '../components/ui/floating-cart';
import { Skeleton } from '../components/ui/skeleton';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useToast } from '../components/ui/toast';
import {
  CatalogProduct,
  CatalogProductVariant,
  fetchProduct,
  getProductPrice,
  getProductPrimaryImage,
} from '../services/productService';
import { formatCurrency } from '../utils/currency';
import { getProductPath } from '../utils/products';
import { getVendorStorefrontPath } from '../utils/storefront';

function getVariantSelections(variant: CatalogProductVariant) {
  return variant.attribute_values.reduce<Record<string, string>>((selection, attributeValue) => {
    const key = attributeValue.attribute?.code || attributeValue.attribute?.name || `option-${attributeValue.id}`;
    const value = attributeValue.attribute_value?.value || (attributeValue.numeric_value != null ? String(attributeValue.numeric_value) : '');

    if (value) {
      selection[key] = value;
    }

    return selection;
  }, {});
}

export function ProductDetail() {
  const { productIdentifier } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState('');
  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('Description');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!productIdentifier) {
      setError('Product not found.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchProduct(productIdentifier)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const canonicalPath = getProductPath(response.product);

        if (canonicalPath !== `/product/${productIdentifier}`) {
          navigate(canonicalPath, { replace: true });
        }

        setProduct(response.product);
        setRecentReviews(response.recent_reviews);
        setActiveImage(getProductPrimaryImage(response.product));
        setQty(1);
        setActiveTab('Description');

        const initialSelections: Record<string, string> = {};
        const firstVariant = response.product.variants[0];

        if (firstVariant) {
          Object.assign(initialSelections, getVariantSelections(firstVariant));
        }

        setSelectedOptions(initialSelections);
      })
      .catch((loadError: any) => {
        if (!isMounted) {
          return;
        }

        setProduct(null);
        setRecentReviews([]);
        setError(loadError?.message || 'Unable to load this product right now.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [navigate, productIdentifier]);

  const galleryImages = useMemo(() => {
    if (!product) {
      return [];
    }

    return product.images.length > 0
      ? product.images.map((image) => image.image_path)
      : [getProductPrimaryImage(product)];
  }, [product]);

  const optionGroups = useMemo(() => {
    if (!product) {
      return [];
    }

    const groups = new Map<string, { key: string; label: string; values: string[] }>();

    product.variants.forEach((variant) => {
      variant.attribute_values.forEach((attributeValue) => {
        const key = attributeValue.attribute?.code || attributeValue.attribute?.name || `option-${attributeValue.id}`;
        const label = attributeValue.attribute?.name || key;
        const value = attributeValue.attribute_value?.value || (attributeValue.numeric_value != null ? String(attributeValue.numeric_value) : '');

        if (!value) {
          return;
        }

        if (!groups.has(key)) {
          groups.set(key, { key, label, values: [] });
        }

        const group = groups.get(key)!;

        if (!group.values.includes(value)) {
          group.values.push(value);
        }
      });
    });

    return Array.from(groups.values());
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product || product.variants.length === 0) {
      return null;
    }

    return product.variants.find((variant) => {
      const selections = getVariantSelections(variant);
      return optionGroups.every((group) => !selectedOptions[group.key] || selections[group.key] === selectedOptions[group.key]);
    }) || null;
  }, [optionGroups, product, selectedOptions]);

  const currentUnitPrice = useMemo(() => {
    if (!product) {
      return 0;
    }

    if (selectedVariant) {
      return selectedVariant.discount_price ?? selectedVariant.price ?? getProductPrice(product);
    }

    return getProductPrice(product);
  }, [product, selectedVariant]);

  const compareAtPrice = useMemo(() => {
    if (!product) {
      return null;
    }

    if (selectedVariant?.discount_price != null && selectedVariant.price != null && selectedVariant.discount_price < selectedVariant.price) {
      return selectedVariant.price;
    }

    if (product.discount_price != null && product.discount_price < product.price) {
      return product.price;
    }

    return null;
  }, [product, selectedVariant]);

  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const totalPrice = currentUnitPrice * qty;
  const reviewsAverage = product?.reviews_avg_rating ? product.reviews_avg_rating.toFixed(1) : null;
  const reviewsCount = product?.reviews_count || recentReviews.length;
  const vendorStorefrontPath = getVendorStorefrontPath(product?.vendor);

  const handleCatalogOnlyAction = () => {
    toast({
      type: 'info',
      title: 'Catalog is live',
      message: 'Real cart and checkout wiring are the next step, so this action is coming next.',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-[24px]" />
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="w-[90px] h-[90px] rounded-[16px]" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="w-32 h-8 rounded-full" />
            <Skeleton className="w-3/4 h-10" />
            <Skeleton className="w-1/2 h-6" />
            <Skeleton className="w-40 h-12" />
            <Skeleton className="w-full h-40 rounded-[16px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          variant="search"
          title="Product not available"
          description={error || 'This product may have been removed or is no longer active.'}
          actionLabel="Browse Catalog"
          actionHref="/explore"
        />
      </div>
    );
  }

  const tabs = [
    'Description',
    `Reviews (${reviewsCount})`,
    'Shipping & Return',
    'Vendor Info',
  ];

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <FloatingCart price={formatCurrency(totalPrice)} onAddToCart={handleCatalogOnlyAction} />

      <div className="text-[13px] text-[var(--color-text-muted)] mb-8 flex flex-wrap items-center gap-2 font-medium">
        <Link to="/" className="hover:text-[var(--color-primary)]">Home</Link>
        <ChevronRight className="w-4 h-4" />
        {product.category ? (
          <>
            <Link to={`/explore?category=${product.category.id}`} className="hover:text-[var(--color-primary)]">{product.category.name}</Link>
            <ChevronRight className="w-4 h-4" />
          </>
        ) : null}
        {product.vendor ? (
          <>
            <Link to={vendorStorefrontPath} className="hover:text-[var(--color-primary)] flex items-center gap-1">
              {product.vendor.shop_name} {product.vendor.status === 'approved' && <CheckCircle className="w-3 h-3 text-[var(--color-primary)]" />}
            </Link>
            <ChevronRight className="w-4 h-4" />
          </>
        ) : null}
        <span className="text-[var(--color-text-heading)] line-clamp-1 max-w-[200px] truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square bg-[var(--color-bg-card)] rounded-[24px] overflow-hidden group cursor-zoom-in shadow-[var(--shadow-level-1)]">
            <ImageWithFallback src={activeImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500 ease-out" />
            {compareAtPrice ? (
              <Badge variant="hot-deal" className="absolute top-4 left-4 text-[13px] px-4 py-1.5 shadow-sm">
                {Math.round(((compareAtPrice - currentUnitPrice) / compareAtPrice) * 100)}% OFF
              </Badge>
            ) : (
              <Badge variant="new" className="absolute top-4 left-4 text-[13px] px-4 py-1.5 shadow-sm">Live</Badge>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x py-2">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                onClick={() => setActiveImage(image)}
                className={`snap-start shrink-0 relative w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-[16px] overflow-hidden border-2 transition-all ${activeImage === image ? 'border-[var(--color-primary)] shadow-md' : 'border-transparent opacity-70 hover:opacity-100 hover:border-[var(--color-border)]'}`}
              >
                <ImageWithFallback src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover bg-[var(--color-bg-card)]" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-6">
            {product.vendor ? (
              <Link to={vendorStorefrontPath} className="inline-flex items-center gap-2 text-[14px] font-bold text-[var(--color-text-heading)] hover:text-[var(--color-primary)] mb-3 bg-[var(--color-bg-card)] px-3 py-1.5 rounded-full w-fit">
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  <ImageWithFallback src={product.vendor.logo || '/natakahii-logo.png'} alt={product.vendor.shop_name} className="w-full h-full object-cover" />
                </div>
                {product.vendor.shop_name} {product.vendor.status === 'approved' && <CheckCircle className="w-4 h-4 text-[var(--color-primary)]" />}
              </Link>
            ) : null}

            <h1 className="text-[28px] md:text-[36px] font-bold text-[var(--color-text-heading)] tracking-[-0.5px] leading-tight mb-4">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[14px] text-[var(--color-text-muted)] font-medium">
              {reviewsAverage ? (
                <div className="flex items-center gap-1 text-[var(--color-text-heading)] bg-[var(--color-warning-bg)] px-2 py-0.5 rounded-[4px]">
                  <Star className="w-4 h-4 fill-[var(--color-warning)] text-[var(--color-warning)]" />
                  <span className="font-bold">{reviewsAverage}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[var(--color-primary)] bg-[var(--color-primary-bg)] px-2 py-0.5 rounded-[4px]">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-bold">New Arrival</span>
                </div>
              )}
              <span>{reviewsCount} review{reviewsCount === 1 ? '' : 's'}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Live inventory updates</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-end gap-3 mb-2">
              <AnimatedPrice value={totalPrice} className="text-[36px] font-bold text-[var(--color-accent)] leading-none tracking-tight" />
              {compareAtPrice ? (
                <span className="text-[18px] text-[var(--color-text-muted)] line-through font-semibold mb-1 decoration-red-500/50">{formatCurrency(compareAtPrice * qty)}</span>
              ) : null}
            </div>
            <div className={`text-[13px] font-bold flex items-center gap-1 w-fit px-2 py-0.5 rounded-[4px] ${currentStock > 0 ? 'text-[var(--color-success)] bg-[var(--color-success-bg)]' : 'text-[var(--color-error)] bg-[var(--color-error-bg)]'}`}>
              <CheckCircle className="w-3 h-3" /> {currentStock > 0 ? `In Stock (${currentStock} available)` : 'Out of stock'}
            </div>
          </div>

          <hr className="border-[var(--color-border)] mb-8" />

          <div className="space-y-6 mb-8">
            {optionGroups.map((group) => (
              <div key={group.key}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[14px] font-bold text-[var(--color-text-heading)]">{group.label}: <span className="font-normal text-[var(--color-text-body)]">{selectedOptions[group.key] || 'Select an option'}</span></span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {group.values.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedOptions((current) => ({ ...current, [group.key]: value }))}
                      className={`h-11 px-5 rounded-[8px] border-2 font-semibold text-[14px] transition-all flex items-center justify-center min-w-[3rem] ${
                        selectedOptions[group.key] === value
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md'
                          : 'border-[var(--color-border)] text-[var(--color-text-heading)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] bg-white'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4">
              <div className="flex items-center bg-[var(--color-bg-card)] rounded-full h-14 p-1 border-2 border-[var(--color-border)] w-fit shrink-0">
                <button
                  onClick={() => setQty((currentQty) => Math.max(1, currentQty - 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-heading)] hover:bg-white hover:shadow-sm transition-all"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-bold text-[16px] text-[var(--color-text-heading)]">{qty}</span>
                <button
                  onClick={() => setQty((currentQty) => currentQty + 1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-heading)] hover:bg-white hover:shadow-sm transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <Button variant="primary" size="l" className="flex-1 shadow-md" onClick={handleCatalogOnlyAction} disabled={currentStock <= 0}>
                Add to Cart
              </Button>
            </div>

            <Button variant="primary" size="l" className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)] border-none text-[18px]" onClick={handleCatalogOnlyAction} disabled={currentStock <= 0}>
              Buy Now
            </Button>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-[14px] font-semibold text-[var(--color-text-body)] hover:text-[var(--color-primary)] transition-colors">
                <Heart className="w-5 h-5" /> Wishlist
              </button>
              <button className="flex items-center gap-2 text-[14px] font-semibold text-[var(--color-text-body)] hover:text-[var(--color-primary)] transition-colors">
                <Share2 className="w-5 h-5" /> Share
              </button>
              <button className="flex items-center gap-2 text-[14px] font-semibold text-[var(--color-text-body)] hover:text-[var(--color-primary)] transition-colors">
                <BellRing className="w-5 h-5" /> Alert
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-4 bg-[var(--color-primary-bg)] p-4 rounded-[12px] border border-[var(--color-primary-light)]/20">
            <ShieldCheck className="w-8 h-8 text-[var(--color-primary)] shrink-0" />
            <div>
              <h4 className="font-bold text-[14px] text-[var(--color-primary-darker)] mb-1">Secure Escrow Payment</h4>
              <p className="text-[13px] text-[var(--color-text-body)] leading-snug">
                Your money is held safely until you receive and confirm the item is exactly as described.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <div className="flex gap-8 border-b border-[var(--color-border)] overflow-x-auto hide-scrollbar snap-x">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`snap-start shrink-0 pb-4 text-[16px] font-bold transition-all relative ${activeTab === tab ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="product-detail-tabs"
                  transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
                  className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-primary)] rounded-t-[4px]"
                />
              )}
            </button>
          ))}
        </div>

        <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {activeTab === 'Description' && (
              <div className="prose max-w-none text-[var(--color-text-body)] leading-relaxed">
                <p className="mb-4 text-[16px]">
                  {product.description || 'This product does not have a detailed description yet.'}
                </p>
                {optionGroups.length > 0 && (
                  <ul className="list-disc pl-5 space-y-2 mb-6 font-medium">
                    {optionGroups.map((group) => (
                      <li key={group.key}>
                        {group.label}: {group.values.join(', ')}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="bg-[var(--color-primary-bg)] rounded-[16px] p-6 border border-[var(--color-border)] flex flex-col md:flex-row items-center gap-6 mt-8">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-8 h-8 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[16px] text-[var(--color-text-heading)] mb-2">AI: Ask About This Product</h3>
                    <div className="flex w-full gap-2">
                      <input type="text" placeholder="Is this true to size?" className="flex-1 bg-white border border-[var(--color-border)] rounded-full px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                      <Button size="s" variant="primary" className="rounded-full px-6">Ask</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === `Reviews (${reviewsCount})` && (
              <div className="space-y-4">
                {recentReviews.length > 0 ? recentReviews.map((review) => (
                  <Card key={review.id} className="p-5 border-[var(--color-border)] shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-bold text-[15px] text-[var(--color-text-heading)]">{review.user?.name || 'Verified Customer'}</div>
                        <div className="flex items-center gap-1 mt-2">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star key={index} className={`w-4 h-4 ${index < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--color-border)]'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[12px] text-[var(--color-text-muted)]">
                        {review.created_at ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(review.created_at)) : 'Recent'}
                      </span>
                    </div>
                    <p className="mt-4 text-[14px] text-[var(--color-text-body)] leading-relaxed">{review.comment || 'No written review provided.'}</p>
                  </Card>
                )) : (
                  <EmptyState
                    variant="products"
                    title="No reviews yet"
                    description="This product is live, but customer reviews have not been posted yet."
                  />
                )}
              </div>
            )}

            {activeTab === 'Shipping & Return' && (
              <div className="space-y-4 text-[15px] text-[var(--color-text-body)] leading-relaxed">
                <p>Shipping quotes and checkout are already supported by the backend and will be wired in the next phase. For now, product details and pricing are live.</p>
                <p>Every order on Nataka Hii is protected by escrow, so payment is held securely until delivery is confirmed.</p>
              </div>
            )}

            {activeTab === 'Vendor Info' && (
              <Card className="p-6 border-[var(--color-border)] shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--color-border)]">
                    <ImageWithFallback src={product.vendor?.logo || '/natakahii-logo.png'} alt={product.vendor?.shop_name || 'Vendor'} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[20px] text-[var(--color-text-heading)] flex items-center gap-2">
                      {product.vendor?.shop_name || 'Verified Vendor'}
                      {product.vendor?.status === 'approved' && <CheckCircle className="w-4 h-4 text-[var(--color-primary)]" />}
                    </h3>
                    <p className="text-[14px] text-[var(--color-text-muted)] mt-1 capitalize">{product.vendor?.status || 'active'} seller</p>
                  </div>
                </div>
                <p className="text-[15px] text-[var(--color-text-body)] leading-relaxed">
                  {product.vendor?.description || 'This vendor has not added a public store description yet.'}
                </p>
                {product.vendor?.id ? (
                  <Link to={vendorStorefrontPath} className="inline-block mt-6">
                    <Button variant="secondary">View More Products</Button>
                  </Link>
                ) : null}
              </Card>
            )}
          </div>

          <div>
            <Card className="p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--color-border)]">
                  <ImageWithFallback src={product.vendor?.logo || '/natakahii-logo.png'} alt={product.vendor?.shop_name || 'Vendor'} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-[18px] text-[var(--color-text-heading)] flex items-center gap-1">
                    {product.vendor?.shop_name || 'Verified Vendor'} {product.vendor?.status === 'approved' && <CheckCircle className="w-4 h-4 text-[var(--color-primary)]" />}
                  </h3>
                  <div className="text-[13px] text-[var(--color-text-muted)] font-medium mt-1">
                    {product.vendor?.status === 'approved' ? 'Approved store' : 'Active store'} • {reviewsCount} product review{reviewsCount === 1 ? '' : 's'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="primary" className="flex-1" onClick={handleCatalogOnlyAction}>Follow Vendor</Button>
                {product.vendor?.id ? (
                  <Link to={vendorStorefrontPath} className="flex-1">
                    <Button variant="secondary" className="w-full">Visit Store</Button>
                  </Link>
                ) : (
                  <Button variant="secondary" className="flex-1" onClick={handleCatalogOnlyAction}>Visit Store</Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
