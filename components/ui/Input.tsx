import React, { useState, useRef } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  clearable?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
  containerClassName?: string;
  labelClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    success = false,
    leftIcon,
    rightIcon,
    helperText,
    clearable = false,
    showCharacterCount = false,
    maxLength,
    containerClassName = '',
    labelClassName = '',
    className = '',
    value,
    onChange,
    onFocus,
    onBlur,
    disabled,
    id,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const hasSuccess = success && !hasError;
    const characterCount = typeof value === 'string' ? value.length : 0;
    const isClearable = clearable && !!value && !disabled;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleClear = () => {
      if (inputRef.current) {
        const input = inputRef.current;
        const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        if (descriptor && descriptor.set) {
          descriptor.set.call(input, '');
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
      }
    };

    // Container styles
    const containerStyles = [
      'relative flex items-center w-full',
      'bg-slate-950 rounded-lg transition-all duration-150',
      'border',
      hasError 
        ? 'border-red-500 shadow-sm shadow-red-500/20' 
        : hasSuccess 
          ? 'border-emerald-500 shadow-sm shadow-emerald-500/20'
          : isFocused 
            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
            : isHovered 
              ? 'border-slate-500'
              : 'border-slate-700',
      disabled && 'opacity-50 cursor-not-allowed bg-slate-900',
      containerClassName,
    ].join(' ');

    // Input styles
    const inputStyles = [
      'w-full bg-transparent text-white placeholder-slate-500',
      'focus:outline-none',
      'disabled:cursor-not-allowed',
      leftIcon ? 'pl-10' : 'pl-4',
      (isClearable || rightIcon || hasSuccess) ? 'pr-10' : 'pr-4',
      'py-2.5 text-sm',
      className,
    ].join(' ');

    // Label styles
    const labelStyles = [
      'block text-xs font-bold uppercase tracking-wider mb-1.5',
      hasError ? 'text-red-400' : 'text-slate-500',
      labelClassName,
    ].join(' ');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
          </label>
        )}
        
        <div
          className={containerStyles}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {leftIcon && (
            <div className="absolute left-3 text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={(node) => {
              // Handle both refs
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
              }
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }}
            id={inputId}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            maxLength={maxLength}
            className={inputStyles}
            aria-invalid={hasError}
            aria-describedby={
              [
                helperText && !hasError ? `${inputId}-helper` : null,
                hasError ? `${inputId}-error` : null,
                showCharacterCount ? `${inputId}-count` : null,
              ].filter(Boolean).join(' ') || undefined
            }
            {...props}
          />
          
          {/* Right side icons */}
          <div className="absolute right-3 flex items-center gap-1.5">
            {hasSuccess && (
              <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            )}
            
            {!hasSuccess && rightIcon && (
              <div className="text-slate-500">
                {rightIcon}
              </div>
            )}
            
            {isClearable && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 rounded-full hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Clear input"
                tabIndex={-1}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Helper text, error, or character count */}
        <div className="flex items-start justify-between mt-1.5 min-h-[1.25rem]">
          <div className="flex-1">
            {hasError ? (
              <p
                id={`${inputId}-error`}
                className="text-xs text-red-400 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="w-3 h-3 shrink-0" />
                {error}
              </p>
            ) : helperText ? (
              <p
                id={`${inputId}-helper`}
                className="text-xs text-slate-500"
              >
                {helperText}
              </p>
            ) : null}
          </div>
          
          {showCharacterCount && maxLength && (
            <p
              id={`${inputId}-count`}
              className={`text-xs ml-2 shrink-0 ${
                characterCount >= maxLength 
                  ? 'text-red-400' 
                  : characterCount >= maxLength * 0.9 
                    ? 'text-yellow-400' 
                    : 'text-slate-500'
              }`}
            >
              {characterCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
