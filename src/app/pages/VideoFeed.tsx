import { useState, useRef, useEffect } from 'react';
import { Heart, Share2, MessageCircle, Play, Pause, ShoppingBag, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { PullToRefresh } from '../components/ui/pull-to-refresh';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '../components/ui/drawer';
import { formatCurrency } from '../utils/currency';

const MOCK_VIDEOS = [
  {
    id: 1,
    videoUrl: "https://videos.pexels.com/video-files/5248839/5248839-hd_1080_1920_30fps.mp4", // Free stock video placeholder
    thumbnail: "https://images.unsplash.com/photo-1508418717103-8b56bcf03360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBmYXNoaW9ufGVufDF8fHx8MTc3NjIxMjAzNXww&ixlib=rb-4.1.0&q=80&w=800",
    vendor: "Nairobi Styles",
    vendorAvatar: "https://images.unsplash.com/photo-1556452576-3e2d58536f62?crop=entropy&cs=tinysrgb&fit=facearea&facepad=2&w=100&h=100&q=80",
    productName: "African Print Maxi Dress",
    price: 4500,
    likes: "12.4K",
    comments: "342",
    shares: "1.2K"
  },
  {
    id: 2,
    videoUrl: "https://videos.pexels.com/video-files/4440624/4440624-uhd_1440_2560_30fps.mp4", // Mock
    thumbnail: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbmVha2Vyc3xlbnwxfHx8fDE3NzYxNzQyNDB8MA&ixlib=rb-4.1.0&q=80&w=800",
    vendor: "Kazi Kicks",
    vendorAvatar: "https://images.unsplash.com/photo-1508418717103-8b56bcf03360?crop=entropy&cs=tinysrgb&fit=facearea&facepad=2&w=100&h=100&q=80",
    productName: "Handcrafted Leather Sneakers",
    price: 6200,
    likes: "8.9K",
    comments: "156",
    shares: "890"
  },
  {
    id: 3,
    videoUrl: "https://videos.pexels.com/video-files/6121402/6121402-uhd_1440_2560_25fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1643168343279-3f93c2e592ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMGNvc21ldGljc3xlbnwxfHx8fDE3NzYyMTIwMzZ8MA&ixlib=rb-4.1.0&q=80&w=800",
    vendor: "Natural Essence",
    vendorAvatar: "https://images.unsplash.com/photo-1556452576-3e2d58536f62?crop=entropy&cs=tinysrgb&fit=facearea&facepad=2&w=100&h=100&q=80",
    productName: "Organic Shea Butter 500g",
    price: 1200,
    likes: "45.2K",
    comments: "1.2K",
    shares: "5.4K"
  }
];

export function VideoFeed() {
  const [activeTab, setActiveTab] = useState<'For You' | 'Following'>('For You');
  const [activeVideoId, setActiveVideoId] = useState<number>(MOCK_VIDEOS[0].id);

  // Desktop view: Grid
  // Mobile view: Full screen snap scroll

  const handleRefresh = async () => {
    // Simulate API call for refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  return (
    <div className="bg-black text-white min-h-[calc(100vh-72px)] lg:min-h-0 lg:h-auto lg:py-8 lg:bg-[var(--color-bg-page)] relative">
      
      {/* Mobile Tabs Overlay */}
      <div className="fixed top-[72px] left-0 right-0 z-40 flex justify-center gap-6 py-4 bg-gradient-to-b from-black/80 to-transparent lg:hidden">
        <button 
          onClick={() => setActiveTab('Following')}
          className={`text-[16px] font-bold shadow-sm transition-all ${activeTab === 'Following' ? 'text-white' : 'text-white/60'}`}
        >
          Following
        </button>
        <button 
          onClick={() => setActiveTab('For You')}
          className={`text-[16px] font-bold shadow-sm transition-all relative ${activeTab === 'For You' ? 'text-white' : 'text-white/60'}`}
        >
          For You
          {activeTab === 'For You' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-white rounded-full"></span>}
        </button>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden lg:flex container mx-auto px-4 mb-6 items-center justify-between">
        <h1 className="text-[28px] font-bold text-[var(--color-text-heading)]">Video Commerce</h1>
        <div className="flex bg-[var(--color-bg-card)] p-1 rounded-[12px]">
          <button 
            onClick={() => setActiveTab('Following')}
            className={`px-6 py-2 rounded-[8px] text-[14px] font-bold transition-all ${activeTab === 'Following' ? 'bg-white text-[var(--color-text-heading)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}
          >
            Following
          </button>
          <button 
            onClick={() => setActiveTab('For You')}
            className={`px-6 py-2 rounded-[8px] text-[14px] font-bold transition-all ${activeTab === 'For You' ? 'bg-white text-[var(--color-text-heading)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}
          >
            For You
          </button>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN SNAP SCROLL */}
      <div className="h-[calc(100vh-72px-64px)] lg:hidden w-full overflow-hidden relative">
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
            {MOCK_VIDEOS.map((video) => (
              <MobileVideoCard key={video.id} video={video} />
            ))}
          </div>
        </PullToRefresh>
      </div>

      {/* DESKTOP GRID */}
      <div className="hidden lg:grid container mx-auto px-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_VIDEOS.map((video) => (
          <DesktopVideoCard key={video.id} video={video} />
        ))}
      </div>
      
    </div>
  );
}

function MobileVideoCard({ video }: { video: typeof MOCK_VIDEOS[0] }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="relative w-full h-full snap-start snap-always bg-black flex justify-center">
      {/* Video Element */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback src={video.thumbnail} alt={video.productName} className="w-full h-full object-cover opacity-60" />
        {/* If real video: <video src={video.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" /> */}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none"></div>

      {/* Play/Pause Toggle Area */}
      <div 
        className="absolute inset-0 z-20 cursor-pointer flex items-center justify-center"
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {!isPlaying && (
          <div className="w-16 h-16 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        )}
      </div>

      {/* Right Sidebar Actions */}
      <div className="absolute right-4 bottom-32 z-30 flex flex-col items-center gap-6">
        <div className="relative group">
          <div className="w-12 h-12 rounded-full overflow-hidden border-[3px] border-white cursor-pointer">
            <ImageWithFallback src={video.vendorAvatar} alt={video.vendor} className="w-full h-full object-cover" />
          </div>
          <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center border-2 border-black hover:bg-[var(--color-primary-light)] transition-colors">
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <button className="flex flex-col items-center gap-1 group" onClick={() => setIsLiked(!isLiked)}>
          <div className={`w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors ${isLiked ? 'bg-[var(--color-accent)]' : 'group-hover:bg-white/20'}`}>
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
          </div>
          <span className="text-[12px] font-bold shadow-sm">{video.likes}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors group-hover:bg-white/20">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-[12px] font-bold shadow-sm">{video.shares}</span>
        </button>
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-20 left-4 right-20 z-30 flex flex-col gap-3">
        <h3 className="font-bold text-[16px] shadow-sm flex items-center gap-2">
          @{video.vendor}
        </h3>
        <p className="text-[14px] line-clamp-2 shadow-sm">
          Check out our latest piece! {video.productName}. Perfect for any occasion. ✨ #fashion #nairobi
        </p>

        {/* Shoppable Product Card Overlay */}
        <div className="bg-white/90 backdrop-blur-md rounded-[12px] p-3 flex items-center gap-3 w-full max-w-[300px]">
          <div className="w-12 h-12 rounded-[8px] overflow-hidden shrink-0">
            <ImageWithFallback src={video.thumbnail} alt={video.productName} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-bold text-[var(--color-text-heading)] line-clamp-1">{video.productName}</div>
            <div className="text-[14px] font-black text-[var(--color-accent)]">{formatCurrency(video.price)}</div>
          </div>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="primary" size="xs" className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white border-none shrink-0 px-4 rounded-[8px]">
                Shop
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-white text-[var(--color-text-body)]">
              <DrawerHeader>
                <DrawerTitle>Select Variant</DrawerTitle>
                <DrawerDescription>Choose your size and color</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <div>
                  <div className="font-bold mb-2">Size</div>
                  <div className="flex gap-2">
                    {['S', 'M', 'L'].map(s => <button key={s} className="w-10 h-10 border border-[var(--color-border)] rounded-md font-semibold text-[var(--color-text-heading)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors">{s}</button>)}
                  </div>
                </div>
                <div>
                  <div className="font-bold mb-2">Color</div>
                  <div className="flex gap-2">
                    {['bg-black', 'bg-[#8B4513]'].map(c => <button key={c} className={`w-10 h-10 rounded-full border-2 border-transparent hover:border-[var(--color-primary)] ${c}`}></button>)}
                  </div>
                </div>
              </div>
              <DrawerFooter>
                <Button className="w-full bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)]">Add to Cart - {formatCurrency(video.price)}</Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
}

function DesktopVideoCard({ video }: { video: typeof MOCK_VIDEOS[0] }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-full aspect-[9/16] rounded-[24px] overflow-hidden bg-black group cursor-pointer shadow-[var(--shadow-level-2)] hover:shadow-[var(--shadow-level-3)] transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 z-0">
        <ImageWithFallback src={video.thumbnail} alt={video.productName} className={`w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-80' : 'opacity-100'}`} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none" />

      {isHovered && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
            <Heart className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
            <Share2 className="w-5 h-5" />
          </div>
        </div>
      )}

      {/* Play Icon - Only visible when NOT hovered */}
      <div className={`absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Play className="w-6 h-6 text-white fill-white ml-1" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 z-30">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/50">
            <ImageWithFallback src={video.vendorAvatar} alt={video.vendor} className="w-full h-full object-cover" />
          </div>
          <span className="text-[14px] font-bold text-white shadow-sm">{video.vendor}</span>
        </div>
        
        <h3 className="text-[16px] font-semibold text-white leading-tight mb-4 line-clamp-2 shadow-sm">
          {video.productName}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-[18px] font-black text-[var(--color-accent)] drop-shadow-md">
            {formatCurrency(video.price)}
          </span>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="primary" size="s" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] border-none text-white rounded-full">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-white text-[var(--color-text-body)]">
              <DrawerHeader>
                <DrawerTitle>Select Variant</DrawerTitle>
                <DrawerDescription>Choose your size and color</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <div>
                  <div className="font-bold mb-2">Size</div>
                  <div className="flex gap-2">
                    {['S', 'M', 'L'].map(s => <button key={s} className="w-10 h-10 border border-[var(--color-border)] rounded-md font-semibold text-[var(--color-text-heading)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors">{s}</button>)}
                  </div>
                </div>
                <div>
                  <div className="font-bold mb-2">Color</div>
                  <div className="flex gap-2">
                    {['bg-black', 'bg-[#8B4513]'].map(c => <button key={c} className={`w-10 h-10 rounded-full border-2 border-transparent hover:border-[var(--color-primary)] ${c}`}></button>)}
                  </div>
                </div>
              </div>
              <DrawerFooter>
                <Button className="w-full bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)]">Add to Cart - {formatCurrency(video.price)}</Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
}
