import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "motion/react";
import { Loader2 } from "lucide-react";

export function PullToRefresh({ children, onRefresh }: { children: React.ReactNode, onRefresh: () => Promise<void> }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  let startY = 0;
  let isDragging = false;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isDragging = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const y = e.touches[0].clientY;
      const dy = y - startY;

      if (dy > 0 && dy < 150) {
        controls.set({ y: dy * 0.5 });
      }
    };

    const handleTouchEnd = async (e: TouchEvent) => {
      if (!isDragging) return;
      isDragging = false;
      const y = e.changedTouches[0].clientY;
      const dy = y - startY;

      if (dy > 80 && !isRefreshing) {
        setIsRefreshing(true);
        controls.start({ y: 50, transition: { type: "spring", bounce: 0.4 } });
        await onRefresh();
        setIsRefreshing(false);
        controls.start({ y: 0, transition: { type: "spring", bounce: 0.2 } });
      } else {
        controls.start({ y: 0, transition: { type: "spring", bounce: 0.2 } });
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [controls, isRefreshing, onRefresh]);

  return (
    <div ref={containerRef} className="h-full w-full overflow-y-auto relative">
      <motion.div 
        animate={controls}
        className="absolute top-0 left-0 right-0 flex justify-center items-center z-50 pointer-events-none"
        style={{ y: -50 }}
      >
        <div className="bg-white rounded-full p-2 shadow-md">
          <Loader2 className={`w-6 h-6 text-[var(--color-primary)] ${isRefreshing ? "animate-spin" : ""}`} />
        </div>
      </motion.div>
      <motion.div animate={controls} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}