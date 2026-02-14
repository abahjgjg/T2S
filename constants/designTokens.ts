/**
 * Design Tokens Configuration
 * Flexy: Centralized design tokens for consistent UI across the application
 * All spacing, sizing, and visual tokens can be overridden via environment variables.
 */

import { getEnv, getEnvNumber } from '../utils/envUtils';

// ============================================================================
// SPACING TOKENS (in Tailwind spacing units: 0.25rem = 4px)
// ============================================================================

export const SPACING = {
  // Icon sizes
  icon: {
    xs: getEnvNumber('VITE_ICON_SIZE_XS', 12),   // w-3 h-3
    sm: getEnvNumber('VITE_ICON_SIZE_SM', 14),   // w-3.5 h-3.5
    md: getEnvNumber('VITE_ICON_SIZE_MD', 16),   // w-4 h-4
    lg: getEnvNumber('VITE_ICON_SIZE_LG', 20),   // w-5 h-5
    xl: getEnvNumber('VITE_ICON_SIZE_XL', 24),   // w-6 h-6
    '2xl': getEnvNumber('VITE_ICON_SIZE_2XL', 32), // w-8 h-8
    '3xl': getEnvNumber('VITE_ICON_SIZE_3XL', 40), // w-10 h-10
    '4xl': getEnvNumber('VITE_ICON_SIZE_4XL', 48), // w-12 h-12
  },
  
  // Button padding
  button: {
    xs: {
      x: getEnvNumber('VITE_BUTTON_PADDING_XS_X', 2),
      y: getEnvNumber('VITE_BUTTON_PADDING_XS_Y', 1),
    },
    sm: {
      x: getEnvNumber('VITE_BUTTON_PADDING_SM_X', 3),
      y: getEnvNumber('VITE_BUTTON_PADDING_SM_Y', 2),
    },
    md: {
      x: getEnvNumber('VITE_BUTTON_PADDING_MD_X', 4),
      y: getEnvNumber('VITE_BUTTON_PADDING_MD_Y', 2),
    },
    lg: {
      x: getEnvNumber('VITE_BUTTON_PADDING_LG_X', 6),
      y: getEnvNumber('VITE_BUTTON_PADDING_LG_Y', 3),
    },
  },
  
  // Component padding
  padding: {
    xs: getEnvNumber('VITE_PADDING_XS', 1),    // p-1
    sm: getEnvNumber('VITE_PADDING_SM', 2),    // p-2
    md: getEnvNumber('VITE_PADDING_MD', 4),    // p-4
    lg: getEnvNumber('VITE_PADDING_LG', 6),    // p-6
    xl: getEnvNumber('VITE_PADDING_XL', 8),    // p-8
  },
  
  // Gap values
  gap: {
    xs: getEnvNumber('VITE_GAP_XS', 1),    // gap-1
    sm: getEnvNumber('VITE_GAP_SM', 2),    // gap-2
    md: getEnvNumber('VITE_GAP_MD', 3),    // gap-3
    lg: getEnvNumber('VITE_GAP_LG', 4),    // gap-4
    xl: getEnvNumber('VITE_GAP_XL', 6),    // gap-6
  },
  
  // Border radius
  radius: {
    none: getEnv('VITE_RADIUS_NONE', '0'),
    sm: getEnv('VITE_RADIUS_SM', '0.125rem'),    // rounded-sm
    md: getEnv('VITE_RADIUS_MD', '0.375rem'),    // rounded-md
    lg: getEnv('VITE_RADIUS_LG', '0.5rem'),      // rounded-lg
    xl: getEnv('VITE_RADIUS_XL', '0.75rem'),     // rounded-xl
    full: getEnv('VITE_RADIUS_FULL', '9999px'),  // rounded-full
  },
} as const;

// ============================================================================
// TAILWIND CLASS MAPPINGS
// ============================================================================

export const ICON_SIZES = {
  xs: `w-3 h-3`,
  sm: `w-3.5 h-3.5`,
  md: `w-4 h-4`,
  lg: `w-5 h-5`,
  xl: `w-6 h-6`,
  '2xl': `w-8 h-8`,
  '3xl': `w-10 h-10`,
  '4xl': `w-12 h-12`,
} as const;

export const BUTTON_PADDING = {
  xs: 'px-2 py-1',
  sm: 'px-3 py-2',
  md: 'px-4 py-2',
  lg: 'px-6 py-3',
} as const;

export const GAP_CLASSES = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-6',
} as const;

export const PADDING_CLASSES = {
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
} as const;

export const RADIUS_CLASSES = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const SHADOWS = {
  sm: getEnv('VITE_SHADOW_SM', '0 1px 2px 0 rgba(0, 0, 0, 0.05)'),
  md: getEnv('VITE_SHADOW_MD', '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'),
  lg: getEnv('VITE_SHADOW_LG', '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'),
  xl: getEnv('VITE_SHADOW_XL', '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'),
  glow: {
    emerald: getEnv('VITE_SHADOW_GLOW_EMERALD', '0 0 20px rgba(16, 185, 129, 0.3)'),
    blue: getEnv('VITE_SHADOW_GLOW_BLUE', '0 0 20px rgba(59, 130, 246, 0.3)'),
    purple: getEnv('VITE_SHADOW_GLOW_PURPLE', '0 0 20px rgba(139, 92, 246, 0.3)'),
  },
} as const;

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const Z_LAYERS = {
  base: getEnvNumber('VITE_Z_INDEX_BASE', 0),
  dropdown: getEnvNumber('VITE_Z_INDEX_DROPDOWN', 10),
  sticky: getEnvNumber('VITE_Z_INDEX_STICKY', 20),
  fixed: getEnvNumber('VITE_Z_INDEX_FIXED', 30),
  modalBackdrop: getEnvNumber('VITE_Z_INDEX_MODAL_BACKDROP', 40),
  modal: getEnvNumber('VITE_Z_INDEX_MODAL', 50),
  popover: getEnvNumber('VITE_Z_INDEX_POPOVER', 60),
  tooltip: getEnvNumber('VITE_Z_INDEX_TOOLTIP', 70),
  toast: getEnvNumber('VITE_Z_INDEX_TOAST', 80),
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const TYPOGRAPHY = {
  fontSize: {
    '2xs': getEnv('VITE_FONT_SIZE_2XS', '0.625rem'),  // 10px
    xs: getEnv('VITE_FONT_SIZE_XS', '0.75rem'),       // 12px
    sm: getEnv('VITE_FONT_SIZE_SM', '0.875rem'),      // 14px
    base: getEnv('VITE_FONT_SIZE_BASE', '1rem'),      // 16px
    lg: getEnv('VITE_FONT_SIZE_LG', '1.125rem'),      // 18px
    xl: getEnv('VITE_FONT_SIZE_XL', '1.25rem'),       // 20px
    '2xl': getEnv('VITE_FONT_SIZE_2XL', '1.5rem'),    // 24px
  },
  fontWeight: {
    normal: getEnvNumber('VITE_FONT_WEIGHT_NORMAL', 400),
    medium: getEnvNumber('VITE_FONT_WEIGHT_MEDIUM', 500),
    semibold: getEnvNumber('VITE_FONT_WEIGHT_SEMIBOLD', 600),
    bold: getEnvNumber('VITE_FONT_WEIGHT_BOLD', 700),
    black: getEnvNumber('VITE_FONT_WEIGHT_BLACK', 900),
  },
} as const;

// ============================================================================
// TRANSITION TOKENS
// ============================================================================

export const TRANSITIONS = {
  duration: {
    fast: getEnv('VITE_TRANSITION_FAST', '150ms'),
    normal: getEnv('VITE_TRANSITION_NORMAL', '200ms'),
    slow: getEnv('VITE_TRANSITION_SLOW', '300ms'),
    slower: getEnv('VITE_TRANSITION_SLOWER', '500ms'),
  },
  easing: {
    default: getEnv('VITE_TRANSITION_EASING', 'cubic-bezier(0.4, 0, 0.2, 1)'),
    in: getEnv('VITE_TRANSITION_EASING_IN', 'cubic-bezier(0.4, 0, 1, 1)'),
    out: getEnv('VITE_TRANSITION_EASING_OUT', 'cubic-bezier(0, 0, 0.2, 1)'),
    bounce: getEnv('VITE_TRANSITION_EASING_BOUNCE', 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'),
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get icon size class based on size key
 * Flexy loves this modular approach!
 */
export const getIconSizeClass = (size: keyof typeof ICON_SIZES): string => {
  return ICON_SIZES[size];
};

export default {
  SPACING,
  ICON_SIZES,
  BUTTON_PADDING,
  GAP_CLASSES,
  PADDING_CLASSES,
  RADIUS_CLASSES,
  SHADOWS,
  Z_LAYERS,
  TYPOGRAPHY,
  TRANSITIONS,
  getIconSizeClass,
};
