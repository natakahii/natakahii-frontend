import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { motion, useAnimationControls } from 'motion/react';
import { Bookmark, CheckCircle, ChevronRight, Clock, Heart, Minus, Plus, Share2, Sparkles, Star } from 'lucide-react';
import { AnimatedPrice } from '../components/ui/animated-price';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { EmptyState } from '../components/ui/empty-state';
import { FloatingCart } from '../components/ui/floating-cart';
import { Skeleton } from '../components/ui/skeleton';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useToast } from '../components/ui/toast';
import { useCart } from '../providers/CartProvider';
import { useAuth } from '../providers/AuthProvider';
import {
  CatalogProduct,
  CatalogProductVariant,
  fetchProduct,
  fetchProducts,
  getProductDiscountPercent,
  getProductPrice,
  getProductPrimaryImage,
  toggleWishlist,
} from '../services/productService';
import { likeProduct, unlikeProduct, shareProduct } from '../services/videoFeedService';
import { formatCurrency } from '../utils/currency';
import { getProductPath } from '../utils/products';
import { getVendorStorefrontPath } from '../utils/storefront';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '../components/ui/drawer';

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
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [sharesCount, setSharesCount] = useState(0);
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<CatalogProduct[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const heartControls = useAnimationControls();

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
        setIsLiked(response.product.is_liked || false);
        setLikesCount(response.product.likes_count || 0);
        setIsWishlisted(response.product.is_wishlisted || false);
        setSharesCount(response.product.shares_count || 0);

        const initialSelections: Record<string, string> = {};
        const firstVariant = response.product.variants[0];

        if (firstVariant) {
          Object.assign(initialSelections, getVariantSelections(firstVariant));
        }

        setSelectedOptions(initialSelections);

        // Fetch related products from same category (same vendor first, then other vendors)
        if (response.product.category?.id) {
          setRelatedLoading(true);
          fetchProducts({
            category: String(response.product.category.id),
            per_page: 18,
            status: 'active',
          })
            .then((resp) => {
              const currentId = response.product.id;
              const vendorId = response.product.vendor?.id;
              const sameVendor = resp.products.filter((p) => p.vendor?.id === vendorId && p.id !== currentId);
              const otherVendors = resp.products.filter((p) => p.vendor?.id !== vendorId && p.id !== currentId);
              setRelatedProducts([...sameVendor, ...otherVendors]);
            })
            .catch(() => {
              setRelatedProducts([]);
            })
            .finally(() => {
              setRelatedLoading(false);
            });
        } else {
          setRelatedProducts([]);
        }
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

    const baseImages = product.images.length > 0
      ? product.images.map((image) => image.image_path)
      : [getProductPrimaryImage(product)];

    // Append variant images that aren't already in the base gallery
    const variantImages = (product.variants || [])
      .map((v) => v.image)
      .filter((img): img is string => {
        if (!img) return false;
        return !baseImages.includes(img);
      });

    return [...baseImages, ...variantImages];
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

  // When a variant with its own image is selected, switch the gallery to it.
  // If the selected variant has no image, fall back to the primary product image.
  useEffect(() => {
    if (!product) {
      return;
    }

    if (selectedVariant?.image) {
      setActiveImage(selectedVariant.image);
    } else if (selectedVariant) {
      setActiveImage(getProductPrimaryImage(product));
    }
  }, [selectedVariant, product]);

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

  const { addToCart: addToCartContext } = useCart();

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCartContext(product.id, qty, selectedVariant?.id);
      toast({ type: 'success', title: 'Added to cart!' });
    } catch (err: any) {
      toast({ type: 'error', title: err?.message || 'Failed to add to cart' });
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      await addToCartContext(product.id, qty, selectedVariant?.id);
      navigate('/cart');
    } catch (err: any) {
      toast({ type: 'error', title: err?.message || 'Failed to add to cart' });
    }
  };

  const handleCatalogOnlyAction = () => {
    toast({
      type: 'info',
      title: 'Feature Coming Soon',
      message: 'This feature will be available in the next update.'
    });
  };

  const handleLike = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    if (isLikeLoading) return;

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : Math.max(0, prev - 1)));

    if (newIsLiked) {
      await heartControls.start({ scale: [1, 1.3, 0.9, 1.1, 1], transition: { duration: 0.4 } });
    }

    setIsLikeLoading(true);
    try {
      if (newIsLiked) {
        await likeProduct(Number(product.id));
      } else {
        await unlikeProduct(Number(product.id));
      }
    } catch (err) {
      setIsLiked(!newIsLiked);
      setLikesCount((prev) => (newIsLiked ? Math.max(0, prev - 1) : prev + 1));
      toast({ type: 'error', title: 'Failed to update like' });
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    if (isWishlistLoading) return;

    const newIsWishlisted = !isWishlisted;
    setIsWishlisted(newIsWishlisted);
    setIsWishlistLoading(true);
    try {
      await toggleWishlist(Number(product.id));
      toast({
        type: 'success',
        title: newIsWishlisted ? 'Added to wishlist' : 'Removed from wishlist',
      });
    } catch (err) {
      setIsWishlisted(!newIsWishlisted);
      toast({ type: 'error', title: 'Failed to update wishlist' });
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleShare = async (platform: string) => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }

    try {
      await shareProduct(Number(product.id), platform);
      setSharesCount((prev) => prev + 1);

      const shareUrl = `${window.location.origin}${getProductPath(product)}`;
      const shareText = `Check out ${product.name} by ${product.vendor?.shop_name || 'Nataka Hii'}!`;

      switch (platform) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://instagram.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast({ type: 'success', title: 'Link copied to clipboard!' });
          break;
      }
      setShareDrawerOpen(false);
    } catch (err) {
      toast({ type: 'error', title: 'Failed to share' });
    }
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
      <FloatingCart price={formatCurrency(totalPrice)} onAddToCart={handleAddToCart} />

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 mb-12">
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

            <h1 className="text-[26px] md:text-[32px] font-bold text-[var(--color-text-heading)] tracking-[-0.5px] leading-tight mb-4">
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
              <AnimatedPrice value={totalPrice} className="text-[32px] font-bold text-[var(--color-accent)] leading-none tracking-tight" />
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
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-heading)] hover:bg-white hover:shadow-sm transition-all disabled:opacity-40"
                  disabled={qty <= 1}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-bold text-[16px] text-[var(--color-text-heading)]">{qty}</span>
                <button
                  onClick={() => setQty((currentQty) => Math.min(currentStock, currentQty + 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-heading)] hover:bg-white hover:shadow-sm transition-all disabled:opacity-40"
                  disabled={qty >= currentStock}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <Button variant="primary" size="l" className="flex-1 shadow-md" onClick={handleAddToCart} disabled={currentStock <= 0}>
                Add to Cart
              </Button>
            </div>

            <Button variant="primary" size="l" className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)] border-none text-[18px]" onClick={handleBuyNow} disabled={currentStock <= 0}>
              Buy Now
            </Button>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                disabled={isLikeLoading}
                className="flex items-center gap-2 text-[14px] font-semibold text-[var(--color-text-body)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-50"
              >
                <motion.div animate={heartControls}>
                  <Heart
                    className={`w-5 h-5 ${isLiked ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : ''}`}
                  />
                </motion.div>
                <span>{likesCount > 0 ? `${likesCount} Like${likesCount === 1 ? '' : 's'}` : 'Like'}</span>
              </button>
              <button
                onClick={handleWishlist}
                disabled={isWishlistLoading}
                className="flex items-center gap-2 text-[14px] font-semibold text-[var(--color-text-body)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-50"
              >
                <Bookmark className={`w-5 h-5 ${isWishlisted ? 'fill-[var(--color-primary)] text-[var(--color-primary)]' : ''}`} />
                <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
              </button>
              <Drawer open={shareDrawerOpen} onOpenChange={setShareDrawerOpen}>
                <DrawerTrigger asChild>
                  <button className="flex items-center gap-2 text-[14px] font-semibold text-[var(--color-text-body)] hover:text-[var(--color-primary)] transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span>{sharesCount > 0 ? `${sharesCount} Share${sharesCount === 1 ? '' : 's'}` : 'Share'}</span>
                  </button>
                </DrawerTrigger>
                <DrawerContent className="bg-white text-[var(--color-text-body)]">
                  <DrawerHeader>
                    <DrawerTitle className="flex items-center gap-2">
                      <img src="/Nataka Hii_favicon updated.png" alt="Nataka Hii" className="w-6 h-6" />
                      Share Product
                    </DrawerTitle>
                    <DrawerDescription>
                      Share {product.name} from {product.vendor?.shop_name || 'Nataka Hii'}
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 grid grid-cols-4 gap-4">
                    <button onClick={() => handleShare('whatsapp')} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                      <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.3A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <span className="text-[12px] font-medium">WhatsApp</span>
                    </button>
                    <button onClick={() => handleShare('facebook')} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                      <div className="w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <span className="text-[12px] font-medium">Facebook</span>
                    </button>
                    <button onClick={() => handleShare('twitter')} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                      <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>
                      <span className="text-[12px] font-medium">X (Twitter)</span>
                    </button>
                    <button onClick={() => handleShare('copy')} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                      <div className="w-14 h-14 rounded-full bg-[var(--color-bg-card)] border-2 border-[var(--color-border)] flex items-center justify-center">
                        <svg className="w-6 h-6 text-[var(--color-text-heading)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      </div>
                      <span className="text-[12px] font-medium">Copy Link</span>
                    </button>
                  </div>
                </DrawerContent>
              </Drawer>
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

        <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
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

      {/* ── Related Products ── */}
      {(relatedProducts.length > 0 || relatedLoading) && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-[20px] text-[var(--color-text-heading)] tracking-tight">More Like This</h2>
              <p className="text-[13px] text-[var(--color-text-muted)] mt-1">
                {product.vendor?.shop_name ? `From ${product.vendor.shop_name} & similar vendors` : 'From similar vendors'}
              </p>
            </div>
            {product.category ? (
              <Link
                to={`/explore?category=${product.category.id}`}
                className="text-[14px] font-semibold text-[var(--color-primary)] hover:text-[var(--color-accent)] flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            ) : null}
          </div>

          {relatedLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
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
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
              {relatedProducts.map((relatedProduct) => {
                const discountPercent = getProductDiscountPercent(relatedProduct);
                const rating = relatedProduct.reviews_avg_rating ? relatedProduct.reviews_avg_rating.toFixed(1) : null;
                const price = getProductPrice(relatedProduct);
                return (
                  <Link to={getProductPath(relatedProduct)} key={relatedProduct.id}>
                    <Card className="group cursor-pointer hover:shadow-[var(--shadow-level-2)] transition-shadow h-full flex flex-col">
                      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-card)]">
                        <ImageWithFallback
                          src={getProductPrimaryImage(relatedProduct)}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {discountPercent ? (
                          <Badge variant="hot-deal" className="absolute top-2 left-2 text-[11px] px-2 py-0.5">
                            -{discountPercent}%
                          </Badge>
                        ) : null}
                      </div>
                      <div className="p-3 flex flex-col flex-1">
                        <p className="text-[13px] font-bold text-[var(--color-text-heading)] line-clamp-2 mb-1 leading-snug">
                          {relatedProduct.name}
                        </p>
                        {rating ? (
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[12px] font-bold text-[var(--color-text-heading)]">{rating}</span>
                          </div>
                        ) : null}
                        <div className="mt-auto flex items-center gap-2">
                          <span className="text-[14px] font-bold text-[var(--color-accent)]">{formatCurrency(price)}</span>
                          {relatedProduct.discount_price != null && relatedProduct.discount_price < relatedProduct.price ? (
                            <span className="text-[11px] text-[var(--color-text-muted)] line-through">{formatCurrency(relatedProduct.price)}</span>
                          ) : null}
                        </div>
                        {relatedProduct.vendor ? (
                          <p className="text-[11px] text-[var(--color-text-muted)] mt-1 truncate">{relatedProduct.vendor.shop_name}</p>
                        ) : null}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
