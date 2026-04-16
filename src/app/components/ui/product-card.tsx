import { useState } from "react";
import { Link } from "react-router";
import { motion, useAnimationControls } from "motion/react";
import { Heart, ShoppingCart, Star, CheckCircle } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ProductCardProps {
  product: {
    id: string | number;
    title: string;
    vendor?: string;
    price: string | number;
    rating?: number;
    img: string;
  };
  onAddToCart?: (e: React.MouseEvent) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const heartControls = useAnimationControls();
  const cartControls = useAnimationControls();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (!isLiked) {
      await heartControls.start({ scale: [1, 1.3, 0.9, 1.1, 1], transition: { duration: 0.4 } });
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) onAddToCart(e);
    await cartControls.start({ y: [0, -10, 0], scale: [1, 1.2, 1], transition: { duration: 0.3 } });
  };

  return (
    <Link to={`/product/${product.id}`} className="block h-full">
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2, ease: "easeOut" } }}
        className="h-full"
      >
        <Card className="group cursor-pointer hover:shadow-[var(--shadow-level-2)] transition-shadow h-full flex flex-col border border-[var(--color-border)]/60">
          <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-card)] rounded-t-[16px]">
            <ImageWithFallback 
              src={product.img} 
              alt={product.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
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
              {product.vendor && (
                <span className="truncate flex items-center gap-1">
                  {product.vendor}
                  <CheckCircle className="w-3 h-3 text-[var(--color-primary)] inline" />
                </span>
              )}
              {product.rating && (
                <span className="flex items-center gap-1 text-[var(--color-text-heading)] font-medium">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {product.rating}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-[14px] text-[var(--color-text-heading)] line-clamp-2 mb-2 group-hover:text-[var(--color-primary)] transition-colors">
              {product.title}
            </h3>
            <div className="mt-auto flex items-end justify-between relative">
              <div className="text-[18px] font-bold text-[var(--color-accent)] tracking-tight">
                {typeof product.price === 'number' ? `KES ${product.price.toLocaleString()}` : product.price}
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