import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useAnimationControls } from "motion/react";
import { Heart, ShoppingCart, Star, CheckCircle, MapPin } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { formatCurrency } from "../../utils/currency";
import { getProductPath } from "../../utils/products";
import { useAuth } from "../../providers/AuthProvider";
import { useToast } from "../../components/ui/toast";
import { likeProduct, unlikeProduct } from "../../services/videoFeedService";
import { CatalogProduct, getProductPrimaryImage } from "../../services/productService";

interface ProductCardProps {
  product: CatalogProduct & { is_liked?: boolean };
  onAddToCart?: (e: React.MouseEvent) => void;
  onLikeToggle?: (isLiked: boolean) => void;
}

export function ProductCard({ product, onAddToCart, onLikeToggle }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(product.is_liked || false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const heartControls = useAnimationControls();
  const cartControls = useAnimationControls();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Build location string from vendor location fields
  const locationText = product.vendor
    ? [product.vendor.street, product.vendor.region, product.vendor.city]
        .filter(Boolean)
        .join(', ')
    : null;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }

    if (isLikeLoading) return;

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);

    if (newIsLiked) {
      await heartControls.start({ scale: [1, 1.3, 0.9, 1.1, 1], transition: { duration: 0.4 } });
    }

    setIsLikeLoading(true);
    try {
      if (newIsLiked) {
        await likeProduct(Number(product.id));
      } else {
        await unlikeProduct(Number(product.id));
      }
      onLikeToggle?.(newIsLiked);
    } catch (err) {
      // Revert on error
      setIsLiked(!newIsLiked);
      toast({ type: 'error', title: 'Failed to update like' });
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) onAddToCart(e);
    await cartControls.start({ y: [0, -10, 0], scale: [1, 1.2, 1], transition: { duration: 0.3 } });
  };

  return (
    <Link to={getProductPath(product)} className="block h-full">
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2, ease: "easeOut" } }}
        className="h-full"
      >
        <Card className="group cursor-pointer hover:shadow-[var(--shadow-level-2)] transition-shadow h-full flex flex-col border border-[var(--color-border)]/60">
          <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-card)] rounded-t-[16px]">
            <ImageWithFallback 
              src={getProductPrimaryImage(product)} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            <button 
              onClick={handleLike}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[var(--color-text-muted)] hover:bg-white transition-all shadow-sm z-10"
            >
              <motion.div animate={heartControls}>
                <Heart 
                  className={`w-4 h-4 ${isLiked ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : 'hover:text-[var(--color-accent)]'}`} 
                />
              </motion.div>
            </button>
          </div>
          <div className="p-4 flex flex-col flex-1">
            <div className="text-[12px] text-[var(--color-text-muted)] mb-1 flex items-center justify-between">
              {product.vendor?.shop_name && (
                <span className="truncate flex items-center gap-1">
                  {product.vendor.shop_name}
                  <CheckCircle className="w-3 h-3 text-[var(--color-primary)] inline" />
                </span>
              )}
              {product.reviews_avg_rating != null && (
                <span className="flex items-center gap-1 text-[var(--color-text-heading)] font-medium">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {product.reviews_avg_rating.toFixed(1)}
                </span>
              )}
            </div>
            {/* Vendor Location */}
            {locationText && (
              <div className="text-[11px] text-[var(--color-text-muted)] mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{locationText}</span>
              </div>
            )}
            <h4 className="text-[13px] font-bold text-[var(--color-text-heading)] truncate group-hover:text-[var(--color-primary)] transition-colors">{product.name}</h4>
            <div className="mt-auto flex items-end justify-between relative">
              <div className="text-[18px] font-bold text-[var(--color-accent)] tracking-tight">
                {formatCurrency(product.effective_price)}
              </div>
              <motion.div animate={cartControls}>
                <Button 
                  onClick={handleAddToCart}
                  variant="primary" 
                  size="xs" 
                  className="w-8 h-8 rounded-full p-0 flex items-center justify-center shadow-sm z-10"
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
