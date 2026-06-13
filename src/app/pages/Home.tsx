import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { LogoSlider } from '../components/LogoSlider';
import mpesaLogo from '../../assets/mpesa.png';
import airtelMoneyLogo from '../../assets/airtelmoney.png';
import mixxbyyasLogo from '../../assets/mixxbyyas.png';
import halopesaLogo from '../../assets/halopesa.png';
import selcomLogo from '../../assets/selcom.png';
import azampesaLogo from '../../assets/azampesa.png';
import { getImageUrl } from '../utils/images';
import {
  Heart,
  Play,
  MapPin,
  ShoppingCart,
  Sparkles,
  Star,
  Watch,
  Zap,
  Video,
  ArrowRight,
} from 'lucide-react';
import { Badge, VendorVerificationBadge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { EmptyState } from '../components/ui/empty-state';
import { Skeleton } from '../components/ui/skeleton';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  CatalogProduct,
  fetchProducts,
  getProductDiscountPercent,
  getProductPrice,
  getProductPrimaryImage,
} from '../services/productService';
import { fetchVideoFeed, VideoItem } from '../services/videoFeedService';
import { formatCurrency } from '../utils/currency';
import { getProductPath } from '../utils/products';
import { getVendorVerificationTier } from '../utils/vendorVerification';

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<CatalogProduct[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayProducts = useMemo(() => featuredProducts, [featuredProducts]);
  const displayVideos = useMemo(() => videos.slice(0, 12), [videos]);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      setIsLoading(true);
      setError(null);

      try {
        const productData = await fetchProducts({ per_page: 100 }); // Load 100 featured products on home

        if (!isMounted) {
          return;
        }

        setFeaturedProducts(productData.products);

        // Fetch videos separately - don't let video feed failure break the whole page
        try {
          const videoData = await fetchVideoFeed('for-you', 1, 12);
          if (isMounted) {
            setVideos(videoData.videos || []);
          }
        } catch (videoError) {
          // Silently fail video feed - categories and products are more important
          console.warn('Failed to load video feed:', videoError);
          if (isMounted) {
            setVideos([]);
          }
        }
      } catch (loadError: any) {
        if (!isMounted) {
          return;
        }

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

  return (
    <div className="flex flex-col gap-8 lg:gap-16 pb-20">
      <section className="relative w-full min-h-[520px] overflow-hidden px-4 py-16 sm:min-h-[580px] lg:min-h-[640px] lg:py-24">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="https://cdn.natakahii.com/natakahii-hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,11,30,0.42),rgba(4,11,30,0.62))]" />

        <div className="container relative z-10 mx-auto flex min-h-[calc(520px-8rem)] max-w-5xl flex-col items-center justify-center text-center sm:min-h-[calc(580px-8rem)] lg:min-h-[calc(640px-12rem)]">
          <h1 className="font-snasm text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] text-white leading-[0.95] tracking-[-2px] mb-8 drop-shadow-[0_4px_30px_rgba(0,0,0,0.3)]" style={{ color: '#FFFFFF' }}>
            nataka hii.
          </h1>
          <h2 className="font-times-bold text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px] text-white leading-[1.1] tracking-[-1px] mb-10 drop-shadow-lg" style={{ color: '#FFFFFF' }}>
            Get What You Want.
          </h2>

          <p className="text-[18px] sm:text-[20px] md:text-[22px] text-white/95 mb-12 max-w-3xl mx-auto leading-[1.6] font-medium">
            East Africa's premier marketplace connecting you with verified local vendors, AI-curated products, and a fully protected shopping experience.
          </p>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
            <MapPin className="w-5 h-5 text-[var(--color-accent)]" />
            <span className="text-white font-bold tracking-wide uppercase text-[13px]">Serving East Africa</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 flex flex-col gap-12 lg:gap-20">
        <section>
          <div className="flex items-center justify-between mb-6 bg-white border border-[var(--color-border)] rounded-full p-2 pr-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[#f97316] flex items-center justify-center text-white shadow-inner">
                <Zap className="w-5 h-5 fill-white/20" />
              </div>
              <h2 className="text-[15px] sm:text-[17px] font-bold text-[var(--color-text-heading)] tracking-tight">Fresh Picks</h2>
            </div>
            <Link to="/explore">
              <Button variant="ghost" className="h-8 px-4 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] rounded-full gap-1.5 transition-colors">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {displayProducts.map((product) => {
                const discountPercent = getProductDiscountPercent(product);
                const rating = product.reviews_avg_rating ? product.reviews_avg_rating.toFixed(1) : null;
                const image = getProductPrimaryImage(product);
                const price = getProductPrice(product);
                const vendorTier = getVendorVerificationTier(product.vendor);

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <Link to={getProductPath(product)}>
                      <Card className="group cursor-pointer hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 h-full flex flex-col border-none bg-white rounded-[24px] overflow-hidden">
                        <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-card)]">
                          <ImageWithFallback 
                            src={image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                          
                          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-white shadow-sm transition-all duration-300 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                            <Heart className="w-5 h-5" />
                          </button>
                          
                          {discountPercent ? (
                            <Badge variant="hot-deal" className="absolute top-4 left-4 bg-[var(--color-accent)] text-white font-black px-3 py-1 rounded-lg shadow-lg">
                              -{discountPercent}%
                            </Badge>
                          ) : (
                            <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[var(--color-primary)] font-bold px-3 py-1 rounded-lg shadow-sm border-none">
                              Featured
                            </Badge>
                          )}
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate text-[11px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                                {product.vendor?.shop_name || 'Verified'}
                              </span>
                              {vendorTier === 'premium' && (
                                <VendorVerificationBadge tone="compact" className="shrink-0" />
                              )}
                            </div>
                            {rating && (
                              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-[11px] font-black text-yellow-700">{rating}</span>
                              </div>
                            )}
                          </div>

                          <h3 className="font-bold text-[15px] text-[var(--color-text-heading)] line-clamp-2 mb-3 leading-snug group-hover:text-[var(--color-primary)] transition-colors duration-300">
                            {product.name}
                          </h3>

                          <div className="mt-auto pt-4 flex items-end justify-between border-t border-gray-50">
                            <div className="space-y-0.5">
                              {product.discount_price && product.discount_price < product.price && (
                                <p className="text-[11px] text-[var(--color-text-muted)] line-through font-medium opacity-60">
                                  {formatCurrency(product.price)}
                                </p>
                              )}
                              <p className="text-[19px] font-black text-[var(--color-accent)] tracking-tighter">
                                {formatCurrency(price)}
                              </p>
                            </div>
                            <Button className="w-10 h-10 rounded-2xl p-0 bg-[var(--color-primary-bg)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 shadow-sm">
                              <ShoppingCart className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
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
          <div className="flex items-center justify-between mb-6 bg-white border border-[var(--color-border)] rounded-full p-2 pr-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[#2563eb] flex items-center justify-center text-white shadow-inner">
                <Watch className="w-5 h-5 fill-white/20" />
              </div>
              <h2 className="text-[15px] sm:text-[17px] font-bold text-[var(--color-text-heading)] tracking-tight">Discover Videos</h2>
            </div>
            <Link to="/video">
              <Button variant="ghost" className="h-8 px-4 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] rounded-full gap-1.5 transition-colors">
                Watch <Play className="w-3.5 h-3.5 fill-current" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {displayVideos.length === 0 ? (
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
              displayVideos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Link to={`/video?v=${video.id}`} className="relative aspect-[9/16] rounded-[24px] overflow-hidden bg-[var(--color-bg-card)] group cursor-pointer shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] block">
                    {/* Video Thumbnail or Placeholder */}
                    <ImageWithFallback
                      src={getImageUrl(video.product?.images?.[0]?.image_path)}
                      alt={video.title || 'Video'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 group-hover:from-black/40 transition-all duration-500" />

                    {/* Play Icon - Always visible with pulse animation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-xl group-hover:scale-110 group-hover:bg-[var(--color-accent)]/20 group-hover:border-[var(--color-accent)]/40 transition-all duration-500">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                      </div>
                    </div>

                    {/* Video Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <Video className="w-3.5 h-3.5 text-white" />
                        <span className="text-[10px] font-black text-white tracking-widest">LIVE</span>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white/50 shadow-sm">
                          <ImageWithFallback
                            src={video.vendor?.logo || ''}
                            alt={video.vendor?.shop_name || 'Vendor'}
                          />
                        </div>
                        <span className="text-[12px] font-black text-white shadow-sm truncate tracking-wide">{video.vendor?.shop_name || 'Vendor'}</span>
                      </div>
                      <h3 className="text-[14px] font-bold text-white leading-tight line-clamp-2 drop-shadow-md">{video.title || video.product?.name || 'Product Video'}</h3>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
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
