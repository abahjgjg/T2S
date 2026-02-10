import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboardUtils';
import { UI_TIMING } from '../../constants/uiConfig';

export interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'ghost' | 'subtle';
  /** Show inline "Copied!" label next to icon */
  showLabel?: boolean;
  /** Custom aria-label for accessibility */
  ariaLabel?: string;
  /** Custom tooltip text (visible on hover) */
  tooltip?: string;
  /** Additional CSS classes */
  className?: string;
  /** Callback fired when copy succeeds */
  onCopy?: () => void;
  /** Whether button is initially visible (for hover-reveal patterns) */
  revealOnHover?: boolean;
}

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

const variantStyles = {
  default: 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700',
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200',
  subtle: 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200',
};

/**
 * CopyButton - A delightful micro-UX component for clipboard operations
 * 
 * Features:
 * - Smooth icon morphing animation (Copy → Check)
 * - Subtle scale pulse on successful copy
 * - Optional inline "Copied!" label
 * - Accessible with proper ARIA attributes
 * - Respects reduced motion preferences
 */
export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  size = 'md',
  variant = 'default',
  showLabel = false,
  ariaLabel = 'Copy to clipboard',
  tooltip,
  className = '',
  onCopy,
  revealOnHover = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(text, { showToast: !showLabel });
    
    if (success) {
      setCopied(true);
      onCopy?.();
      
      setTimeout(() => {
        setCopied(false);
      }, UI_TIMING.COPY_FEEDBACK_DURATION);
    }
  }, [text, showLabel, onCopy]);

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-lg font-medium
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
    active:scale-[0.95]
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${revealOnHover ? 'opacity-0 group-hover:opacity-100 focus:opacity-100' : ''}
    ${className}
  `;

  const iconClasses = `
    ${iconSizes[size]}
    transition-all duration-300 ease-spring
    ${copied ? 'scale-110' : 'scale-100'}
  `;

  const labelClasses = `
    ml-1.5 text-sm font-medium
    transition-all duration-200
    ${copied ? 'text-emerald-400 opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}
  `;

  return (
    <button
      onClick={handleCopy}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={baseClasses}
      aria-label={ariaLabel}
      aria-live="polite"
      aria-atomic="true"
      title={tooltip || ariaLabel}
    >
      <span className="relative flex items-center justify-center">
        {/* Copy Icon */}
        <Copy
          className={`${iconClasses} absolute inset-0 transition-all duration-200 ${
            copied ? 'opacity-0 rotate-12 scale-50' : 'opacity-100 rotate-0 scale-100'
          }`}
          aria-hidden={copied}
        />
        
        {/* Check Icon */}
        <Check
          className={`${iconClasses} text-emerald-400 transition-all duration-200 ${
            copied ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-12 scale-50'
          }`}
          aria-hidden={!copied}
        />
      </span>
      
      {/* Inline Label */}
      {showLabel && (
        <span className={labelClasses} aria-hidden={!copied}>
          Copied!
        </span>
      )}
      
      {/* Visually hidden status for screen readers */}
      <span className="sr-only" role="status">
        {copied ? 'Copied to clipboard' : ariaLabel}
      </span>
    </button>
  );
};

export default CopyButton;
