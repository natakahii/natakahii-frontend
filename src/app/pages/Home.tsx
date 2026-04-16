import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { 
  Play, Heart, Star, ShoppingCart, Search, 
  Smartphone, Shirt, Home as HomeIcon, Watch, Sparkles, Zap, ChevronRight, CheckCircle 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

// Dummy Data
const categories = [
  { name: 'Fashion', icon: Shirt },
  { name: 'Electronics', icon: Smartphone },
  { name: 'Home & Living', icon: HomeIcon },
  { name: 'Accessories', icon: Watch },
  { name: 'Beauty', icon: Sparkles },
  { name: 'Sports', icon: Zap },
];

const mockProducts = [
  { id: 1, title: "African Print Maxi Dress", vendor: "Nairobi Styles", price: "KES 4,500", rating: 4.8, likes: 234, img: "https://images.unsplash.com/photo-1508418717103-8b56bcf03360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBmYXNoaW9ufGVufDF8fHx8MTc3NjIxMjAzNXww&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 2, title: "Handcrafted Leather Sneakers", vendor: "Kazi Kicks", price: "KES 6,200", rating: 4.9, likes: 512, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2Vyc3xlbnwxfHx8fDE3NzYxNzQyNDB8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 3, title: "Samsung Galaxy S24 Ultra", vendor: "Tech Hub KE", price: "KES 145,000", rating: 4.7, likes: 120, img: "https://images.unsplash.com/photo-1684132925971-31c258718bd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmV8ZW58MXx8fHwxNzc2MjEyMDQyfDA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 4, title: "Organic Shea Butter 500g", vendor: "Natural Essence", price: "KES 1,200", rating: 4.9, likes: 890, img: "https://images.unsplash.com/photo-1643168343279-3f93c2e592ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMGNvc21ldGljc3xlbnwxfHx8fDE3NzYyMTIwMzZ8MA&ixlib=rb-4.1.0&q=80&w=1080" },
];

const mockVendors = [
  { id: 1, name: "Nairobi Styles", followers: "12.4K", products: 145, verified: true, avatar: "https://images.unsplash.com/photo-1508418717103-8b56bcf03360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBmYXNoaW9ufGVufDF8fHx8MTc3NjIxMjAzNXww&ixlib=rb-4.1.0&q=80&w=150" },
  { id: 2, name: "Kazi Kicks", followers: "8.2K", products: 56, verified: true, avatar: "https://images.unsplash.com/photo-1556452576-3e2d58536f62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc2MjEyMDM1fDA&ixlib=rb-4.1.0&q=80&w=150" },
  { id: 3, name: "Tech Hub KE", followers: "45K", products: 1200, verified: true, avatar: "https://images.unsplash.com/photo-1684132925971-31c258718bd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmV8ZW58MXx8fHwxNzc2MjEyMDQyfDA&ixlib=rb-4.1.0&q=80&w=150" },
  { id: 4, name: "Natural Essence", followers: "22K", products: 34, verified: false, avatar: "https://images.unsplash.com/photo-1643168343279-3f93c2e592ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMGNvc21ldGljc3xlbnwxfHx8fDE3NzYyMTIwMzZ8MA&ixlib=rb-4.1.0&q=80&w=150" },
];

export function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col gap-8 lg:gap-16 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative w-full bg-gradient-to-br from-[var(--color-primary-darker)] via-[var(--color-primary)] to-[var(--color-primary-light)] overflow-hidden pt-12 pb-20 lg:py-24 px-4">
        {/* Background abstract shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-accent)]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-info)]/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        
        <div className="container relative z-10 mx-auto max-w-4xl text-center flex flex-col items-center">
          <Badge className="mb-6 bg-white/10 text-[var(--color-accent-lighter)] border border-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full uppercase tracking-widest text-[12px]">
            The New E-Commerce Standard
          </Badge>
          
          <h1 className="text-[40px] md:text-[56px] lg:text-[64px] font-bold text-white leading-[1.1] tracking-[-1.5px] mb-6">
            Nataka Hii. <br />
            <span className="text-[var(--color-accent)]">Get What You Want.</span>
          </h1>
          
          <p className="text-[16px] md:text-[18px] text-[var(--color-primary-bg)] opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover thousands of verified local vendors, AI-curated products, and a fully protected shopping experience.
          </p>
          
          <div className="w-full max-w-2xl bg-white p-2 rounded-full shadow-[var(--shadow-level-3)] flex items-center mb-8 relative">
            <Search className="w-6 h-6 text-[var(--color-text-muted)] ml-4" />
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-[16px] font-medium text-[var(--color-text-heading)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-0 px-4 h-12"
            />
            <Button size="m" className="rounded-full shadow-sm px-8">Search</Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-[13px] text-white/80 font-medium">
            <span className="opacity-60 hidden md:inline">Trending:</span>
            {['Sneakers', 'Smartphones', 'Dresses', 'Headphones'].map(tag => (
              <span key={tag} className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer transition-colors backdrop-blur-sm border border-white/5">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 flex flex-col gap-12 lg:gap-20">
        
        {/* CATEGORIES */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[22px] lg:text-[28px] font-bold text-[var(--color-text-heading)] tracking-[-0.5px]">Trending Categories</h2>
            <Link to="/explore" className="text-[var(--color-primary)] font-semibold text-[14px] hover:text-[var(--color-accent)] flex items-center gap-1">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Link to={`/category/${cat.name.toLowerCase()}`} key={i} className="snap-start shrink-0 w-[100px] md:w-[120px] group flex flex-col items-center gap-3">
                  <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-[24px] bg-[var(--color-bg-card)] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:bg-[var(--color-primary-bg)] transition-all duration-300 group-hover:-translate-y-1">
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

        {/* FLASH DEALS */}
        <section>
          <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-[var(--color-accent-bg)] to-transparent p-4 rounded-t-[16px] border-l-4 border-[var(--color-accent)]">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-[var(--color-accent)]" />
              <h2 className="text-[22px] font-bold text-[var(--color-text-heading)] tracking-[-0.5px]">Flash Deals</h2>
              <Badge variant="hot-deal" className="ml-2">Ends in 04:23:10</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockProducts.map((prod) => (
              <Link to="/product/1" key={prod.id}>
                <Card className="group cursor-pointer hover:shadow-[var(--shadow-level-2)] transition-shadow h-full flex flex-col">
                  <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-card)]">
                    <ImageWithFallback src={prod.img} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-white transition-all">
                      <Heart className="w-4 h-4" />
                    </button>
                    <Badge variant="hot-deal" className="absolute top-3 left-3 bg-[var(--color-accent)]">-20%</Badge>
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
                    <h3 className="font-semibold text-[14px] text-[var(--color-text-heading)] line-clamp-2 mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                      {prod.title}
                    </h3>
                    <div className="mt-auto flex items-end justify-between">
                      <div>
                        <div className="text-[12px] text-[var(--color-text-muted)] line-through decoration-red-500/50">KES 8,000</div>
                        <div className="text-[18px] font-bold text-[var(--color-accent)] tracking-tight">
                          {prod.price}
                        </div>
                      </div>
                      <Button variant="primary" size="xs" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* AI SHOPPER BANNER */}
        <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[var(--color-primary-darker)] to-[var(--color-primary)] text-white p-8 md:p-12 shadow-[var(--shadow-level-2)]">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1556452576-3e2d58536f62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc2MjEyMDM1fDA&ixlib=rb-4.1.0&q=80&w=1080')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-darker)] via-[var(--color-primary-darker)]/80 to-transparent"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md mb-4 border border-white/20">
                <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
                <span className="text-[13px] font-semibold tracking-wide uppercase text-[var(--color-accent-bg)]">AI-Powered Shopping</span>
              </div>
              <h2 className="text-[28px] md:text-[36px] font-bold leading-tight mb-4 tracking-[-1px]">
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

            {/* Mock chat bubbles */}
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
                <p className="text-[14px]">Found 3 top-rated vendors in Nairobi offering custom Maasai jewelry. Check these out...</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* VIDEO COMMERCE TEASERS */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[22px] lg:text-[28px] font-bold text-[var(--color-text-heading)] tracking-[-0.5px]">Discover on Video</h2>
              <p className="text-[14px] text-[var(--color-text-muted)] mt-1">Watch real vendor demos and reviews.</p>
            </div>
            <Link to="/video" className="text-[var(--color-primary)] font-semibold text-[14px] hover:text-[var(--color-accent)] flex items-center gap-1 bg-[var(--color-primary-bg)] px-4 py-2 rounded-full">
              Open Feed <Play className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="relative aspect-[9/16] rounded-[16px] overflow-hidden bg-[var(--color-bg-card)] group cursor-pointer shadow-[var(--shadow-level-1)]">
                <ImageWithFallback 
                  src={`https://images.unsplash.com/photo-${i % 2 === 0 ? '1508418717103-8b56bcf03360' : '1730793295617-375689a1df3f'}?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=600`} 
                  alt="Video thumbnail" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/50">
                      <ImageWithFallback src="https://images.unsplash.com/photo-1556452576-3e2d58536f62?crop=entropy&cs=tinysrgb&fit=facearea&facepad=2&w=100&h=100&q=80" alt="avatar" />
                    </div>
                    <span className="text-[12px] font-medium text-white shadow-sm">Nairobi Styles</span>
                  </div>
                  <h3 className="text-[13px] font-semibold text-white leading-tight line-clamp-2">Styling the new summer collection dropping today 🔥</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* VENDOR SPOTLIGHT */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[22px] lg:text-[28px] font-bold text-[var(--color-text-heading)] tracking-[-0.5px]">Top Verified Vendors</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
            {mockVendors.map((vendor) => (
              <Card key={vendor.id} className="snap-start shrink-0 w-[260px] p-5 flex flex-col items-center text-center gap-3">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--color-border)] relative">
                  <ImageWithFallback src={vendor.avatar} alt={vendor.name} className="w-full h-full object-cover" />
                  {vendor.verified && (
                    <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5">
                      <CheckCircle className="w-5 h-5 text-[var(--color-primary)] fill-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-[var(--color-text-heading)]">{vendor.name}</h3>
                  <div className="text-[13px] text-[var(--color-text-muted)] flex items-center justify-center gap-3 mt-1">
                    <span>{vendor.followers} Followers</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                    <span>{vendor.products} Items</span>
                  </div>
                </div>
                <Button variant="secondary" size="s" className="w-full mt-2 rounded-full font-bold">Follow</Button>
              </Card>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
