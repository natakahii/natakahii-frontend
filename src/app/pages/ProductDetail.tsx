import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Star, Heart, Share2, BellRing, ShieldCheck, ChevronRight, Plus, Minus, Sparkles, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { AnimatedPrice } from '../components/ui/animated-price';
import { FloatingCart } from '../components/ui/floating-cart';

const THUMBNAILS = [
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2Vyc3xlbnwxfHx8fDE3NzYxNzQyNDB8MA&ixlib=rb-4.1.0&q=80&w=800",
  "https://images.unsplash.com/photo-1508418717103-8b56bcf03360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBmYXNoaW9ufGVufDF8fHx8MTc3NjIxMjAzNXww&ixlib=rb-4.1.0&q=80&w=800",
  "https://images.unsplash.com/photo-1684132925971-31c258718bd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmV8ZW58MXx8fHwxNzc2MjEyMDQyfDA&ixlib=rb-4.1.0&q=80&w=800"
];

export function ProductDetail() {
  const [activeImage, setActiveImage] = useState(THUMBNAILS[0]);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('M');
  const [color, setColor] = useState('bg-black');
  const [activeTab, setActiveTab] = useState('Description');

  // Base price
  const basePrice = 6200;
  // Size multiplier or adder just for demo purposes
  const sizeAdder = size === '42' || size === '44' ? 500 : 0;
  const currentPrice = (basePrice + sizeAdder) * qty;
  const oldPrice = 8266 * qty;

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <FloatingCart price={`KES ${currentPrice.toLocaleString()}`} onAddToCart={() => {}} />
      {/* Breadcrumbs */}
      <div className="text-[13px] text-[var(--color-text-muted)] mb-8 flex flex-wrap items-center gap-2 font-medium">
        <Link to="/" className="hover:text-[var(--color-primary)]">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/explore" className="hover:text-[var(--color-primary)]">Fashion</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/vendor/1" className="hover:text-[var(--color-primary)] flex items-center gap-1">
          Nairobi Styles <CheckCircle className="w-3 h-3 text-[var(--color-primary)]" />
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[var(--color-text-heading)] line-clamp-1 max-w-[200px] truncate">Authentic Handcrafted Leather Sneakers</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
        
        {/* GALLERY */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square bg-[var(--color-bg-card)] rounded-[24px] overflow-hidden group cursor-zoom-in shadow-[var(--shadow-level-1)]">
            <ImageWithFallback 
              src={activeImage} 
              alt="Product Main" 
              className="w-full h-full object-cover mix-blend-multiply group-hover:scale-125 transition-transform duration-500 ease-out" 
            />
            <Badge variant="hot-deal" className="absolute top-4 left-4 text-[13px] px-4 py-1.5 shadow-sm">-25% OFF</Badge>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x py-2">
            {THUMBNAILS.map((thumb, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(thumb)}
                className={`snap-start relative w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-[16px] overflow-hidden border-2 transition-all shrink-0 ${activeImage === thumb ? 'border-[var(--color-primary)] shadow-md' : 'border-transparent opacity-70 hover:opacity-100 hover:border-[var(--color-border)]'}`}
              >
                <ImageWithFallback src={thumb} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover bg-[var(--color-bg-card)] mix-blend-multiply" />
              </button>
            ))}
          </div>
        </div>

        {/* DETAILS */}
        <div className="flex flex-col">
          <div className="mb-6">
            <Link to="/vendor/1" className="inline-flex items-center gap-2 text-[14px] font-bold text-[var(--color-text-heading)] hover:text-[var(--color-primary)] mb-3 bg-[var(--color-bg-card)] px-3 py-1.5 rounded-full w-fit">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <ImageWithFallback src="https://images.unsplash.com/photo-1556452576-3e2d58536f62?crop=entropy&cs=tinysrgb&fit=facearea&facepad=2&w=100&h=100&q=80" alt="vendor" className="w-full h-full object-cover" />
              </div>
              Nairobi Styles <CheckCircle className="w-4 h-4 text-[var(--color-primary)]" />
            </Link>
            <h1 className="text-[28px] md:text-[36px] font-bold text-[var(--color-text-heading)] tracking-[-0.5px] leading-tight mb-4">
              Authentic Handcrafted Leather Sneakers
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[14px] text-[var(--color-text-muted)] font-medium">
              <div className="flex items-center gap-1 text-[var(--color-text-heading)] bg-[var(--color-warning-bg)] px-2 py-0.5 rounded-[4px]">
                <Star className="w-4 h-4 fill-[var(--color-warning)] text-[var(--color-warning)]" />
                <span className="font-bold">4.9</span>
              </div>
              <a href="#reviews" className="hover:underline text-[var(--color-text-body)]">124 Reviews</a>
              <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 1.2k views this week</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-end gap-3 mb-2">
              <AnimatedPrice value={currentPrice} currency="KES" className="text-[36px] font-bold text-[var(--color-accent)] leading-none tracking-tight" />
              <span className="text-[18px] text-[var(--color-text-muted)] line-through font-semibold mb-1 decoration-red-500/50">KES {oldPrice.toLocaleString()}</span>
            </div>
            <div className="text-[13px] text-[var(--color-success)] font-bold flex items-center gap-1 bg-[var(--color-success-bg)] w-fit px-2 py-0.5 rounded-[4px]">
              <CheckCircle className="w-3 h-3" /> In Stock (15 available)
            </div>
          </div>

          <hr className="border-[var(--color-border)] mb-8" />

          {/* VARIANTS */}
          <div className="space-y-6 mb-8">
            {/* Colors */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[14px] font-bold text-[var(--color-text-heading)]">Color: <span className="font-normal text-[var(--color-text-body)] capitalize">{color.replace('bg-', '')}</span></span>
              </div>
              <div className="flex gap-3">
                {['bg-black', 'bg-[#8B4513]', 'bg-white', 'bg-[#142490]'].map(c => (
                  <button 
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${color === c ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-offset-2' : 'border-[var(--color-border)] hover:border-[var(--color-primary-light)]'}`}
                  >
                    <div className={`w-8 h-8 rounded-full ${c} ${c === 'bg-white' ? 'border border-gray-200' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[14px] font-bold text-[var(--color-text-heading)]">Size (EU): <span className="font-normal text-[var(--color-text-body)]">{size}</span></span>
                <button className="text-[13px] text-[var(--color-primary)] font-semibold hover:underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {['38', '39', '40', '41', '42', '43 (Out of Stock)', '44'].map(s => {
                  const isAvailable = !s.includes('Out of Stock');
                  const val = s.split(' ')[0];
                  return (
                    <button 
                      key={s}
                      disabled={!isAvailable}
                      onClick={() => setSize(val)}
                      className={`h-11 px-5 rounded-[8px] border-2 font-semibold text-[14px] transition-all flex items-center justify-center min-w-[3rem] ${
                        !isAvailable ? 'border-[var(--color-border)] text-[var(--color-text-muted)] opacity-50 cursor-not-allowed bg-[var(--color-bg-page)]' 
                        : size === val ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md' 
                        : 'border-[var(--color-border)] text-[var(--color-text-heading)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] bg-white'
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ADD TO CART & BUY NOW */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4">
              {/* Stepper */}
              <div className="flex items-center bg-[var(--color-bg-card)] rounded-full h-14 p-1 border-2 border-[var(--color-border)] w-fit shrink-0">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-heading)] hover:bg-white hover:shadow-sm transition-all"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-bold text-[16px] text-[var(--color-text-heading)]">{qty}</span>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-heading)] hover:bg-white hover:shadow-sm transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <Button variant="primary" size="l" className="flex-1 shadow-md">
                Add to Cart
              </Button>
            </div>
            
            <Button variant="primary" size="l" className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] shadow-[var(--shadow-level-2)] border-none text-[18px]">
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

          {/* Trust Badge */}
          <div className="mt-6 flex items-start gap-4 bg-[var(--color-primary-bg)] p-4 rounded-[12px] border border-[var(--color-primary-light)]/20">
            <ShieldCheck className="w-8 h-8 text-[var(--color-primary)] shrink-0" />
            <div>
              <h4 className="font-bold text-[14px] text-[var(--color-primary-darker)] mb-1">Secure Escrow Payment</h4>
              <p className="text-[13px] text-[var(--color-text-body)] leading-snug">
                Your money is held safely until you receive and confirm the item is exactly as described. <a href="#" className="text-[var(--color-primary)] font-semibold hover:underline">Learn more</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BELOW FOLD: TABS */}
      <div className="mb-16">
        <div className="flex gap-8 border-b border-[var(--color-border)] overflow-x-auto hide-scrollbar snap-x">
          {['Description', 'Reviews (124)', 'Shipping & Return', 'Vendor Info'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`snap-start shrink-0 pb-4 text-[16px] font-bold transition-all relative ${activeTab === tab ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="product-detail-tabs"
                  transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
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
                  Experience the perfect blend of traditional craftsmanship and modern design with our Authentic Handcrafted Leather Sneakers. Made right here in Nairobi by skilled artisans using locally sourced materials.
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-6 font-medium">
                  <li>100% Genuine Kenyan Leather</li>
                  <li>Durable rubber sole for all-day comfort</li>
                  <li>Hand-stitched detailing</li>
                  <li>Breathable inner lining</li>
                </ul>
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
            {/* Mock other tabs if needed */}
          </div>

          {/* Vendor Sidebar */}
          <div>
            <Card className="p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--color-border)]">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1556452576-3e2d58536f62?crop=entropy&cs=tinysrgb&fit=facearea&facepad=2&w=100&h=100&q=80" alt="vendor" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-[18px] text-[var(--color-text-heading)] flex items-center gap-1">
                    Nairobi Styles <CheckCircle className="w-4 h-4 text-[var(--color-primary)]" />
                  </h3>
                  <div className="text-[13px] text-[var(--color-text-muted)] font-medium mt-1">12.4K Followers • 98% Positive Rating</div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="primary" className="flex-1">Follow Vendor</Button>
                <Button variant="secondary" className="flex-1">Visit Store</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
}
