import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Z_INDEX } from '../../constants/zIndex';

/**
 * ScrollProgressIndicator - A delightful micro-UX component that shows reading progress
 * 
 * Features:
 * - Smooth progress tracking with requestAnimationFrame for performance
 * - Gradient color that shifts as you scroll (emerald → blue → purple)
 * - Glow effect that intensifies with scroll progress
 * - Respects reduced motion preferences
 * - Minimal performance impact with passive scroll listeners
 * - Hidden at top of page for clean initial view
 */
interface ScrollProgressIndicatorProps {
  /** Color theme for the progress bar */
  colorScheme?: 'default' | 'emerald' | 'blue' | 'purple';
  /** Height of the progress bar in pixels */
  height?: number;
  /** Whether to show a glow effect */
  showGlow?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const ScrollProgressIndicator: React.FC<ScrollProgressIndicatorProps> = ({
  colorScheme = 'default',
  height = 3,
  showGlow = true,
  className = '',
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);
  const lastScrollRef = useRef(0);

  const calculateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (docHeight <= 0) return 0;
    
    const scrollProgress = (scrollTop / docHeight) * 100;
    return Math.min(100, Math.max(0, scrollProgress));
  }, []);

  const handleScroll = useCallback(() => {
    // Use requestAnimationFrame for smooth updates
    if (rafRef.current) return;
    
    rafRef.current = requestAnimationFrame(() => {
      const newProgress = calculateProgress();
      
      // Only update state if progress changed significantly (0.1% threshold)
      if (Math.abs(newProgress - lastScrollRef.current) > 0.1) {
        setProgress(newProgress);
        lastScrollRef.current = newProgress;
        
        // Show indicator only after some scrolling
        setIsVisible(newProgress > 0.5);
      }
      
      rafRef.current = undefined;
    });
  }, [calculateProgress]);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // For reduced motion, just show a static indicator
      setProgress(calculateProgress());
      setIsVisible(true);
      return;
    }

    // Add scroll listener with passive option for performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll, calculateProgress]);

  // Dynamic gradient based on progress
  const getGradient = () => {
    const baseColors = {
      default: {
        start: 'rgb(16, 185, 129)', // emerald-500
        mid: 'rgb(59, 130, 246)',   // blue-500
        end: 'rgb(168, 85, 247)',   // purple-500
      },
      emerald: {
        start: 'rgb(16, 185, 129)',
        mid: 'rgb(52, 211, 153)',
        end: 'rgb(110, 231, 183)',
      },
      blue: {
        start: 'rgb(59, 130, 246)',
        mid: 'rgb(96, 165, 250)',
        end: 'rgb(147, 197, 253)',
      },
      purple: {
        start: 'rgb(168, 85, 247)',
        mid: 'rgb(192, 132, 252)',
        end: 'rgb(216, 180, 254)',
      },
    };

    const colors = baseColors[colorScheme];
    
    // Shift gradient based on progress
    if (progress < 33) {
      return `linear-gradient(90deg, ${colors.start}, ${colors.mid})`;
    } else if (progress < 66) {
      return `linear-gradient(90deg, ${colors.start}, ${colors.mid}, ${colors.end})`;
    } else {
      return `linear-gradient(90deg, ${colors.mid}, ${colors.end})`;
    }
  };

  // Dynamic glow intensity based on progress
  const getGlowOpacity = () => {
    if (!showGlow) return 0;
    // Glow intensifies as user scrolls
    return Math.min(0.6, progress / 100 + 0.2);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 ${Z_INDEX.TOAST} pointer-events-none transition-opacity duration-300 ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        height: `${height}px`,
      }}
      aria-hidden="true"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    >
      {/* Progress bar */}
      <div
        className="h-full transition-transform duration-150 ease-out will-change-transform"
        style={{
          width: '100%',
          transform: `scaleX(${progress / 100})`,
          transformOrigin: 'left',
          background: getGradient(),
        }}
      />
      
      {/* Glow effect */}
      {showGlow && (
        <div
          className="absolute inset-0 blur-sm transition-opacity duration-300"
          style={{
            background: getGradient(),
            opacity: getGlowOpacity(),
            height: `${height * 3}px`,
            marginTop: `-${height}px`,
          }}
        />
      )}
    </div>
  );
};

export default ScrollProgressIndicator;
