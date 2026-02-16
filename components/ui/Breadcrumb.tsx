import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronRight, MoreHorizontal, Home } from 'lucide-react';
import { ANIMATION_TIMING, ANIMATION_EASING } from '../../constants/uiConfig';
import { ICON_SIZES } from '../../constants/designTokens';

export interface BreadcrumbItem {
  /** Unique identifier for the item */
  id: string;
  /** Display label */
  label: string;
  /** URL to navigate to (if clickable) */
  href?: string;
  /** Whether this item is the current/active page */
  isCurrent?: boolean;
  /** Icon to display before label */
  icon?: React.ReactNode;
  /** Callback when item is clicked */
  onClick?: () => void;
}

export interface BreadcrumbProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Additional CSS classes */
  className?: string;
  /** Maximum number of items to show before collapsing (default: 4) */
  maxItems?: number;
  /** Whether to show the home icon as first item */
  showHomeIcon?: boolean;
  /** Custom separator between items */
  separator?: React.ReactNode;
  /** ARIA label for the navigation */
  ariaLabel?: string;
}

/**
 * Breadcrumb - A delightful navigation component with micro-UX enhancements
 * 
 * Features:
 * - Keyboard navigation (Arrow keys, Home, End)
 * - Smooth hover animations with scale effect
 * - Auto-collapse on mobile with dropdown menu
 * - Clear focus indicators for accessibility
 * - Home icon integration
 * - Smooth transitions between states
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = '',
  maxItems = 4,
  showHomeIcon = true,
  separator = <ChevronRight className={ICON_SIZES.sm} />,
  ariaLabel = 'Breadcrumb navigation',
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter out invalid items and add home if needed
  const validItems = items.filter(item => item && item.label);
  
  // Determine if we need to collapse items
  const shouldCollapse = validItems.length > maxItems;
  const visibleItems = shouldCollapse
    ? [
        validItems[0], // First item
        { id: 'ellipsis', label: '...', isEllipsis: true } as BreadcrumbItem,
        ...validItems.slice(-2), // Last two items
      ]
    : validItems;

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const focusableCount = visibleItems.length;
    
    switch (e.key) {
      case 'ArrowRight': {
        e.preventDefault();
        const nextIndex = index < focusableCount - 1 ? index + 1 : 0;
        setFocusedIndex(nextIndex);
        itemRefs.current[nextIndex]?.focus();
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : focusableCount - 1;
        setFocusedIndex(prevIndex);
        itemRefs.current[prevIndex]?.focus();
        break;
      }
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        itemRefs.current[0]?.focus();
        break;
      case 'End': {
        e.preventDefault();
        const lastIndex = focusableCount - 1;
        setFocusedIndex(lastIndex);
        itemRefs.current[lastIndex]?.focus();
        break;
      }
      case 'Escape':
        if (isDropdownOpen) {
          e.preventDefault();
          setIsDropdownOpen(false);
        }
        break;
    }
  }, [visibleItems.length, isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Get collapsed items for dropdown
  const getCollapsedItems = () => {
    if (!shouldCollapse) return [];
    return validItems.slice(1, -2);
  };

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if ('isEllipsis' in item && item.isEllipsis) {
      setIsDropdownOpen(!isDropdownOpen);
      setFocusedIndex(index);
    } else {
      item.onClick?.();
      setFocusedIndex(index);
    }
  };

  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number) => {
    const isEllipsis = 'isEllipsis' in item && item.isEllipsis;
    const isLast = index === visibleItems.length - 1;
    const isFirst = index === 0;
    
    const baseClasses = `
      inline-flex items-center gap-1.5 px-2 py-1 rounded-lg
      text-sm font-medium transition-all duration-200 ease-out
      ${isLast 
        ? 'text-slate-300 cursor-default' 
        : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 cursor-pointer'
      }
      focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-slate-950
      ${focusedIndex === index ? 'bg-slate-800/30' : ''}
    `;

    const content = (
      <>
        {isFirst && showHomeIcon && !isEllipsis && (
          <Home className={`${ICON_SIZES.sm} opacity-70`} aria-hidden="true" />
        )}
        {item.icon && !isEllipsis && (
          <span className="opacity-70">{item.icon}</span>
        )}
        <span className={isEllipsis ? 'px-1' : ''}>
          {isEllipsis ? <MoreHorizontal className={ICON_SIZES.sm} /> : item.label}
        </span>
      </>
    );

    if (isEllipsis) {
      return (
        <div key={item.id} className="relative" ref={dropdownRef}>
          <button
            ref={el => { itemRefs.current[index] = el; }}
            onClick={() => handleItemClick(item, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={baseClasses}
            aria-haspopup="menu"
            aria-expanded={isDropdownOpen}
            aria-label="Show more navigation items"
          >
            {content}
          </button>
          
          {/* Dropdown for collapsed items */}
          {isDropdownOpen && (
            <div 
              className={`
                absolute top-full left-0 mt-1 min-w-[160px]
                bg-slate-900 border border-slate-700 rounded-lg shadow-xl
                py-1 z-50
                animate-[fadeIn_${ANIMATION_TIMING.FADE_FAST}s_${ANIMATION_EASING.DEFAULT}]
              `}
              role="menu"
            >
              {getCollapsedItems().map((collapsedItem, collapsedIndex) => (
                <button
                  key={collapsedItem.id}
                  onClick={() => {
                    collapsedItem.onClick?.();
                    setIsDropdownOpen(false);
                  }}
                  className="
                    w-full text-left px-3 py-2 text-sm text-slate-300
                    hover:bg-slate-800 hover:text-emerald-400
                    transition-colors duration-150
                    focus:outline-none focus:bg-slate-800 focus:text-emerald-400
                  "
                  role="menuitem"
                >
                  <span className="flex items-center gap-2">
                    {collapsedItem.icon}
                    {collapsedItem.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (item.href && !item.isCurrent) {
      return (
        <a
          key={item.id}
          ref={el => { itemRefs.current[index] = el; }}
          href={item.href}
          onClick={() => handleItemClick(item, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={baseClasses}
          aria-current={item.isCurrent ? 'page' : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        key={item.id}
        ref={el => { itemRefs.current[index] = el; }}
        onClick={() => handleItemClick(item, index)}
        onKeyDown={(e) => handleKeyDown(e, index)}
        className={baseClasses}
        disabled={item.isCurrent}
        aria-current={item.isCurrent ? 'page' : undefined}
      >
        {content}
      </button>
    );
  };

  if (validItems.length === 0) return null;

  return (
    <nav 
      ref={containerRef}
      aria-label={ariaLabel}
      className={`w-full ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {visibleItems.map((item, index) => (
          <li key={item.id} className="flex items-center">
            {index > 0 && (
              <span 
                className="mx-1 text-slate-600 flex items-center"
                aria-hidden="true"
              >
                {separator}
              </span>
            )}
            {renderBreadcrumbItem(item, index)}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
