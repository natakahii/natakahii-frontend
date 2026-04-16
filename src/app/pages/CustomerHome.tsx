import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { 
  Play, Heart, Star, ShoppingCart, Search, 
  Smartphone, Shirt, Home as HomeIcon, Watch, Sparkles, Zap, ChevronRight, CheckCircle, Package, Store
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductCard } from '../components/ui/product-card';

// Reusing dummy data from Home
const categories = [
  { name: 'Fashion', icon: Shirt },
  { name: 'Electronics', icon: Smartphone },
  { name: 'Home & Living', icon: HomeIcon },
  { name: 'Accessories', icon: Watch },
  { name: 'Beauty', icon: Sparkles },
  { name: 'Sports', icon: Zap },
];

const mockProducts = [
  { id: 1, title: "African Print Maxi Dress", vendor: "Nairobi Styles", price: "KES 4,500", rating: 4.8, likes: 234, img: "https://images.unsplash.com/photo-1508418717103-8b56bcf03360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
  { id: 2, title: "Handcrafted Leather Sneakers", vendor: "Kazi Kicks", price: "KES 6,200", rating: 4.9, likes: 512, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
  { id: 3, title: "Samsung Galaxy S24 Ultra", vendor: "Tech Hub KE", price: "KES 145,000", rating: 4.7, likes: 120, img: "https://images.unsplash.com/photo-1684132925971-31c258718bd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
  { id: 4, title: "Organic Shea Butter 500g", vendor: "Natural Essence", price: "KES 1,200", rating: 4.9, likes: 890, img: "https://images.unsplash.com/photo-1643168343279-3f93c2e592ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
];

export function CustomerHome() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col gap-8 lg:gap-16 pb-20">
      
      {/* PERSONALIZED HERO & AI RECOMMENDATION STRIP */}
      <section className="bg-white border-b border-[var(--color-border)] pb-8 pt-6 lg:pt-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-[32px] md:text-[40px] font-bold text-[var(--color-text-heading)] tracking-tight">
                Karibu, <span className="text-[var(--color-primary)]">Jane!</span> 👋
              </h1>
              <p className="text-[16px] text-[var(--color-text-muted)] mt-1">Ready to discover something new today?</p>
            </div>
            
            <div className="w-full md:w-auto flex-1 max-w-md bg-[var(--color-bg-page)] rounded-full flex items-center p-1.5 border border-[var(--color-border)] focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary-lighter)] transition-all">
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
          <div className="bg-gradient-to-r from-[var(--color-primary-bg)] to-[var(--color-accent-bg)] rounded-[16px] p-5 md:p-6 flex flex-col md:flex-row items-center gap-6 border border-[var(--color-border)] relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/40 to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-4 shrink-0 bg-white/60 backdrop-blur-sm p-4 rounded-[12px] shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[16px] text-[var(--color-text-heading)] flex items-center gap-2">
                  AI Picks for You <Badge variant="hot-deal" className="bg-[var(--color-accent)]/10 text-[var(--color-accent)]">New</Badge>
                </h3>
                <p className="text-[13px] text-[var(--color-text-muted)]">Based on your recent browsing</p>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar w-full relative z-10">
              {mockProducts.slice(0,3).map(prod => (
                <Link to={`/product/${prod.id}`} key={prod.id} className="shrink-0 w-[200px] bg-white rounded-[12px] p-2 flex gap-3 items-center shadow-sm hover:shadow-md transition-shadow group border border-[var(--color-border)]/50">
                  <div className="w-16 h-16 rounded-[8px] overflow-hidden bg-[var(--color-bg-page)] shrink-0">
                    <ImageWithFallback src={prod.img} alt={prod.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-[var(--color-text-heading)] truncate group-hover:text-[var(--color-primary)] transition-colors">{prod.title}</h4>
                    <p className="text-[14px] font-bold text-[var(--color-accent)] mt-1">{prod.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 flex flex-col gap-12 lg:gap-16">
        
        {/* CATEGORIES */}
        <section>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Link to={`/category/${cat.name.toLowerCase()}`} key={i} className="snap-start shrink-0 w-[100px] md:w-[120px] group flex flex-col items-center gap-3">
                  <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-[24px] bg-white border border-[var(--color-border)] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-[var(--color-primary)] transition-all duration-300 group-hover:-translate-y-1">
                    <Icon className="w-8 h-8 text-[var(--color-text-heading)] group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <span className="text-[13px] md:text-[14px] font-medium text-center text-[var(--color-text-heading)] group-hover:text-[var(--color-primary)]">
                    {cat.name}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {mockProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>

        {/* RECENTLY VIEWED (Simple Row) */}
        <section>
          <h2 className="text-[20px] font-bold text-[var(--color-text-heading)] mb-4 tracking-tight">Jump Back In</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="snap-start shrink-0 w-[140px] flex flex-col gap-2 group cursor-pointer">
                <div className="w-full aspect-square rounded-[16px] overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors">
                  <ImageWithFallback src={`https://images.unsplash.com/photo-${i % 2 === 0 ? '1508418717103-8b56bcf03360' : '1595950653106-6c9ebd614d3a'}?crop=entropy&cs=tinysrgb&fit=crop&w=300&q=80`} alt="Recent" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="text-[13px] font-medium text-[var(--color-text-heading)] line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">Product Name {i}</div>
              </div>
            ))}
          </div>
        </section>

        {/* BECOME A VENDOR CTA */}
        <section className="mt-4 mb-8">
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[var(--color-primary-darker)] via-[var(--color-primary)] to-[var(--color-primary-light)] p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-[var(--shadow-level-2)]">
            {/* Abstract bg shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-accent)]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
            
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-[12px] font-bold tracking-wide uppercase mb-4 backdrop-blur-sm">
                <Store className="w-4 h-4" /> Grow with us
              </div>
              <h2 className="text-[28px] md:text-[32px] font-bold leading-tight mb-3 tracking-tight">
                Turn your passion into profit
              </h2>
              <p className="text-[15px] opacity-90 leading-relaxed mb-0">
                Join thousands of verified vendors on Nataka Hii. Start selling to active buyers across East Africa today with 0% setup fees.
              </p>
            </div>
            
            <div className="relative z-10 w-full md:w-auto shrink-0 flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" className="bg-white text-[var(--color-primary-darker)] border-none hover:bg-[var(--color-bg-page)] px-8 shadow-md h-12">
                Open Your Store
              </Button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
