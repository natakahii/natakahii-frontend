import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart } from "lucide-react";
import { Button } from "./button";

export function FloatingCart({ onAddToCart, price }: { onAddToCart: () => void, price: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past the main add to cart button (approx 600px)
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+70px)] left-0 right-0 p-4 md:hidden z-40 pointer-events-none"
        >
          <div className="bg-white rounded-[16px] shadow-[var(--shadow-level-2)] border border-[var(--color-border)] p-3 flex justify-between items-center pointer-events-auto">
            <div className="font-bold text-[16px] text-[var(--color-accent)]">{price}</div>
            <Button onClick={onAddToCart} className="rounded-full px-6 flex items-center gap-2 shadow-sm">
              <ShoppingCart className="w-4 h-4" />
              Add
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}