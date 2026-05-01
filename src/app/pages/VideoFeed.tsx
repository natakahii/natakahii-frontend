import { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, Share2, Play, Pause, ShoppingBag, Plus, Check, Volume2, VolumeX } from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { PullToRefresh } from '../components/ui/pull-to-refresh';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '../components/ui/drawer';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../providers/AuthProvider';
import { useToast } from '../components/ui/toast';
import {
  VideoItem,
  fetchVideoFeed,
  likeProduct,
  unlikeProduct,
  shareProduct,
  followVendor,
  unfollowVendor,
  formatCount,
} from '../services/videoFeedService';
import { addToCart } from '../services/cartService';
import { getProductPath } from '../utils/products';

// Video feed logo watermark for shares
const NATAKA_HII_LOGO = '/Nataka Hii_favicon updated.png';

export function VideoFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const { isAuthenticated } = useAuth();
  const targetVideoId = searchParams.get('v');

  // Fetch videos on mount and when tab changes
  const loadVideos = useCallback(async (page = 1, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetchVideoFeed(activeTab, page, 10);

      setVideos((prev) => {
        if (append) {
          const existingIds = new Set(prev.map((v) => v.id));
          const newVideos = response.videos.filter((v) => !existingIds.has(v.id));
          return [...prev, ...newVideos];
        }
        return response.videos;
      });
      setMeta(response.meta);
    } catch (err: any) {
      setError(err?.message || 'Failed to load videos');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [activeTab]);

  // Handle initial video ID from query param
  useEffect(() => {
    if (targetVideoId && videos.length > 0) {
      const targetIndex = videos.findIndex((v) => v.id.toString() === targetVideoId);
      if (targetIndex !== -1) {
        // Scroll to the target video
        const targetElement = document.getElementById(`video-${targetVideoId}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // Clear the query param after navigation
        setSearchParams({}, { replace: true });
      }
    }
  }, [videos, targetVideoId, setSearchParams]);

  useEffect(() => {
    loadVideos(1, false);
  }, [loadVideos]);

  const handleRefresh = async () => {
    await loadVideos(1, false);
  };

  const handleLoadMore = () => {
    if (meta.current_page < meta.last_page && !isLoadingMore) {
      loadVideos(meta.current_page + 1, true);
    }
  };

  const handleTabChange = (tab: 'for-you' | 'following') => {
    setActiveTab(tab);
    // Videos will be reloaded via the useEffect when activeTab changes
  };

  // Update a specific video in the list (for likes/follows)
  const updateVideo = useCallback((videoId: number, updates: Partial<VideoItem>) => {
    setVideos((prev) =>
      prev.map((video) => (video.id === videoId ? { ...video, ...updates } : video))
    );
  }, []);

  return (
    <div className="bg-black text-white min-h-[calc(100vh-72px)] lg:min-h-0 lg:h-auto lg:py-8 lg:bg-[var(--color-bg-page)] relative">
      {/* Mobile Tabs Overlay */}
      <div className="fixed top-[72px] left-0 right-0 z-40 flex justify-center gap-6 py-4 bg-gradient-to-b from-black/80 to-transparent lg:hidden">
        <button
          onClick={() => handleTabChange('following')}
          className={`text-[16px] font-bold shadow-sm transition-all ${activeTab === 'following' ? 'text-white' : 'text-white/60'}`}
        >
          Following
        </button>
        <button
          onClick={() => handleTabChange('for-you')}
          className={`text-[16px] font-bold shadow-sm transition-all relative ${activeTab === 'for-you' ? 'text-white' : 'text-white/60'}`}
        >
          For You
          {activeTab === 'for-you' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-white rounded-full"></span>}
        </button>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden lg:flex container mx-auto px-4 mb-6 items-center justify-between">
        <h1 className="text-[28px] font-bold text-[var(--color-text-heading)]">Video Commerce</h1>
        <div className="flex bg-[var(--color-bg-card)] p-1 rounded-[12px]">
          <button
            onClick={() => handleTabChange('following')}
            className={`px-6 py-2 rounded-[8px] text-[14px] font-bold transition-all ${activeTab === 'following' ? 'bg-white text-[var(--color-text-heading)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}
          >
            Following
          </button>
          <button
            onClick={() => handleTabChange('for-you')}
            className={`px-6 py-2 rounded-[8px] text-[14px] font-bold transition-all ${activeTab === 'for-you' ? 'bg-white text-[var(--color-text-heading)] shadow-sm' : 'text-[var(--color-text-muted)]'}`}
          >
            For You
          </button>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN SNAP SCROLL */}
      <div className="h-[calc(100vh-72px-64px)] lg:hidden w-full overflow-hidden relative">
        {isLoading && videos.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : error && videos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-8 gap-4">
            <p className="text-white/80 text-center">{error}</p>
            <Button onClick={handleRefresh} variant="primary">Retry</Button>
          </div>
        ) : (
          <PullToRefresh onRefresh={handleRefresh}>
            <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
              {videos.map((video, index) => (
                <MobileVideoCard
                  key={video.id}
                  video={video}
                  onUpdate={updateVideo}
                  isLast={index === videos.length - 1}
                  onLoadMore={handleLoadMore}
                />
              ))}
              {isLoadingMore && (
                <div className="h-[100px] flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              {activeTab === 'following' && videos.length === 0 && isAuthenticated && (
                <div className="h-full flex flex-col items-center justify-center px-8 text-center">
                  <p className="text-white/80 mb-4">You are not following any vendors yet.</p>
                  <p className="text-white/60 text-sm">Follow vendors to see their videos here first!</p>
                </div>
              )}
            </div>
          </PullToRefresh>
        )}
      </div>

      {/* DESKTOP GRID */}
      <div className="hidden lg:grid container mx-auto px-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading && videos.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] bg-[var(--color-bg-card)] rounded-[24px] animate-pulse" />
          ))
        ) : error && videos.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <p className="text-[var(--color-text-muted)] mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="primary">Retry</Button>
          </div>
        ) : (
          <>
            {videos.map((video) => (
              <DesktopVideoCard key={video.id} video={video} onUpdate={updateVideo} />
            ))}
            {isLoadingMore && (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`loading-${i}`} className="aspect-[9/16] bg-[var(--color-bg-card)] rounded-[24px] animate-pulse" />
              ))
            )}
          </>
        )}
      </div>

      {/* Load More Trigger for Desktop */}
      {meta.current_page < meta.last_page && !isLoading && !isLoadingMore && videos.length > 0 && (
        <div className="hidden lg:flex justify-center mt-8">
          <Button onClick={handleLoadMore} variant="primary" isLoading={isLoadingMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

interface MobileVideoCardProps {
  video: VideoItem;
  onUpdate: (videoId: number, updates: Partial<VideoItem>) => void;
  isLast: boolean;
  onLoadMore: () => void;
}

function MobileVideoCard({ video, onUpdate, isLast, onLoadMore }: MobileVideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Intersection Observer for auto-play/pause
  useEffect(() => {
    const videoElement = videoRef.current;
    const cardElement = cardRef.current;
    if (!videoElement || !cardElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            // This video is mostly visible - play it
            videoElement.play().catch(() => {
              // Autoplay was prevented, show play button
              setIsPlaying(false);
            });
            setIsPlaying(true);

            // If this is the last item, trigger load more
            if (isLast) {
              onLoadMore();
            }
          } else {
            // Video is not visible enough - pause it
            videoElement.pause();
            setIsPlaying(false);
          }
        });
      },
      {
        threshold: [0, 0.5, 0.6, 1],
        root: cardElement.parentElement?.parentElement || null, // The scroll container
      }
    );

    observer.observe(cardElement);

    return () => observer.disconnect();
  }, [isLast, onLoadMore]);

  const handleTogglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
      setIsPlaying(false);
    } else {
      videoElement.play().catch(() => {
        // Handle autoplay restrictions
      });
      setIsPlaying(true);
    }
  };

  const handleToggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const newMutedState = !isMuted;
    videoElement.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const handleUnauthenticatedAction = () => {
    navigate('/login', { state: { from: { pathname: '/video' } } });
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }

    if (!video.product) return;

    try {
      const newIsLiked = !video.is_liked_by_user;
      const newLikesCount = newIsLiked ? video.likes_count + 1 : video.likes_count - 1;

      // Optimistic update
      onUpdate(video.id, { is_liked_by_user: newIsLiked, likes_count: newLikesCount });

      // API call
      if (newIsLiked) {
        await likeProduct(video.product.id);
      } else {
        await unlikeProduct(video.product.id);
      }
    } catch (err) {
      // Revert on error
      onUpdate(video.id, { is_liked_by_user: video.is_liked_by_user, likes_count: video.likes_count });
      toast({ type: 'error', title: 'Failed to update like' });
    }
  };

  const handleShare = async (platform: string) => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }

    if (!video.product) return;

    try {
      // Record the share
      await shareProduct(video.product.id, platform);

      // Update local count
      onUpdate(video.id, { shares_count: video.shares_count + 1 });

      // Platform-specific share logic
      const shareUrl = `${window.location.origin}/product/${video.product.slug || video.product.id}`;
      const shareText = `Check out ${video.product.name} by ${video.vendor?.shop_name || 'Nataka Hii'}!`;

      switch (platform) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast({ type: 'success', title: 'Link copied to clipboard!' });
          break;
      }
    } catch (err) {
      toast({ type: 'error', title: 'Failed to share' });
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }

    if (!video.vendor) return;

    try {
      const newIsFollowing = !video.is_following_vendor;

      // Optimistic update
      onUpdate(video.id, { is_following_vendor: newIsFollowing });

      // API call
      if (newIsFollowing) {
        await followVendor(video.vendor.id);
        toast({ type: 'success', title: `Now following ${video.vendor.shop_name}!` });
      } else {
        await unfollowVendor(video.vendor.id);
      toast({ type: 'success', title: `Unfollowed ${video.vendor.shop_name}` });
      }
    } catch (err) {
      // Revert on error
      onUpdate(video.id, { is_following_vendor: video.is_following_vendor });
      toast({ type: 'error', title: 'Failed to update follow status' });
    }
  };

  const handleVendorClick = () => {
    if (!video.vendor?.shop_slug) return;
    navigate(`/shop/${video.vendor.shop_slug}`);
  };

  const handleShopClick = () => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }
    // Shop drawer will open - handled by DrawerTrigger
  };

  const handleAddToCart = async (variantId?: number) => {
    if (!video.product) return;

    try {
      await addToCart(video.product.id, 1, variantId);
      toast({ type: 'success', title: 'Added to cart!' });
    } catch (err: any) {
      toast({ type: 'error', title: err?.message || 'Failed to add to cart' });
    }
  };

  const primaryImage = video.product?.images?.[0]?.image_path || '/natakahii-logo.png';
  const vendorLogo = video.vendor?.logo || '/natakahii-logo.png';
  const effectivePrice = video.product?.effective_price || video.product?.price || 0;

  return (
    <div ref={cardRef} id={`video-${video.id}`} className="relative w-full h-full snap-start snap-always bg-black flex justify-center">
      {/* Video Element with Auto-play */}
      <div className="absolute inset-0 z-0">
        {video.file_path ? (
          <video
            ref={videoRef}
            src={video.file_path}
            className="w-full h-full object-cover"
            loop
            playsInline
            muted={isMuted}
            preload="metadata"
          />
        ) : (
          <ImageWithFallback src={primaryImage} alt={video.title || video.product?.name || 'Video'} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none"></div>

      {/* Play/Pause Toggle Area */}
      <div
        className="absolute inset-0 z-20 cursor-pointer flex items-center justify-center"
        onClick={handleTogglePlay}
      >
        {!isPlaying ? (
          <div className="w-16 h-16 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Pause className="w-8 h-8 text-white fill-white" />
          </div>
        )}
      </div>

      {/* Right Sidebar Actions */}
      <div className="absolute right-4 bottom-32 z-30 flex flex-col items-center gap-6">
        {/* Vendor Avatar with Follow Button */}
        <div className="relative group">
          <button
            onClick={handleVendorClick}
            className="w-12 h-12 rounded-full overflow-hidden border-[3px] border-white cursor-pointer hover:scale-105 transition-transform"
          >
            <ImageWithFallback src={vendorLogo} alt={video.vendor?.shop_name || 'Vendor'} className="w-full h-full object-cover" />
          </button>
          <button
            onClick={handleFollow}
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-black transition-colors ${
              video.is_following_vendor
                ? 'bg-white text-[var(--color-primary)]'
                : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]'
            }`}
          >
            {video.is_following_vendor ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          </button>
        </div>

        {/* Like Button */}
        <button className="flex flex-col items-center gap-1 group" onClick={handleLike}>
          <div className={`w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors ${
            video.is_liked_by_user ? 'bg-red-500/20' : 'group-hover:bg-white/20'
          }`}>
            <Heart className={`w-6 h-6 transition-colors ${video.is_liked_by_user ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </div>
          <span className="text-[12px] font-bold shadow-sm">{formatCount(video.likes_count)}</span>
        </button>

        {/* Mute Toggle Button */}
        <button
          className="flex flex-col items-center gap-1 group"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleMute();
          }}
        >
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors group-hover:bg-white/20">
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </div>
          <span className="text-[12px] font-bold shadow-sm">{isMuted ? 'Muted' : 'Sound'}</span>
        </button>

        {/* Share Button */}
        <Drawer>
          <DrawerTrigger asChild>
            <button className="flex flex-col items-center gap-1 group" onClick={() => !isAuthenticated && handleUnauthenticatedAction()}>
              <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors group-hover:bg-white/20">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-[12px] font-bold shadow-sm">{formatCount(video.shares_count)}</span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-white text-[var(--color-text-body)]">
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2">
                <img src={NATAKA_HII_LOGO} alt="Nataka Hii" className="w-6 h-6" />
                Share Product
              </DrawerTitle>
              <DrawerDescription>
                Share {video.product?.name || 'this product'} from {video.vendor?.shop_name || 'Nataka Hii'}
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 grid grid-cols-4 gap-4">
              <button onClick={() => handleShare('whatsapp')} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
                  </svg>
                </div>
                <span className="text-[12px] font-medium">WhatsApp</span>
              </button>
              <button onClick={() => handleShare('facebook')} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                <div className="w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-[12px] font-medium">Facebook</span>
              </button>
              <button onClick={() => handleShare('twitter')} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-[12px] font-medium">X (Twitter)</span>
              </button>
              <button onClick={() => handleShare('copy')} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                <div className="w-14 h-14 rounded-full bg-[var(--color-bg-card)] border-2 border-[var(--color-border)] flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--color-text-heading)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <span className="text-[12px] font-medium">Copy Link</span>
              </button>
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
        <button
          onClick={handleVendorClick}
          className="font-bold text-[16px] shadow-sm flex items-center gap-2 hover:underline text-left"
        >
          @{video.vendor?.shop_name || 'unknown'}
        </button>
        <p className="text-[14px] line-clamp-2 shadow-sm">
          {video.description || video.product?.description || `Check out ${video.product?.name || 'our latest product'}! ✨`}
        </p>

        {/* Shoppable Product Card Overlay */}
        {video.product && (
          <Drawer>
            <DrawerTrigger asChild>
              <button
                onClick={handleShopClick}
                className="bg-white/90 backdrop-blur-md rounded-[12px] p-3 flex items-center gap-3 w-full max-w-[300px] text-left hover:bg-white transition-colors"
              >
                <div className="w-12 h-12 rounded-[8px] overflow-hidden shrink-0">
                  <ImageWithFallback src={primaryImage} alt={video.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-[var(--color-text-heading)] line-clamp-1">{video.product.name}</div>
                  <div className="text-[14px] font-black text-[var(--color-accent)]">{formatCurrency(effectivePrice)}</div>
                </div>
                <span className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white text-[12px] font-bold px-4 py-2 rounded-[8px] shrink-0">
                  Shop
                </span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="bg-white text-[var(--color-text-body)] max-h-[85vh] overflow-y-auto">
              <DrawerHeader className="border-b border-[var(--color-border)]">
                <DrawerTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[8px] overflow-hidden">
                    <ImageWithFallback src={primaryImage} alt={video.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-1 text-[16px]">{video.product.name}</div>
                    <div className="text-[var(--color-accent)] font-bold">{formatCurrency(effectivePrice)}</div>
                  </div>
                </DrawerTitle>
                <DrawerDescription>
                  Select options and add to cart
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                {/* Variants if available */}
                {video.product.variants && video.product.variants.length > 0 && (
                  <div>
                    <div className="font-bold mb-2 text-[14px]">Select Variant</div>
                    <div className="flex flex-wrap gap-2">
                      {video.product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => handleAddToCart(variant.id)}
                          className="px-4 py-2 border border-[var(--color-border)] rounded-md text-[13px] font-semibold text-[var(--color-text-heading)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                        >
                          {variant.attribute_values.map(av => av.attribute_value?.value || av.numeric_value).join(' / ')}
                          {variant.price && variant.price !== effectivePrice && (
                            <span className="ml-2 text-[var(--color-accent)]">{formatCurrency(variant.price)}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Add Button */}
                <Button
                  onClick={() => handleAddToCart()}
                  className="w-full bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] font-bold py-3"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart - {formatCurrency(effectivePrice)}
                </Button>

                {/* View Full Product Link */}
                <Link
                  to={getProductPath(video.product)}
                  className="block w-full text-center text-[14px] text-[var(--color-primary)] font-semibold hover:underline py-2"
                >
                  View Full Product Details →
                </Link>
              </div>
              <DrawerFooter className="border-t border-[var(--color-border)]">
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </div>
  );
}

interface DesktopVideoCardProps {
  video: VideoItem;
  onUpdate: (videoId: number, updates: Partial<VideoItem>) => void;
}

function DesktopVideoCard({ video, onUpdate }: DesktopVideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleMouseEnter = () => {
    setIsHovered(true);
    const videoElement = videoRef.current;
    if (videoElement && video.file_path) {
      videoElement.play().catch(() => {
        // Autoplay might be blocked
      });
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleToggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const newMutedState = !isMuted;
    videoElement.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const handleUnauthenticatedAction = () => {
    navigate('/login', { state: { from: { pathname: '/video' } } });
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }

    if (!video.product) return;

    try {
      const newIsLiked = !video.is_liked_by_user;
      const newLikesCount = newIsLiked ? video.likes_count + 1 : video.likes_count - 1;

      onUpdate(video.id, { is_liked_by_user: newIsLiked, likes_count: newLikesCount });

      if (newIsLiked) {
        await likeProduct(video.product.id);
      } else {
        await unlikeProduct(video.product.id);
      }
    } catch (err) {
      onUpdate(video.id, { is_liked_by_user: video.is_liked_by_user, likes_count: video.likes_count });
      toast({ type: 'error', title: 'Failed to update like' });
    }
  };

  const handleShare = async () => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }

    if (!video.product) return;

    try {
      await shareProduct(video.product.id, 'copy');
      onUpdate(video.id, { shares_count: video.shares_count + 1 });

      const shareUrl = `${window.location.origin}/product/${video.product.slug || video.product.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({ type: 'success', title: 'Link copied to clipboard!' });
    } catch (err) {
      toast({ type: 'error', title: 'Failed to share' });
    }
  };

  const handleVendorClick = () => {
    if (!video.vendor?.shop_slug) return;
    navigate(`/shop/${video.vendor.shop_slug}`);
  };

  const handleShopClick = () => {
    if (!isAuthenticated) {
      handleUnauthenticatedAction();
      return;
    }
    // Navigate to product page
    if (video.product) {
      navigate(getProductPath(video.product));
    }
  };

  const primaryImage = video.product?.images?.[0]?.image_path || '/natakahii-logo.png';
  const vendorLogo = video.vendor?.logo || '/natakahii-logo.png';
  const effectivePrice = video.product?.effective_price || video.product?.price || 0;

  return (
    <div
      id={`video-${video.id}`}
      className="relative w-full aspect-[9/16] rounded-[24px] overflow-hidden bg-black group cursor-pointer shadow-[var(--shadow-level-2)] hover:shadow-[var(--shadow-level-3)] transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 z-0">
        {video.file_path ? (
          <video
            ref={videoRef}
            src={video.file_path}
            className={`w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-90'}`}
            loop
            playsInline
            muted={isMuted}
            preload="metadata"
          />
        ) : (
          <ImageWithFallback src={primaryImage} alt={video.product?.name || 'Video'} className={`w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-80' : 'opacity-100'}`} />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none" />

      {/* Action Buttons */}
      <div className={`absolute top-4 right-4 z-20 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={handleLike}
          className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${
            video.is_liked_by_user ? 'bg-red-500/40 text-red-500' : 'bg-black/40 text-white hover:bg-white/20'
          }`}
        >
          <Heart className={`w-5 h-5 ${video.is_liked_by_user ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={handleToggleMute}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Play Icon - Only visible when NOT hovered and not playing */}
      <div className={`absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300 ${isHovered || isPlaying ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Play className="w-6 h-6 text-white fill-white ml-1" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 z-30">
        {/* Vendor Info */}
        <button
          onClick={handleVendorClick}
          className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity text-left"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/50">
            <ImageWithFallback src={vendorLogo} alt={video.vendor?.shop_name || 'Vendor'} className="w-full h-full object-cover" />
          </div>
          <span className="text-[14px] font-bold text-white shadow-sm">{video.vendor?.shop_name || 'Unknown'}</span>
        </button>

        <h3 className="text-[16px] font-semibold text-white leading-tight mb-4 line-clamp-2 shadow-sm">
          {video.product?.name || video.title || 'Product Video'}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-[18px] font-black text-[var(--color-accent)] drop-shadow-md">
            {formatCurrency(effectivePrice)}
          </span>
          <Button
            onClick={handleShopClick}
            variant="primary"
            size="s"
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] border-none text-white rounded-full"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Shop Now
          </Button>
        </div>
      </div>
    </div>
  );
}
