import React from 'react';
import { Loader2 } from 'lucide-react';
import { ICON_SIZES, BUTTON_PADDING, GAP_CLASSES, RADIUS_CLASSES } from '../../constants/designTokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  enablePressFeedback?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    enablePressFeedback = true,
    className = '',
    disabled,
    ...props
  }, ref) => {
  const baseStyles = `inline-flex items-center justify-center font-bold transition-all duration-150 ${RADIUS_CLASSES.lg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed`;
  
  // Add press feedback animation class
  const pressFeedbackClass = enablePressFeedback && !disabled && !isLoading
    ? 'active:scale-[0.97] active:transform' 
    : '';
  
  const variantStyles = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500 border border-transparent',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500 border border-slate-600',
    outline: 'bg-transparent hover:bg-slate-800 text-slate-300 focus:ring-slate-500 border border-slate-600 hover:border-slate-500',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 focus:ring-slate-500 border border-transparent',
    danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500 border border-transparent',
  };
  
  const sizeStyles = {
    sm: `${BUTTON_PADDING.xs} text-xs ${GAP_CLASSES.xs}`,
    md: `${BUTTON_PADDING.sm} text-sm ${GAP_CLASSES.sm}`,
    lg: `${BUTTON_PADDING.md} text-base gap-2.5`,
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const combinedClasses = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    pressFeedbackClass,
    widthClass,
    className,
  ].join(' ');
  
  return (
    <button
      ref={ref}
      className={combinedClasses}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-live="polite"
      aria-label={isLoading ? `${loadingText || 'Loading'}... ${props['aria-label'] || ''}`.trim() : props['aria-label']}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className={`${ICON_SIZES.md} animate-spin`} aria-hidden="true" />
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
