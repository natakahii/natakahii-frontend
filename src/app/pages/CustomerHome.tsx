import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Search,
  Smartphone, Shirt, Home as HomeIcon, Watch, Sparkles, Zap, ChevronRight, Store, Dumbbell
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductCard } from '../components/ui/product-card';
import { formatCurrency } from '../utils/currency';
import { getProductPath } from '../utils/products';
import { useAuth } from '../providers/AuthProvider';
import { useCart } from '../providers/CartProvider';
import { useToast } from '../components/ui/toast';
import { fetchProducts, fetchCategories, CatalogProduct, getProductPrimaryImage, CatalogCategory } from '../services/productService';

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

export function CustomerHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetchCategories(),
      fetchProducts({ per_page: 8, status: 'active' })
    ])
      .then(([categoryData, productData]) => {
        if (!isMounted) return;
        setCategories(categoryData);
        setProducts(productData.products);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load data');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

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
    <div className="flex flex-col gap-8 lg:gap-16 pb-20">
      
      {/* PERSONALIZED HERO & AI RECOMMENDATION STRIP */}
      <section className="bg-white border-b border-[var(--color-border)] pb-8 pt-6 lg:pt-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-[32px] md:text-[40px] font-bold text-[var(--color-text-heading)] tracking-tight">
                Karibu, <span className="text-[var(--color-primary)]">{user?.name || 'there'}!</span> 👋
              </h1>
              <p className="text-[16px] text-[var(--color-text-muted)] mt-1">Ready to discover something new today?</p>
            </div>
            
            <div className="w-full md:w-auto flex-1 max-w-md bg-white rounded-full flex items-center p-1.5 border border-[var(--color-border)] focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary-lighter)] transition-all">
              <Search className="w-5 h-5 text-[var(--color-text-muted)] ml-3" />
              <input 
                type="text" 
                placeholder="Search for items, brands..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-[15px] font-medium text-[var(--color-text-heading)] placeholder:text-[var(--color-text-muted)] focus:outline-none px-3 h-10"
              />
              <Button size="s" className="rounded-full px-6">Search</Button>
            </div>
          </div>

          {/* AI Recommendation Strip */}
          <div className="bg-white rounded-[16px] p-5 md:p-6 flex flex-col md:flex-row items-center gap-6 border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center gap-4 shrink-0 bg-white p-4 rounded-[12px] border border-[var(--color-border)]">
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent-bg)] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[var(--color-accent)]" />
              </div>
              <div>
                <h3 className="font-bold text-[16px] text-[var(--color-text-heading)] flex items-center gap-2">
                  AI Picks for You <Badge variant="hot-deal" className="bg-[var(--color-accent)]/10 text-[var(--color-accent)]">New</Badge>
                </h3>
                <p className="text-[13px] text-[var(--color-text-muted)]">Based on your recent browsing</p>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar w-full relative z-10">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-[200px] bg-white rounded-[12px] p-2 flex gap-3 items-center shadow-sm border border-[var(--color-border)]/50">
                    <div className="w-16 h-16 rounded-[8px] bg-gray-100 shrink-0 animate-pulse" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                products.slice(0,3).map(prod => (
                  <Link to={getProductPath(prod)} key={prod.id} className="shrink-0 w-[200px] bg-white rounded-[12px] p-2 flex gap-3 items-center shadow-sm hover:shadow-md transition-shadow group border border-[var(--color-border)]/50">
                    <div className="w-16 h-16 rounded-[8px] overflow-hidden bg-gray-100 shrink-0">
                      <ImageWithFallback src={getProductPrimaryImage(prod)} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-[var(--color-text-heading)] truncate group-hover:text-[var(--color-primary)] transition-colors">{prod.name}</h4>
                      <p className="text-[14px] font-bold text-[var(--color-accent)] mt-1">{formatCurrency(prod.effective_price)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 flex flex-col gap-12 lg:gap-16">
        
        {/* CATEGORIES */}
        <section>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
            {categories.slice(0, 6).map((category) => {
              const Icon = getCategoryIcon(category);
              return (
                <Link to={`/explore?category=${category.id}`} key={category.id} className="snap-start shrink-0 w-[100px] md:w-[120px] group flex flex-col items-center gap-3">
                  <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-[24px] bg-white border border-[var(--color-border)] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-[var(--color-primary)] transition-all duration-300 group-hover:-translate-y-1">
                    <Icon className="w-8 h-8 text-[var(--color-text-heading)] group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <span className="text-[13px] md:text-[14px] font-medium text-center text-[var(--color-text-heading)] group-hover:text-[var(--color-primary)]">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

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
