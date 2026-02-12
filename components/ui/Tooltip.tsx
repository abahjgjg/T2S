import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ANIMATION_TIMING, ANIMATION_EASING } from '../../constants/uiConfig';
import { ANIMATION_DURATION } from '../../constants/animationConfig';
import { Z_INDEX } from '../../constants/zIndex';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = ANIMATION_DURATION.micro.fast, // Faster than native title (which is ~500ms)
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsMounted(true);
      // Small delay to allow mount before animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }, delay);
  }, [delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
    // Wait for animation to finish before unmounting
    setTimeout(() => {
      setIsMounted(false);
    }, ANIMATION_TIMING.FADE_FAST * 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t-transparent border-b-transparent border-r-transparent border-l-slate-800',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-t-transparent border-b-transparent border-l-transparent border-r-slate-800',
  };

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isMounted && (
        <div
          role="tooltip"
          className={`
            absolute ${Z_INDEX.TOAST} px-2.5 py-1.5 
            bg-slate-800 text-slate-200 text-xs font-medium
            rounded-md shadow-lg border border-slate-700
            whitespace-nowrap pointer-events-none
            transition-all ${ANIMATION_TIMING.FADE_FAST}s ${ANIMATION_EASING.DEFAULT}
            ${positionClasses[position]}
            ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
        >
          {content}
          {/* Arrow */}
          <span
            className={`
              absolute w-0 h-0 
              border-4 border-solid
              ${arrowClasses[position]}
            `}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
