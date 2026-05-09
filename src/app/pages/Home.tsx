import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { LogoSlider } from '../components/LogoSlider';
import mpesaLogo from '../../assets/mpesa.png';
import airtelMoneyLogo from '../../assets/airtelmoney.png';
import mixxbyyasLogo from '../../assets/mixxbyyas.png';
import halopesaLogo from '../../assets/halopesa.png';
import selcomLogo from '../../assets/selcom.png';
import azampesaLogo from '../../assets/azampesa.png';
import {
  CheckCircle,
  ChevronRight,
  Dumbbell,
  Heart,
  Home as HomeIcon,
  Play,
  Shirt,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Watch,
  Zap,
  Video,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { EmptyState } from '../components/ui/empty-state';
import { Skeleton } from '../components/ui/skeleton';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  CatalogCategory,
  CatalogProduct,
  CatalogVendor,
  fetchCategories,
  fetchProducts,
  getProductDiscountPercent,
  getProductPrice,
  getProductPrimaryImage,
} from '../services/productService';
import { fetchVideoFeed, VideoItem } from '../services/videoFeedService';
import { formatCurrency } from '../utils/currency';
import { getProductPath } from '../utils/products';
import { getVendorStorefrontPath } from '../utils/storefront';

const CATEGORY_ICON_MAP = [
  { pattern: /fashion|apparel|clothing|dress/, icon: Shirt },
  { pattern: /electronics|phone|tech|device/, icon: Smartphone },
  { pattern: /home|living|furniture|decor/, icon: HomeIcon },
  { pattern: /accessories|watch|jewelry/, icon: Watch },
  { pattern: /beauty|cosmetic|skin/, icon: Sparkles },
  { pattern: /sport|fitness/, icon: Dumbbell },
];

function getCategoryIcon(category: CatalogCategory) {
  const label = `${category.icon || ''} ${category.slug} ${category.name}`.toLowerCase();
  return CATEGORY_ICON_MAP.find((entry) => entry.pattern.test(label))?.icon || Zap;
}

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      setIsLoading(true);
      setError(null);

      try {
        const [categoryData, productData, videoData] = await Promise.all([
          fetchCategories(),
          fetchProducts({ per_page: 100 }), // Load 100 featured products on home
          fetchVideoFeed('for-you', 1, 12), // Fetch page 1, 12 latest videos
        ]);

        if (!isMounted) {
          return;
        }

        setCategories(categoryData);
        setFeaturedProducts(productData.products);
        setVideos(videoData.videos || []);
      } catch (loadError: any) {
        if (!isMounted) {
          return;
        }

        setCategories([]);
        setFeaturedProducts([]);
        setError(loadError?.message || 'Unable to load the latest catalog right now.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const spotlightVendors = useMemo(() => {
    const uniqueVendors = new Map<number, CatalogVendor & { featuredProductCount: number }>();

    featuredProducts.forEach((product) => {
      const vendor = product.vendor;

      if (!vendor?.id) {
        return;
      }

      const existing = uniqueVendors.get(vendor.id);

      if (existing) {
        existing.featuredProductCount += 1;
        return;
      }

      uniqueVendors.set(vendor.id, {
        ...vendor,
        featuredProductCount: 1,
      });
    });

    return Array.from(uniqueVendors.values()).slice(0, 4);
  }, [featuredProducts]);

  const topCategories = categories.slice(0, 6);

  return (
    <div className="flex flex-col gap-8 lg:gap-16 pb-20">
      <section className="relative w-full bg-gradient-to-br from-[var(--color-primary-darker)] via-[var(--color-primary)] to-[var(--color-primary-light)] overflow-hidden pt-12 pb-20 lg:py-24 px-4">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-accent)]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-info)]/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="container relative z-10 mx-auto max-w-5xl text-center flex flex-col items-center">
          <h1 className="font-snasm text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] text-white leading-[0.95] tracking-[-2px] mb-8 drop-shadow-[0_4px_30px_rgba(0,0,0,0.3)]" style={{ color: '#FFFFFF' }}>
            nataka hii.
          </h1>
          <h2 className="font-times-bold text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px] text-white leading-[1.1] tracking-[-1px] mb-10 drop-shadow-lg" style={{ color: '#FFFFFF' }}>
            Get What You Want.
          </h2>

          <p className="text-[18px] sm:text-[20px] md:text-[22px] text-white/95 mb-12 max-w-3xl mx-auto leading-[1.6] font-medium">
            East Africa's premier marketplace connecting you with verified local vendors, AI-curated products, and a fully protected shopping experience.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-[13px] text-white/80 font-medium">
          
            {(topCategories.length > 0 ? topCategories : [{ id: 0, name: 'Explore', slug: 'explore', parent_id: null, children: [] } as CatalogCategory]).slice(0, 4).map((category) => (
              <button
                key={category.id}
                onClick={() => navigate(category.id ? `/explore?category=${category.id}` : '/explore')}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer transition-colors backdrop-blur-sm border border-white/5"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 flex flex-col gap-12 lg:gap-20">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-times-bold text-[22px] lg:text-[28px] text-[var(--color-text-heading)] tracking-[-0.5px]">Trending Categories</h2>
            <Link to="/explore" className="text-[var(--color-primary)] font-semibold text-[14px] hover:text-[var(--color-accent)] flex items-center gap-1">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="shrink-0 w-[100px] md:w-[120px] flex flex-col items-center gap-3">
                  <Skeleton className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-[24px]" />
                  <Skeleton className="w-20 h-4 rounded-full" />
                </div>
              ))}
            </div>
          ) : topCategories.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
              {topCategories.map((category) => {
                const Icon = getCategoryIcon(category);

                return (
                  <Link to={`/explore?category=${category.id}`} key={category.id} className="snap-start shrink-0 w-[100px] md:w-[120px] group flex flex-col items-center gap-3">
                    <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-[24px] bg-[var(--color-bg-card)] flex flex-col items-center justify-center shadow-sm group-hover:shadow-md group-hover:bg-[var(--color-primary-bg)] transition-all duration-300 group-hover:-translate-y-1">
                      <Icon className="w-8 h-8 text-[var(--color-text-heading)] group-hover:text-[var(--color-primary)] transition-colors" />
                    </div>
                    <span className="text-[13px] md:text-[14px] font-medium text-center text-[var(--color-text-heading)] group-hover:text-[var(--color-primary)]">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              variant="products"
              title="Categories are on the way"
              description={error || 'We could not load categories at the moment.'}
              actionLabel="Browse Products"
              actionHref="/explore"
            />
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-[var(--color-accent-bg)] to-transparent p-4 rounded-t-[16px] border-l-4 border-[var(--color-accent)]">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-[var(--color-accent)]" />
              <h2 className="font-times-bold text-[22px] text-[var(--color-text-heading)] tracking-[-0.5px]">Fresh Picks</h2>
              <Badge variant="hot-deal" className="ml-2">Live from the catalog</Badge>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <Card key={index} className="h-full flex flex-col">
                  <Skeleton className="aspect-square rounded-t-[16px]" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="w-2/3 h-3" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-1/2 h-6" />
                  </div>
                </Card>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => {
                const discountPercent = getProductDiscountPercent(product);
                const rating = product.reviews_avg_rating ? product.reviews_avg_rating.toFixed(1) : null;
                const image = getProductPrimaryImage(product);
                const price = getProductPrice(product);

                return (
                  <Link to={getProductPath(product)} key={product.id}>
                    <Card className="group cursor-pointer hover:shadow-[var(--shadow-level-2)] transition-shadow h-full flex flex-col">
                      <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-card)]">
                        <ImageWithFallback src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-white transition-all">
                          <Heart className="w-4 h-4" />
                        </button>
                        <Badge variant="hot-deal" className="absolute top-3 left-3 bg-[var(--color-accent)]">
                          {discountPercent ? `-${discountPercent}%` : 'Featured'}
                        </Badge>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="text-[12px] text-[var(--color-text-muted)] mb-1 flex items-center justify-between">
                          <span className="truncate flex items-center gap-1">
                            {product.vendor?.shop_name || 'Verified Vendor'}
                            {product.vendor?.status === 'approved' && <CheckCircle className="w-3 h-3 text-[var(--color-primary)] inline" />}
                          </span>
                          {rating ? (
                            <span className="flex items-center gap-1 text-[var(--color-text-heading)] font-medium">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {rating}
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-[var(--color-primary)]">New</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-[14px] text-[var(--color-text-heading)] line-clamp-2 mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                          {product.name}
                        </h3>
                        <div className="mt-auto flex items-end justify-between">
                          <div>
                            {product.discount_price && product.discount_price < product.price && (
                              <div className="text-[12px] text-[var(--color-text-muted)] line-through decoration-red-500/50">{formatCurrency(product.price)}</div>
                            )}
                            <div className="text-[18px] font-bold text-[var(--color-accent)] tracking-tight">
                              {formatCurrency(price)}
                            </div>
                          </div>
                          <Button variant="primary" size="xs" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              variant="products"
              title="No products yet"
              description={error || 'Once products are live, they will show up here automatically.'}
              actionLabel="Explore Catalog"
              actionHref="/explore"
            />
          )}
        </section>

        <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[var(--color-primary-darker)] to-[var(--color-primary)] text-white p-8 md:p-12 shadow-[var(--shadow-level-2)]">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-white/10 to-transparent opacity-40 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-darker)] via-[var(--color-primary-darker)]/80 to-transparent"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md mb-4 border border-white/20">
                <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
                <span className="text-[13px] font-semibold tracking-wide uppercase text-[var(--color-accent-bg)]">AI-Powered Shopping</span>
              </div>
              <h2 className="font-times-bold text-[28px] md:text-[36px] leading-tight mb-4 tracking-[-1px]">
                Meet your personal <span className="text-[var(--color-accent)]">Nataka Hii</span> AI shopper
              </h2>
              <p className="text-[16px] text-[var(--color-primary-bg)] opacity-90 mb-8 max-w-md">
                Can't find what you're looking for? Just describe it, upload a photo, or drop a link. We'll find the best verified vendor for you instantly.
              </p>
              <Button variant="primary" size="l" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white shadow-[var(--shadow-level-2)] border-none">
                <Sparkles className="w-5 h-5 mr-2" />
                Try it now
              </Button>
            </div>

            <div className="hidden lg:flex flex-col gap-4 w-full max-w-sm">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white text-[var(--color-text-heading)] p-4 rounded-[16px] rounded-br-sm self-end shadow-md"
              >
                <p className="text-[14px] font-medium">I'm looking for traditional Maasai beadwork necklaces for a wedding.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-[var(--color-primary-light)] text-white p-4 rounded-[16px] rounded-bl-sm self-start shadow-md w-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[12px] font-bold">AI Shopper</span>
                </div>
                <p className="text-[14px]">Found verified vendors already selling handmade accessories in the marketplace.</p>
              </motion.div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-times-bold text-[22px] lg:text-[28px] text-[var(--color-text-heading)] tracking-[-0.5px]">Discover on Video</h2>
              <p className="text-[14px] text-[var(--color-text-muted)] mt-1">Watch real vendor demos and reviews.</p>
            </div>
            <Link to="/video" className="text-[var(--color-primary)] font-semibold text-[14px] hover:text-[var(--color-accent)] flex items-center gap-1 bg-[var(--color-primary-bg)] px-4 py-2 rounded-full">
              Open Feed <Play className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.length === 0 ? (
              // Skeleton loading state
              Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="relative aspect-[9/16] rounded-[16px] overflow-hidden bg-[var(--color-bg-card)] shadow-[var(--shadow-level-1)]">
                  <Skeleton className="w-full h-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center">
                      <Video className="w-6 h-6 text-white/50" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              videos.slice(0, 12).map((video) => (
                <Link key={video.id} to={`/video?v=${video.id}`} className="relative aspect-[9/16] rounded-[16px] overflow-hidden bg-[var(--color-bg-card)] group cursor-pointer shadow-[var(--shadow-level-1)] block">
                  {/* Video Thumbnail or Placeholder */}
                  <ImageWithFallback
                    src={video.product?.images?.[0]?.image_path || ''}
                    alt={video.title || 'Video'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

                  {/* Play Icon - Always visible with pulse animation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 text-white fill-white ml-1" />
                    </div>
                  </div>

                  {/* Video Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Video className="w-3 h-3 text-white" />
                      <span className="text-[10px] font-medium text-white">VIDEO</span>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-white/50">
                        <ImageWithFallback
                          src={video.vendor?.logo || ''}
                          alt={video.vendor?.shop_name || 'Vendor'}
                        />
                      </div>
                      <span className="text-[12px] font-medium text-white shadow-sm truncate">{video.vendor?.shop_name || 'Vendor'}</span>
                    </div>
                    <h3 className="text-[13px] font-semibold text-white leading-tight line-clamp-2">{video.title || video.product?.name || 'Product Video'}</h3>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-times-bold text-[22px] lg:text-[28px] text-[var(--color-text-heading)] tracking-[-0.5px]">Top Verified Vendors</h2>
          </div>

          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="shrink-0 w-[260px] p-5 flex flex-col items-center text-center gap-3">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-24 h-3" />
                  <Skeleton className="w-full h-9 rounded-full" />
                </Card>
              ))}
            </div>
          ) : spotlightVendors.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
              {spotlightVendors.map((vendor) => (
                <Card key={vendor.id} className="snap-start shrink-0 w-[260px] p-5 flex flex-col items-center text-center gap-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--color-border)] relative">
                    <ImageWithFallback src={vendor.logo || '/natakahii-logo.png'} alt={vendor.shop_name} className="w-full h-full object-cover" />
                    {vendor.status === 'approved' && (
                      <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5">
                        <CheckCircle className="w-5 h-5 text-[var(--color-primary)] fill-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[16px] text-[var(--color-text-heading)]">{vendor.shop_name}</h3>
                    <div className="text-[13px] text-[var(--color-text-muted)] flex items-center justify-center gap-3 mt-1">
                      <span>{vendor.featuredProductCount} featured items</span>
                      <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                      <span>{vendor.status === 'approved' ? 'Approved vendor' : 'Active store'}</span>
                    </div>
                  </div>
                  <Link to={getVendorStorefrontPath(vendor)} className="w-full">
                    <Button variant="secondary" size="s" className="w-full mt-2 rounded-full font-bold">Shop This Vendor</Button>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              variant="products"
              title="Vendor spotlight is getting ready"
              description={error || 'Vendors will appear here as products are published.'}
              actionLabel="Explore Catalog"
              actionHref="/explore"
            />
          )}
        </section>

        {/* Payment Partners - Infinite Scroll */}
      <section className="py-6 sm:py-8 md:py-10 overflow-hidden">
        <div className="container mx-auto px-4 mb-4 sm:mb-5 md:mb-6">
          <h3 className="text-center text-[18px] sm:text-[20px] md:text-[22px] font-times-bold text-[var(--color-text-heading)]">Payment Partners</h3>
        </div>
        <LogoSlider
          logos={[mpesaLogo, airtelMoneyLogo, mixxbyyasLogo, halopesaLogo, selcomLogo, azampesaLogo]}
          duration={20}
          gap="gap-8 sm:gap-12 md:gap-16"
          showGradient={true}
          pauseOnHover={true}
        />
      </section>
      </div>
    </div>
  );
}
