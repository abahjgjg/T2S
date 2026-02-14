import React, { useState, useEffect, useRef } from 'react';
import { ANIMATION_DURATION } from '../../constants/animationConfig';

interface AnimatedCharacterCountProps {
  /** Current character count */
  count: number;
  /** Maximum allowed characters */
  maxLength: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AnimatedCharacterCount - A delightful micro-UX component for character counting
 * 
 * Features:
 * - Smooth number transitions when count changes
 * - Color gradient from neutral → warning → danger as limit approaches
 * - Subtle scale pulse when approaching limit (90%+)
 * - Respects reduced motion preferences
 * - Screen reader friendly with live region
 * 
 * @example
 * <AnimatedCharacterCount count={45} maxLength={100} />
 */
export const AnimatedCharacterCount: React.FC<AnimatedCharacterCountProps> = ({
  count,
  maxLength,
  className = '',
}) => {
  const [displayCount, setDisplayCount] = useState(count);
  const [isPulsing, setIsPulsing] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const targetRef = useRef(count);
  const startTimeRef = useRef<number | undefined>(undefined);
  const startValueRef = useRef(count);

  const percentage = (count / maxLength) * 100;
  const isNearLimit = percentage >= 90;
  const isAtLimit = count >= maxLength;

  // Get color based on percentage
  const getColorClass = () => {
    if (isAtLimit) return 'text-red-400';
    if (isNearLimit) return 'text-amber-400';
    return 'text-slate-500';
  };

  // Smooth number animation using requestAnimationFrame
  useEffect(() => {
    // Skip animation if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setDisplayCount(count);
      return;
    }

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    targetRef.current = count;
    startValueRef.current = displayCount;
    startTimeRef.current = undefined;

    const duration = ANIMATION_DURATION.micro.fast; // 150ms for snappy feel
    const startValue = displayCount;
    const diff = count - startValue;

    // If difference is small or zero, just set directly
    if (Math.abs(diff) <= 1) {
      setDisplayCount(count);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + diff * easeOut);
      
      setDisplayCount(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [count]);

  // Trigger pulse animation when crossing 90% threshold
  useEffect(() => {
    if (isNearLimit && !isPulsing) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), ANIMATION_DURATION.standard.fast);
      return () => clearTimeout(timer);
    }
  }, [isNearLimit, isPulsing]);

  return (
    <span
      className={`
        inline-flex items-center gap-1 text-xs font-medium tabular-nums
        transition-colors duration-200
        ${isPulsing ? 'animate-pulse scale-110' : 'scale-100'}
        ${getColorClass()}
        ${className}
      `}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="transition-transform duration-150">
        {displayCount}
      </span>
      <span className="text-slate-600">/</span>
      <span className="text-slate-600">{maxLength}</span>
      
      {/* Screen reader only text for accessibility */}
      <span className="sr-only">
        {count} of {maxLength} characters used
        {isAtLimit ? '. Character limit reached.' : isNearLimit ? '. Approaching character limit.' : ''}
      </span>
    </span>
  );
};

export default AnimatedCharacterCount;
