import React, { useState, useCallback, useRef } from 'react';
import { ANIMATION_DURATION } from '../../constants/animationConfig';
import { COLORS } from '../../constants/theme';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * RippleEffect - A delightful micro-UX component that provides tactile feedback
 * 
 * Features:
 * - Shows a ripple emanating from the exact click/touch point
 * - Automatically calculates ripple size based on element dimensions
 * - Respects reduced motion preferences via CSS media query
 * - Cleans up completed animations automatically
 * - Works with both mouse and touch interactions
 * 
 * Usage:
 * <RippleEffect>
 *   <button>Click me</button>
 * </RippleEffect>
 */
export const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  className = '',
  color = COLORS.ripple.default,
  disabled = false,
  onClick,
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);

  const createRipple = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    
    // Calculate click position relative to the container
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple: Ripple = {
      id: rippleIdRef.current++,
      x,
      y,
      size,
    };

    setRipples(prev => [...prev, newRipple]);

    // Clean up ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, ANIMATION_DURATION.standard.normal);
  }, [disabled]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    createRipple(e);
    onClick?.(e);
  }, [createRipple, onClick]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {children}
      
      {/* Ripple overlays */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
            transform: 'scale(0)',
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
};

export default RippleEffect;
