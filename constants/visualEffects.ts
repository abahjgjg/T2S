/**
 * Visual Effects Configuration
 * Flexy: Centralized opacity, scale, transform, and visual effect values
 * All values can be overridden via environment variables.
 */

import { getEnvNumber } from '../utils/envUtils';

// ============================================================================
// OPACITY VALUES (0-100 scale, will be converted to 0-1 in usage)
// ============================================================================

export const OPACITY = {
  // Hidden/transparent states
  hidden: {
    none: getEnvNumber('VITE_OPACITY_NONE', 0),
    subtle: getEnvNumber('VITE_OPACITY_SUBTLE', 5),
  },
  // Low visibility states
  low: {
    minimal: getEnvNumber('VITE_OPACITY_MINIMAL', 10),
    light: getEnvNumber('VITE_OPACITY_LIGHT', 20),
    medium: getEnvNumber('VITE_OPACITY_MEDIUM', 30),
  },
  // Medium visibility states
  medium: {
    soft: getEnvNumber('VITE_OPACITY_SOFT', 40),
    half: getEnvNumber('VITE_OPACITY_HALF', 50),
    bright: getEnvNumber('VITE_OPACITY_BRIGHT', 60),
  },
  // High visibility states
  high: {
    strong: getEnvNumber('VITE_OPACITY_STRONG', 75),
    nearFull: getEnvNumber('VITE_OPACITY_NEAR_FULL', 90),
    full: getEnvNumber('VITE_OPACITY_FULL', 100),
  },
  // State-specific opacities
  states: {
    disabled: getEnvNumber('VITE_OPACITY_DISABLED', 30),
    placeholder: getEnvNumber('VITE_OPACITY_PLACEHOLDER', 50),
    hover: getEnvNumber('VITE_OPACITY_HOVER', 60),
    focus: getEnvNumber('VITE_OPACITY_FOCUS', 100),
  },
} as const;

// ============================================================================
// SCALE TRANSFORM VALUES (percentage, 100 = normal size)
// ============================================================================

export const SCALE = {
  // Shrink values
  shrink: {
    tiny: getEnvNumber('VITE_SCALE_SHRINK_TINY', 95),      // 0.95
    small: getEnvNumber('VITE_SCALE_SHRINK_SMALL', 97),    // 0.97
    medium: getEnvNumber('VITE_SCALE_SHRINK_MEDIUM', 98),  // 0.98
  },
  // Normal
  normal: getEnvNumber('VITE_SCALE_NORMAL', 100),          // 1.0
  // Grow values
  grow: {
    small: getEnvNumber('VITE_SCALE_GROW_SMALL', 105),     // 1.05
    medium: getEnvNumber('VITE_SCALE_GROW_MEDIUM', 110),   // 1.10
    large: getEnvNumber('VITE_SCALE_GROW_LARGE', 125),     // 1.25
  },
  // Interactive states
  interactive: {
    active: getEnvNumber('VITE_SCALE_ACTIVE', 97),
    hover: getEnvNumber('VITE_SCALE_HOVER', 105),
    pressed: getEnvNumber('VITE_SCALE_PRESSED', 95),
  },
} as const;

// ============================================================================
// BLUR EFFECT VALUES (in pixels)
// ============================================================================

export const BLUR = {
  none: getEnvNumber('VITE_BLUR_NONE', 0),
  minimal: getEnvNumber('VITE_BLUR_MINIMAL', 4),
  small: getEnvNumber('VITE_BLUR_SMALL', 8),
  medium: getEnvNumber('VITE_BLUR_MEDIUM', 12),
  large: getEnvNumber('VITE_BLUR_LARGE', 16),
  xl: getEnvNumber('VITE_BLUR_XL', 24),
} as const;

// ============================================================================
// SHADOW OFFSET AND SPREAD
// ============================================================================

export const SHADOW_OFFSET = {
  none: getEnvNumber('VITE_SHADOW_OFFSET_NONE', 0),
  small: getEnvNumber('VITE_SHADOW_OFFSET_SMALL', 2),
  medium: getEnvNumber('VITE_SHADOW_OFFSET_MEDIUM', 4),
  large: getEnvNumber('VITE_SHADOW_OFFSET_LARGE', 8),
  xl: getEnvNumber('VITE_SHADOW_OFFSET_XL', 15),
} as const;

export const SHADOW_SPREAD = {
  none: getEnvNumber('VITE_SHADOW_SPREAD_NONE', 0),
  small: getEnvNumber('VITE_SHADOW_SPREAD_SMALL', -2),
  medium: getEnvNumber('VITE_SHADOW_SPREAD_MEDIUM', -3),
  large: getEnvNumber('VITE_SHADOW_SPREAD_LARGE', -5),
} as const;

// ============================================================================
// GRADIENT OPACITY STOPPING POINTS
// ============================================================================

export const GRADIENT_STOPS = {
  from: {
    transparent: getEnvNumber('VITE_GRADIENT_FROM_TRANSPARENT', 0),
    light: getEnvNumber('VITE_GRADIENT_FROM_LIGHT', 50),
  },
  via: {
    transparent: getEnvNumber('VITE_GRADIENT_VIA_TRANSPARENT', 0),
  },
  to: {
    full: getEnvNumber('VITE_GRADIENT_TO_FULL', 100),
  },
} as const;

// ============================================================================
// SCROLL INDICATOR THRESHOLDS
// ============================================================================

export const SCROLL_INDICATOR = {
  progressThreshold: getEnvNumber('VITE_SCROLL_PROGRESS_THRESHOLD', 10),     // 0.1%
  visibilityThreshold: getEnvNumber('VITE_SCROLL_VISIBILITY_THRESHOLD', 50), // 0.5%
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert percentage-based opacity to decimal (0-1)
 * Flexy: Ensures consistent opacity values across components
 */
export const opacityToDecimal = (percentage: number): number => {
  return Math.min(Math.max(percentage / 100, 0), 1);
};

/**
 * Convert percentage-based scale to decimal
 * Flexy: Ensures consistent scale values across components
 */
export const scaleToDecimal = (percentage: number): number => {
  return percentage / 100;
};

/**
 * Get Tailwind opacity class from percentage
 * Flexy: Maps to standard Tailwind opacity classes
 */
export const getTailwindOpacity = (percentage: number): string => {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  return `opacity-${Math.round(clamped)}`;
};

/**
 * Get Tailwind scale class from percentage
 * Flexy: Maps to standard Tailwind scale classes
 */
export const getTailwindScale = (percentage: number): string => {
  return `scale-[${percentage / 100}]`;
};

// Default export
export default {
  OPACITY,
  SCALE,
  BLUR,
  SHADOW_OFFSET,
  SHADOW_SPREAD,
  GRADIENT_STOPS,
  SCROLL_INDICATOR,
  opacityToDecimal,
  scaleToDecimal,
  getTailwindOpacity,
  getTailwindScale,
};
