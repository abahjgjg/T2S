/**
 * Font Configuration
 * Centralized font size values for consistent typography
 * Flexy: Eliminates hardcoded font sizes like text-[10px]
 * All values can be overridden via environment variables.
 */

import { getEnvNumber } from '../utils/envUtils';

// Font size configurations (in pixels)
export const FONT_SIZES = {
  // Extra small sizes
  xxs: getEnvNumber('VITE_FONT_SIZE_XXS', 8),
  xs: getEnvNumber('VITE_FONT_SIZE_XS', 10),
  sm: getEnvNumber('VITE_FONT_SIZE_SM', 12),
  
  // Standard sizes
  base: getEnvNumber('VITE_FONT_SIZE_BASE', 14),
  md: getEnvNumber('VITE_FONT_SIZE_MD', 16),
  lg: getEnvNumber('VITE_FONT_SIZE_LG', 18),
  
  // Large sizes
  xl: getEnvNumber('VITE_FONT_SIZE_XL', 20),
  xxl: getEnvNumber('VITE_FONT_SIZE_XXL', 24),
} as const;

// CSS class builders for Tailwind font sizes
export const FONT_SIZE_CLASSES = {
  xxs: `text-[${FONT_SIZES.xxs}px]`,
  xs: `text-[${FONT_SIZES.xs}px]`,
  sm: `text-[${FONT_SIZES.sm}px]`,
  base: `text-[${FONT_SIZES.base}px]`,
  md: `text-[${FONT_SIZES.md}px]`,
  lg: `text-[${FONT_SIZES.lg}px]`,
  xl: `text-[${FONT_SIZES.xl}px]`,
  xxl: `text-[${FONT_SIZES.xxl}px]`,
} as const;

// Semantic font size mapping
export const TYPOGRAPHY = {
  // Labels and badges
  label: FONT_SIZE_CLASSES.xs,
  badge: FONT_SIZE_CLASSES.xs,
  tag: FONT_SIZE_CLASSES.xs,
  
  // Helper text
  helper: FONT_SIZE_CLASSES.xs,
  caption: FONT_SIZE_CLASSES.xs,
  hint: FONT_SIZE_CLASSES.sm,
  
  // Navigation
  nav: FONT_SIZE_CLASSES.sm,
  breadcrumb: FONT_SIZE_CLASSES.sm,
  
  // Content
  body: FONT_SIZE_CLASSES.base,
  paragraph: FONT_SIZE_CLASSES.md,
  
  // Special
  ticker: FONT_SIZE_CLASSES.xs,
  timestamp: FONT_SIZE_CLASSES.xs,
  code: FONT_SIZE_CLASSES.sm,
  mono: FONT_SIZE_CLASSES.sm,
} as const;

export type FontSizes = typeof FONT_SIZES;
export type Typography = typeof TYPOGRAPHY;

export default {
  FONT_SIZES,
  FONT_SIZE_CLASSES,
  TYPOGRAPHY,
};
