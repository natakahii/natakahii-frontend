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
          <div className={`w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors ${isLiked ? 'bg-red-500/20' : 'group-hover:bg-white/20'}`}>
            <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </div>
          <span className="text-[12px] font-bold shadow-sm">{video.likes}</span>
        </button>

        <Drawer>
          <DrawerTrigger asChild>
            <button className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors group-hover:bg-white/20">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-[12px] font-bold shadow-sm">{video.shares}</span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-white text-[var(--color-text-body)]">
            <DrawerHeader>
              <DrawerTitle>Share to</DrawerTitle>
              <DrawerDescription>Choose a platform to share this video</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 grid grid-cols-4 gap-4">
              <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${video.productName} by ${video.vendor}!`)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
                  </svg>
                </div>
                <span className="text-[12px] font-medium">WhatsApp</span>
              </a>
              <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span className="text-[12px] font-medium">Instagram</span>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                <div className="w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-[12px] font-medium">Facebook</span>
              </a>
              <a href={`https://www.tiktok.com/`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </div>
                <span className="text-[12px] font-medium">TikTok</span>
              </a>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
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
