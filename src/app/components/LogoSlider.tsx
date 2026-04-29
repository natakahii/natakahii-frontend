import { useRef, useEffect, useState, useCallback } from 'react';

interface LogoSliderProps {
  logos: string[];
  duration?: number;
  gap?: string;
  showGradient?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}

export function LogoSlider({
  logos,
  duration = 20,
  gap = 'gap-8',
  showGradient = true,
  pauseOnHover = true,
  className = '',
}: LogoSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const sequenceWidthRef = useRef(0);
  const isPausedRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...logos, ...logos];

  // Calculate pixels per second based on sequence width and duration
  const getPixelsPerSecond = useCallback(() => {
    if (sequenceWidthRef.current <= 0 || duration <= 0) return 0;
    return sequenceWidthRef.current / duration;
  }, [duration]);

  // Measure width with Math.round to avoid subpixel rounding issues
  const measureWidth = useCallback(() => {
    if (trackRef.current) {
      const fullWidth = trackRef.current.scrollWidth;
      const exactWidth = Math.round(fullWidth / 2);
      sequenceWidthRef.current = exactWidth;
      setIsReady(true);
    }
  }, []);

  // Animation loop using requestAnimationFrame
  const animate = useCallback((timestamp: number) => {
    if (isPausedRef.current) {
      lastTimeRef.current = timestamp;
      rafIdRef.current = requestAnimationFrame(animate);
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = (timestamp - lastTimeRef.current) / 1000; // Convert to seconds
    lastTimeRef.current = timestamp;

    const pixelsPerSecond = getPixelsPerSecond();
    positionRef.current -= pixelsPerSecond * deltaTime;

    // Reset when we've scrolled one full sequence width
    if (Math.abs(positionRef.current) >= sequenceWidthRef.current) {
      positionRef.current = 0;
    }

    // Apply transform using translate3d for GPU acceleration
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
    }

    rafIdRef.current = requestAnimationFrame(animate);
  }, [getPixelsPerSecond]);

  useEffect(() => {
    // Initial measurement after render
    const timer = setTimeout(measureWidth, 100);

    // Re-measure on resize
    window.addEventListener('resize', measureWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureWidth);
    };
  }, [measureWidth]);

  // Start animation loop when ready
  useEffect(() => {
    if (!isReady || sequenceWidthRef.current <= 0) return;

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isReady, animate]);

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      onMouseEnter={() => pauseOnHover && (isPausedRef.current = true)}
      onMouseLeave={() => pauseOnHover && (isPausedRef.current = false)}
    >
      {/* Left gradient fade */}
      {showGradient && (
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[var(--color-bg-page)] to-transparent z-10 pointer-events-none" />
      )}

      {/* Right gradient fade */}
      {showGradient && (
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[var(--color-bg-page)] to-transparent z-10 pointer-events-none" />
      )}

      {/* Animated slider with GPU acceleration */}
      <div
        ref={trackRef}
        className={`flex ${gap}`}
        style={{
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={index}
            className="flex items-center justify-center flex-shrink-0 w-32 sm:w-40 md:w-48 px-4"
          >
            <img
              src={logo}
              alt="Partner Logo"
              className="h-8 sm:h-10 md:h-12 w-auto object-contain opacity-100"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
