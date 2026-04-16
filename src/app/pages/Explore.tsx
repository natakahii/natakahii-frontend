import { useState } from 'react';
import { Filter, ChevronDown, X, Star, Heart, ShoppingCart, CheckCircle, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const PLP_MOCK_PRODUCTS = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  title: `Product Title ${i + 1} - High Quality Authentic Material`,
  vendor: "Verified Vendor KE",
  price: `KES ${(1200 + i * 850).toLocaleString()}`,
  rating: (4 + Math.random()).toFixed(1),
  img: i % 2 === 0 
    ? "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2Vyc3xlbnwxfHx8fDE3NzYxNzQyNDB8MA&ixlib=rb-4.1.0&q=80&w=800"
    : "https://images.unsplash.com/photo-1508418717103-8b56bcf03360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBmYXNoaW9ufGVufDF8fHx8MTc3NjIxMjAzNXww&ixlib=rb-4.1.0&q=80&w=800"
}));

export function Explore() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      {/* Breadcrumbs */}
      <div className="text-[12px] text-[var(--color-text-muted)] mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-[var(--color-primary)]">Home</Link>
        <span>/</span>
        <span className="text-[var(--color-text-heading)] font-medium">All Products</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* MOBILE FILTER TRIGGER */}
        <div className="lg:hidden flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <Button variant="secondary" size="s" onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 rounded-full border-[var(--color-border)] text-[var(--color-text-body)] hover:bg-[var(--color-bg-card)]">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <span className="text-[var(--color-text-muted)]">Sort:</span>
            <select className="bg-transparent font-bold text-[var(--color-text-heading)] focus:outline-none">
              <option>Relevance</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        {/* MOBILE FILTER BOTTOM SHEET */}
        {isFilterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsFilterOpen(false)}>
            <div 
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] max-h-[85vh] overflow-y-auto shadow-[var(--shadow-level-4)] transition-transform translate-y-0"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between z-10">
                <span className="text-[18px] font-bold text-[var(--color-text-heading)]">Filters</span>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 -mr-2 bg-[var(--color-bg-card)] rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-8">
                {/* Simplified filter content for mobile view */}
                <div>
                  <h3 className="font-bold text-[16px] text-[var(--color-text-heading)] mb-4">Categories</h3>
                  <div className="space-y-3">
                    {['Fashion (4,231)', 'Electronics (1,043)', 'Beauty (892)', 'Home (540)'].map(cat => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded-[4px] border-2 border-[var(--color-border)] group-hover:border-[var(--color-primary)] flex items-center justify-center"></div>
                        <span className="text-[14px] text-[var(--color-text-body)] group-hover:text-[var(--color-text-heading)]">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-white border-t border-[var(--color-border)] p-4 flex gap-3 z-10 pb-[calc(env(safe-area-inset-bottom)+16px)]">
                <Button variant="outline" className="flex-1" onClick={() => setIsFilterOpen(false)}>Reset</Button>
                <Button variant="primary" className="flex-1" onClick={() => setIsFilterOpen(false)}>Apply</Button>
              </div>
            </div>
          </div>
        )}

        {/* SIDEBAR FILTERS */}
        <div className="hidden lg:block lg:w-[280px] shrink-0 sticky top-24 self-start">
          <div className="h-full flex flex-col">
            {/* Mobile Header (kept for consistency but hidden on lg) */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <span className="text-[18px] font-bold">Filters</span>
              <button onClick={() => setIsFilterOpen(false)}><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6 lg:p-0 flex-1 overflow-y-auto space-y-8">
              {/* Category */}
              <div>
                <h3 className="font-bold text-[16px] text-[var(--color-text-heading)] mb-4">Categories</h3>
                <div className="space-y-3">
                  {['Fashion (4,231)', 'Electronics (1,043)', 'Beauty (892)', 'Home (540)'].map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-[4px] border-2 border-[var(--color-border)] group-hover:border-[var(--color-primary)] flex items-center justify-center">
                        {/* Selected state mock */}
                      </div>
                      <span className="text-[14px] text-[var(--color-text-body)] group-hover:text-[var(--color-text-heading)]">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="font-bold text-[16px] text-[var(--color-text-heading)] mb-4">Price Range (KES)</h3>
                <div className="flex items-center gap-2 mb-4">
                  <input type="number" placeholder="Min" className="w-full bg-[var(--color-bg-card)] border-none rounded-[8px] px-3 py-2 text-[14px]" />
                  <span className="text-[var(--color-text-muted)]">-</span>
                  <input type="number" placeholder="Max" className="w-full bg-[var(--color-bg-card)] border-none rounded-[8px] px-3 py-2 text-[14px]" />
                </div>
                <div className="h-2 bg-[var(--color-bg-card)] rounded-full relative">
                  <div className="absolute left-[20%] right-[30%] h-full bg-[var(--color-primary)] rounded-full"></div>
                  <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[var(--color-primary)] rounded-full shadow-sm cursor-pointer"></div>
                  <div className="absolute right-[30%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[var(--color-primary)] rounded-full shadow-sm cursor-pointer"></div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="font-bold text-[16px] text-[var(--color-text-heading)] mb-4">Minimum Rating</h3>
                <div className="space-y-3">
                  {[4, 3, 2].map(rating => (
                    <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="rating" className="w-4 h-4 text-[var(--color-primary)] border-[var(--color-border)] focus:ring-[var(--color-primary)]" />
                      <div className="flex items-center gap-1">
                        {Array.from({length: 5}).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-transparent text-[var(--color-border)]'}`} />
                        ))}
                        <span className="text-[13px] text-[var(--color-text-muted)] ml-1">& Up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[14px] font-medium text-[var(--color-text-heading)]">In Stock Only</span>
                  <div className="w-11 h-6 bg-[var(--color-primary)] rounded-full relative flex items-center px-1">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-sm"></div>
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[14px] font-medium text-[var(--color-text-heading)]">Verified Vendors Only</span>
                  <div className="w-11 h-6 bg-[var(--color-border)] rounded-full relative flex items-center px-1 transition-colors">
                    <div className="w-4 h-4 bg-white rounded-full absolute left-1 shadow-sm transition-all"></div>
                  </div>
                </label>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="lg:hidden p-4 border-t border-[var(--color-border)] grid grid-cols-2 gap-4">
              <Button variant="secondary" className="w-full">Clear</Button>
              <Button variant="primary" className="w-full" onClick={() => setIsFilterOpen(false)}>Apply</Button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1">
          {/* Desktop Sort & Active Filters */}
          <div className="hidden lg:block mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-text-heading)]">
                All Products <span className="text-[var(--color-text-muted)] text-[16px] font-normal ml-2">2,481 results</span>
              </h1>
              <div className="flex items-center gap-3 bg-[var(--color-bg-card)] px-4 py-2 rounded-full">
                <span className="text-[13px] font-medium text-[var(--color-text-muted)]">Sort by:</span>
                <select className="bg-transparent font-bold text-[14px] text-[var(--color-text-heading)] focus:outline-none cursor-pointer">
                  <option>Relevance</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>
            {/* Active Filters */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 bg-[var(--color-primary-bg)] text-[var(--color-primary)] px-3 py-1 rounded-full text-[12px] font-medium">
                Fashion
                <X className="w-3 h-3 cursor-pointer hover:text-[var(--color-primary-darker)]" />
              </span>
              <span className="inline-flex items-center gap-1 bg-[var(--color-primary-bg)] text-[var(--color-primary)] px-3 py-1 rounded-full text-[12px] font-medium">
                KES 1k - 5k
                <X className="w-3 h-3 cursor-pointer hover:text-[var(--color-primary-darker)]" />
              </span>
              <button className="text-[12px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] underline ml-2">
                Clear all
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {PLP_MOCK_PRODUCTS.map((prod) => (
              <Link to="/product/1" key={prod.id}>
                <Card className="group cursor-pointer hover:shadow-[var(--shadow-level-2)] transition-shadow h-full flex flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-card)]">
                    <ImageWithFallback src={prod.img} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-white transition-all">
                      <Heart className="w-4 h-4" />
                    </button>
                    {prod.id === 0 && <Badge variant="new" className="absolute top-3 left-3 bg-[var(--color-primary-darker)] text-white shadow-sm">New</Badge>}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-[12px] text-[var(--color-text-muted)] mb-1 flex items-center justify-between">
                      <span className="truncate flex items-center gap-1">
                        {prod.vendor}
                        <CheckCircle className="w-3 h-3 text-[var(--color-primary)] inline" />
                      </span>
                      <span className="flex items-center gap-1 text-[var(--color-text-heading)] font-medium">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {prod.rating}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[14px] text-[var(--color-text-heading)] line-clamp-2 mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                      {prod.title}
                    </h3>
                    <div className="mt-auto flex items-end justify-between">
                      <div className="text-[16px] lg:text-[18px] font-bold text-[var(--color-text-heading)] tracking-tight">
                        {prod.price}
                      </div>
                      <Button variant="secondary" size="xs" className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-[var(--color-primary-bg)] border-transparent hover:bg-[var(--color-primary)] hover:text-white transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button variant="primary" size="l" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-md w-full max-w-[240px] border-none font-bold">
              Load More Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
