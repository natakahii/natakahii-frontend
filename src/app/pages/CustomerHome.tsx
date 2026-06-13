import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Zap, ChevronRight, Store, History, Search as SearchIcon, Star,
  Shirt, Smartphone, Home as HomeIcon, Watch, Sparkles, Dumbbell,
  MapPin, ShoppingCart, ArrowRight, Heart, Video, Play
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Badge, VendorVerificationBadge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { formatCurrency } from '../utils/currency';
import { getProductPath } from '../utils/products';
import { useAuth } from '../providers/AuthProvider';
import { useCart } from '../providers/CartProvider';
import { useToast } from '../components/ui/toast';
import { 
  fetchProducts, 
  CatalogProduct, 
  getProductPrimaryImage, 
  fetchCategories, 
  CatalogCategory,
  getProductDiscountPercent,
  getProductPrice
} from '../services/productService';
import { fetchVideoFeed, VideoItem } from '../services/videoFeedService';
import { getImageUrl } from '../utils/images';
import { getVendorVerificationTier } from '../utils/vendorVerification';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../components/ui/carousel";
import { Skeleton } from '../components/ui/skeleton';
import { LogoSlider } from '../components/LogoSlider';
import mpesaLogo from '../../assets/mpesa.png';
import airtelMoneyLogo from '../../assets/airtelmoney.png';
import mixxbyyasLogo from '../../assets/mixxbyyas.png';
import halopesaLogo from '../../assets/halopesa.png';
import selcomLogo from '../../assets/selcom.png';
import azampesaLogo from '../../assets/azampesa.png';

const CATEGORY_ICON_MAP: Record<string, any> = {
  'fashion': Shirt,
  'electronics': Smartphone,
  'home': HomeIcon,
  'accessories': Watch,
  'beauty': Sparkles,
  'sport': Dumbbell,
};

export function CustomerHome() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [browsingHistory, setBrowsingHistory] = useState<CatalogProduct[]>([]);
  const [usedProducts, setUsedProducts] = useState<CatalogProduct[]>([]);
  const [frequentlySearched, setFrequentlySearched] = useState<CatalogProduct[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const displayProducts = useMemo(() => products, [products]);
  const displayVideos = useMemo(() => videos.slice(0, 12), [videos]);

  useEffect(() => {
    if (user) {
      const hasWelcomedThisSession = sessionStorage.getItem(`welcomed_${user.id}`);
      if (!hasWelcomedThisSession) {
        toast({ 
           type: 'success', 
           title: `Welcome back, ${user.name}!`,
           message: "Great to see you again."
         });
        sessionStorage.setItem(`welcomed_${user.id}`, 'true');
      }
    }
  }, [user, toast]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        const [productData, categoryData] = await Promise.all([
          fetchProducts({ per_page: 100, status: 'active' }),
          fetchCategories()
        ]);

        if (!isMounted) return;
        setProducts(productData.products);
        setCategories(categoryData.slice(0, 6)); // Show first 6 categories

        // Fetch videos separately - don't let video feed failure break the whole page
        try {
          const videoData = await fetchVideoFeed('for-you', 1, 12);
          if (isMounted) {
            setVideos(videoData.videos || []);
          }
        } catch (videoError) {
          console.warn('Failed to load video feed:', videoError);
          if (isMounted) {
            setVideos([]);
          }
        }

        // Fetch Browsing History
        const historyIds = JSON.parse(localStorage.getItem('natakahii_browsing_history') || '[]');
        if (historyIds.length > 0) {
          const historyData = await fetchProducts({ ids: historyIds.join(','), maintain_order: true, per_page: 4 });
          setBrowsingHistory(historyData.products);
        }

        // Fetch Used Products
        const usedData = await fetchProducts({ condition: 'used', per_page: 4 });
        setUsedProducts(usedData.products);

        // Fetch Frequently Searched (Popular)
        const popularData = await fetchProducts({ sortBy: 'created_at', sortDir: 'desc', per_page: 4 });
        setFrequentlySearched(popularData.products);

      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load data');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadData();

    return () => { isMounted = false; };
  }, []);

  const handleAddToCart = async (product: CatalogProduct) => {
    try {
      await addToCart(product.id, 1);
      toast({ type: 'success', title: 'Added to cart!' });
    } catch (err: any) {
      toast({ type: 'error', title: err?.message || 'Failed to add to cart' });
    }
  };

  return (
    <div className="flex flex-col gap-8 lg:gap-12 pb-20">
      
      {/* NEW ALIBABA-STYLE HERO SECTION */}
      <section className="bg-[var(--color-bg-page)] pt-6 lg:pt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* 1. Categories Sidebar */}
            <div className="w-full lg:w-[240px] shrink-0 flex flex-col gap-4">
              <div className="bg-white rounded-[16px] border border-[var(--color-border)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-page)]/50">
                  <h3 className="font-bold text-[15px] text-[var(--color-text-heading)] flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-[var(--color-primary)]" /> Categories for you
                  </h3>
                </div>
                <div className="py-2">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-gray-100 animate-pulse" />
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
                      </div>
                    ))
                  ) : (
                    categories.map((cat) => {
                      const Icon = CATEGORY_ICON_MAP[cat.slug] || Zap;
                      return (
                        <Link 
                          key={cat.id} 
                          to={`/explore?category=${cat.id}`}
                          className="px-4 py-2.5 flex items-center justify-between group hover:bg-[var(--color-bg-page)] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                            <span className="text-[14px] font-medium text-[var(--color-text-body)] group-hover:text-[var(--color-text-heading)]">{cat.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Delivery Location Badge */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[16px] p-4 border border-[var(--color-border)] shadow-sm flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-bg)] flex items-center justify-center text-[var(--color-primary)]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Deliver to</p>
                  <p className="text-[14px] font-bold text-[var(--color-text-heading)] truncate">East Africa</p>
                </div>
              </motion.div>
            </div>

            {/* 2. Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Browsing History Card */}
              <div className="bg-white rounded-[16px] p-4 border border-[var(--color-border)] shadow-sm flex flex-col">
                <h4 className="font-bold text-[16px] text-[var(--color-text-heading)] mb-3 flex items-center gap-2">
                  Browsing history
                </h4>
                <div className="grid grid-cols-2 gap-2 flex-1">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => <div key={i} className="aspect-square bg-gray-50 rounded-lg animate-pulse" />)
                  ) : browsingHistory.length > 0 ? (
                    browsingHistory.slice(0, 2).map(prod => (
                      <Link key={prod.id} to={getProductPath(prod)} className="group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 border border-[var(--color-border)]/50">
                          <ImageWithFallback src={getProductPrimaryImage(prod)} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-[12px] font-bold text-[var(--color-accent)] mt-1.5">{formatCurrency(prod.effective_price)}</p>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl border border-dashed border-[var(--color-border)]">
                      <History className="w-8 h-8 text-[var(--color-text-muted)] mb-2 opacity-20" />
                      <p className="text-[11px] text-[var(--color-text-muted)]">No history yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Keep looking for (Used) */}
              <div className="bg-white rounded-[16px] p-4 border border-[var(--color-border)] shadow-sm flex flex-col">
                <div className="mb-3">
                  <h4 className="font-bold text-[16px] text-[var(--color-text-heading)] leading-tight">Keep looking for</h4>
                  <p className="text-[12px] text-[var(--color-text-muted)]">Used products</p>
                </div>
                <div className="grid grid-cols-2 gap-2 flex-1">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => <div key={i} className="aspect-square bg-gray-50 rounded-lg animate-pulse" />)
                  ) : usedProducts.length > 0 ? (
                    usedProducts.slice(0, 2).map(prod => (
                      <Link key={prod.id} to={getProductPath(prod)} className="group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 border border-[var(--color-border)]/50">
                          <ImageWithFallback src={getProductPrimaryImage(prod)} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-[12px] font-bold text-[var(--color-accent)] mt-1.5">{formatCurrency(prod.effective_price)}</p>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl border border-dashed border-[var(--color-border)]">
                      <SearchIcon className="w-8 h-8 text-[var(--color-text-muted)] mb-2 opacity-20" />
                      <p className="text-[11px] text-[var(--color-text-muted)]">Check used items</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Frequently searched */}
              <div className="bg-white rounded-[16px] p-4 border border-[var(--color-border)] shadow-sm flex flex-col">
                <div className="mb-3">
                  <h4 className="font-bold text-[16px] text-[var(--color-text-heading)] leading-tight">Frequently searched</h4>
                  <p className="text-[12px] text-[var(--color-text-muted)]">Popular now</p>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  {isLoading ? (
                    <div className="aspect-[4/3] bg-gray-50 rounded-lg animate-pulse" />
                  ) : frequentlySearched.length > 0 ? (
                    <Link to={getProductPath(frequentlySearched[0])} className="group flex flex-col items-center">
                      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 border border-[var(--color-border)]/50">
                        <ImageWithFallback src={getProductPrimaryImage(frequentlySearched[0])} alt={frequentlySearched[0].name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform" />
                      </div>
                      <p className="text-[13px] font-bold text-[var(--color-text-heading)] mt-2 text-center line-clamp-1">{frequentlySearched[0].name}</p>
                    </Link>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl border border-dashed border-[var(--color-border)]">
                      <Star className="w-8 h-8 text-[var(--color-text-muted)] mb-2 opacity-20" />
                      <p className="text-[11px] text-[var(--color-text-muted)]">Nothing trending</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Poster Carousel */}
              <div className="bg-[#EBF2FF] rounded-[16px] overflow-hidden border border-[var(--color-border)] shadow-sm relative group">
                <Carousel className="w-full h-full">
                  <CarouselContent className="h-full ml-0">
                    {/* Poster 1 */}
                    <CarouselItem className="pl-0 h-full">
                      <div className="p-6 h-full flex flex-col justify-between relative overflow-hidden">
                        <div className="relative z-10">
                          <h3 className="text-[20px] font-bold text-[#1A1A1A] leading-tight mb-2">
                            Experienced <br /> <span className="text-[var(--color-primary)]">ODM companies</span>
                          </h3>
                        </div>
                        <div className="relative z-10">
                          <Button size="sm" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-darker)] text-white rounded-full px-6">
                            View more
                          </Button>
                        </div>
                        {/* Mock Image Placeholder */}
                        <div className="absolute bottom-0 right-0 w-[140px] h-[140px] opacity-80 group-hover:scale-110 transition-transform duration-500">
                          <img src="/natakahii-logo.png" className="w-full h-full object-contain" alt="Poster item" />
                        </div>
                      </div>
                    </CarouselItem>
                    
                    {/* Poster 2 */}
                    <CarouselItem className="pl-0 h-full bg-[#FFF5EB]">
                      <div className="p-6 h-full flex flex-col justify-between relative overflow-hidden">
                        <div className="relative z-10">
                          <h3 className="text-[20px] font-bold text-[#1A1A1A] leading-tight mb-2">
                            Top <br /> <span className="text-[#FF6B00]">Verified Vendors</span>
                          </h3>
                        </div>
                        <div className="relative z-10">
                          <Button size="sm" className="bg-[#FF6B00] hover:bg-[#E66000] text-white rounded-full px-6">
                            Shop now
                          </Button>
                        </div>
                        <div className="absolute bottom-0 right-0 w-[140px] h-[140px] opacity-80 group-hover:scale-110 transition-transform duration-500">
                           <Shirt className="w-full h-full text-[#FF6B00]/20" />
                        </div>
                      </div>
                    </CarouselItem>

                    {/* Poster 3 */}
                    <CarouselItem className="pl-0 h-full bg-[#F0FDF4]">
                      <div className="p-6 h-full flex flex-col justify-between relative overflow-hidden">
                        <div className="relative z-10">
                          <h3 className="text-[20px] font-bold text-[#1A1A1A] leading-tight mb-2">
                            Eco-friendly <br /> <span className="text-[#16A34A]">Collections</span>
                          </h3>
                        </div>
                        <div className="relative z-10">
                          <Button size="sm" className="bg-[#16A34A] hover:bg-[#15803D] text-white rounded-full px-6">
                            Discover
                          </Button>
                        </div>
                        <div className="absolute bottom-0 right-0 w-[140px] h-[140px] opacity-80 group-hover:scale-110 transition-transform duration-500">
                           <Zap className="w-full h-full text-[#16A34A]/20" />
                        </div>
                      </div>
                    </CarouselItem>

                    {/* Poster 4, 5, 6 - Similar placeholders */}
                    {Array.from({ length: 3 }).map((_, i) => (
                      <CarouselItem key={i} className="pl-0 h-full bg-gray-50">
                        <div className="p-6 h-full flex flex-col justify-between">
                          <h3 className="text-[20px] font-bold text-gray-400">Featured <br /> Spotlight {i+4}</h3>
                          <Button variant="outline" size="sm" className="rounded-full w-fit">Learn more</Button>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
                     {Array.from({ length: 6 }).map((_, i) => (
                       <div key={i} className="w-1.5 h-1.5 rounded-full bg-black/10" />
                     ))}
                  </div>
                </Carousel>
              </div>

            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 flex flex-col gap-12 lg:gap-16">
      

        {/* FOR YOU */}
        <section>
          <div className="flex items-center justify-between mb-6 bg-white border border-[var(--color-border)] rounded-full p-2 pr-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[#f97316] flex items-center justify-center text-white shadow-inner">
                <Zap className="w-5 h-5 fill-white/20" />
              </div>
              <h2 className="text-[15px] sm:text-[17px] font-bold text-[var(--color-text-heading)] tracking-tight">Recommended</h2>
            </div>
            <Link to="/explore">
              <Button variant="ghost" className="h-8 px-4 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] rounded-full gap-1.5 transition-colors">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-[12px] text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {isLoading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <Card key={index} className="h-full flex flex-col">
                  <Skeleton className="aspect-square rounded-t-[16px]" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="w-2/3 h-3" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-1/2 h-6" />
                  </div>
                </Card>
              ))
            ) : (
              displayProducts.map((product) => {
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
                            <Button 
                              className="w-10 h-10 rounded-2xl p-0 bg-[var(--color-primary-bg)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 shadow-sm"
                              onClick={(e) => {
                                e.preventDefault();
                                handleAddToCart(product);
                              }}
                            >
                              <ShoppingCart className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        {/* AI SHOPPER SECTION */}
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

        {/* DISCOVER ON VIDEO SECTION */}
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
              Array.from({ length: 6 }).map((_, index) => (
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
                    <ImageWithFallback
                      src={getImageUrl(video.product?.images?.[0]?.image_path)}
                      alt={video.title || 'Video'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 group-hover:from-black/40 transition-all duration-500" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-xl group-hover:scale-110 group-hover:bg-[var(--color-accent)]/20 group-hover:border-[var(--color-accent)]/40 transition-all duration-500">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                      </div>
                    </div>

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

        {/* RECENTLY VIEWED - hidden until recently-viewed API is available */}

        {/* BECOME A VENDOR CTA */}
        <section className="mt-4 mb-8">
          <div className="bg-white rounded-[24px] p-8 md:p-10 border border-[var(--color-border)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-[var(--color-accent-bg)] px-3 py-1.5 rounded-full text-[12px] font-bold tracking-wide uppercase mb-4 text-[var(--color-accent)]">
                <Store className="w-4 h-4" /> Grow with us
              </div>
              <h2 className="text-[28px] md:text-[32px] font-bold text-[var(--color-text-heading)] leading-tight mb-3 tracking-tight">
                Turn your passion into profit
              </h2>
              <p className="text-[15px] text-[var(--color-text-body)] leading-relaxed mb-0">
                Join thousands of verified vendors on Nataka Hii. Start selling to active buyers across East Africa today with 0% setup fees.
              </p>
            </div>
            
            <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row gap-3">
              <Link to="/vendor/apply">
                <Button variant="primary" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white border-none px-8 shadow-md h-12">
                  Open Your Store
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* PAYMENT PARTNERS */}
        <section className="py-6 sm:py-8 md:py-10 overflow-hidden">
          <div className="container mx-auto px-0 mb-4 sm:mb-5 md:mb-6 text-center">
            <h3 className="text-[18px] sm:text-[20px] md:text-[22px] font-times-bold text-[var(--color-text-heading)]">Payment Partners</h3>
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
