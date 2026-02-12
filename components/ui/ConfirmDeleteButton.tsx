import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { ANIMATION_DURATION } from '../../constants/animationConfig';

export interface ConfirmDeleteButtonProps {
  /** Callback when deletion is confirmed */
  onDelete: () => void;
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Accessibility label */
  ariaLabel?: string;
  /** Whether the button is in a pending/loading state */
  isPending?: boolean;
  /** Custom confirmation delay in ms (default: 800ms) */
  confirmationDelay?: number;
  /** Custom tooltip text for initial state */
  tooltipText?: string;
}

/**
 * ConfirmDeleteButton - A micro-UX component that prevents accidental deletions
 * 
 * Features:
 * - Hover-to-confirm pattern: requires holding hover for specified duration
 * - Visual progress indicator showing confirmation progress
 * - Smooth icon morphing (Trash → AlertTriangle → X)
 * - Accessible with proper ARIA attributes and announcements
 * - Respects reduced motion preferences
 * - Keyboard accessible (Enter/Space to activate)
 */
export const ConfirmDeleteButton: React.FC<ConfirmDeleteButtonProps> = ({
  onDelete,
  size = 'md',
  className = '',
  ariaLabel = 'Delete project',
  isPending = false,
  confirmationDelay = 800,
  tooltipText = 'Hold to delete',
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const progressRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useRef<boolean>(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;
    
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const startConfirmation = useCallback(() => {
    if (isPending || isCompleted) return;
    
    setIsConfirming(true);
    setShowTooltip(true);
    startTimeRef.current = Date.now();
    progressRef.current = 0;
    
    if (prefersReducedMotion.current) {
      // For reduced motion, just wait the delay then complete
      setTimeout(() => {
        setProgress(100);
        setIsCompleted(true);
        setIsConfirming(false);
      }, confirmationDelay);
      return;
    }
    
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / confirmationDelay) * 100, 100);
      
      setProgress(newProgress);
      progressRef.current = newProgress;
      
      if (newProgress < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsCompleted(true);
        setIsConfirming(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [isPending, isCompleted, confirmationDelay]);

  const cancelConfirmation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (!isCompleted) {
      setIsConfirming(false);
      setProgress(0);
      progressRef.current = 0;
    }
    setShowTooltip(false);
  }, [isCompleted]);

  const handleDelete = useCallback(() => {
    if (isCompleted) {
      onDelete();
      // Reset after a short delay to allow the action to complete
      setTimeout(() => {
        setIsCompleted(false);
        setProgress(0);
        setIsConfirming(false);
      }, 150);
    }
  }, [isCompleted, onDelete]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isCompleted) {
        handleDelete();
      } else if (!isConfirming) {
        startConfirmation();
      }
    } else if (e.key === 'Escape' && isConfirming) {
      cancelConfirmation();
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const sizeStyles = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const getButtonStyles = () => {
    const baseStyles = `
      relative overflow-hidden
      rounded-lg font-medium
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
      disabled:opacity-50 disabled:cursor-not-allowed
      ${sizeStyles[size]}
    `;

    if (isCompleted) {
      return `${baseStyles} bg-red-600 hover:bg-red-500 text-white border border-red-500 focus:ring-red-500 scale-110`;
    }
    
    if (isConfirming) {
      return `${baseStyles} bg-red-900/30 text-red-400 border border-red-500/50 focus:ring-red-500`;
    }
    
    return `${baseStyles} text-slate-500 hover:text-red-400 border border-transparent hover:border-red-500/20 hover:bg-red-500/10 focus:ring-red-500/50`;
  };

  const getIcon = () => {
    if (isCompleted) {
      return <X className={`${iconSizes[size]} animate-[fadeIn_0.15s_ease-out]`} aria-hidden="true" />;
    }
    
    if (isConfirming) {
      return <AlertTriangle className={`${iconSizes[size]} animate-[pulse_0.5s_ease-in-out_infinite]`} aria-hidden="true" />;
    }
    
    return <Trash2 className={iconSizes[size]} aria-hidden="true" />;
  };

  const getTooltipContent = () => {
    if (isCompleted) return 'Release to confirm deletion';
    if (isConfirming) return 'Keep holding...';
    return tooltipText;
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        onMouseEnter={startConfirmation}
        onMouseLeave={() => {
          cancelConfirmation();
          handleDelete();
        }}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => {
          cancelConfirmation();
          setShowTooltip(false);
        }}
        onKeyDown={handleKeyDown}
        onClick={(e) => {
          // Prevent default click behavior - we use hover pattern
          e.preventDefault();
          if (isCompleted) {
            handleDelete();
          }
        }}
        disabled={isPending}
        className={`${getButtonStyles()} ${className}`}
        aria-label={isCompleted ? 'Release to confirm deletion' : ariaLabel}
        aria-live="polite"
        aria-atomic="true"
        aria-describedby={isConfirming ? 'delete-confirmation-progress' : undefined}
        role="button"
      >
        {/* Progress ring background */}
        {isConfirming && (
          <>
            {/* SVG Circular Progress */}
            <svg 
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-red-500/20"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${progress * 2.83} 283`}
                className="text-red-500 transition-all duration-75"
              />
            </svg>
            
            {/* Screen reader progress announcement */}
            <span id="delete-confirmation-progress" className="sr-only" role="status">
              Deletion confirmation in progress: {Math.round(progress)}%
            </span>
          </>
        )}
        
        {/* Icon container */}
        <span className="relative z-10 flex items-center justify-center">
          {isPending ? (
            <svg 
              className={`${iconSizes[size]} animate-spin text-slate-400`} 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            getIcon()
          )}
        </span>
      </button>
      
      {/* Tooltip */}
      {showTooltip && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-slate-200 text-[10px] font-medium rounded shadow-lg border border-slate-700 whitespace-nowrap pointer-events-none animate-[fadeIn_0.15s_ease-out] z-50"
          role="tooltip"
        >
          {getTooltipContent()}
          {/* Tooltip arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-800" aria-hidden="true" />
        </div>
      )}
      
      {/* Visually hidden live region for status updates */}
      <span className="sr-only" role="status" aria-live="polite">
        {isCompleted ? 'Ready to delete. Release mouse button to confirm.' : ''}
      </span>
    </div>
  );
};

export default ConfirmDeleteButton;
