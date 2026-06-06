import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Zap, ChevronRight, Store, History, Search as SearchIcon, Star,
  Shirt, Smartphone, Home as HomeIcon, Watch, Sparkles, Dumbbell
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductCard } from '../components/ui/product-card';
import { formatCurrency } from '../utils/currency';
import { getProductPath } from '../utils/products';
import { useAuth } from '../providers/AuthProvider';
import { useCart } from '../providers/CartProvider';
import { useToast } from '../components/ui/toast';
import { fetchProducts, CatalogProduct, getProductPrimaryImage, fetchCategories, CatalogCategory } from '../services/productService';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../components/ui/carousel";

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
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

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
          fetchProducts({ per_page: 8, status: 'active' }),
          fetchCategories()
        ]);

        if (!isMounted) return;
        setProducts(productData.products);
        setCategories(categoryData.slice(0, 6)); // Show first 6 categories

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
            <div className="w-full lg:w-[240px] shrink-0 bg-white rounded-[16px] border border-[var(--color-border)] overflow-hidden shadow-sm">
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[22px] lg:text-[28px] font-bold text-[var(--color-text-heading)] tracking-tight">Recommended for You</h2>
            <Link to="/explore" className="text-[var(--color-primary)] font-semibold text-[14px] hover:text-[var(--color-accent)] flex items-center gap-1">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-[12px] text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-white rounded-[16px] animate-pulse border border-[var(--color-border)]/60" />
              ))
            ) : (
              products.map((prod) => (
                <ProductCard key={prod.id} product={prod} onAddToCart={() => handleAddToCart(prod)} />
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

      </div>
    </div>
  );
}
