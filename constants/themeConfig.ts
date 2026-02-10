/**
 * Theme Configuration
 * Centralized theme values for colors, typography, spacing, and UI components
 * Flexy: Eliminating hardcoded theme values throughout the codebase
 * All values can be overridden via environment variables.
 */

// Helper to safely get env var with fallback
const getEnv = (key: string, defaultValue: string): string => {
  const value = (import.meta as unknown as Record<string, Record<string, string>>)?.env?.[key] 
    ?? (typeof process !== 'undefined' ? process.env?.[key] : undefined);
  return value || defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = getEnv(key, String(defaultValue));
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Color palette - Tailwind colors
export const THEME_COLORS = {
  // Primary brand colors
  primary: {
    DEFAULT: getEnv('VITE_THEME_PRIMARY_DEFAULT', 'emerald-500'),
    light: getEnv('VITE_THEME_PRIMARY_LIGHT', 'emerald-400'),
    dark: getEnv('VITE_THEME_PRIMARY_DARK', 'emerald-600'),
    bg: getEnv('VITE_THEME_PRIMARY_BG', 'emerald-900/20'),
    border: getEnv('VITE_THEME_PRIMARY_BORDER', 'emerald-500/30'),
  },
  // Secondary colors
  secondary: {
    DEFAULT: getEnv('VITE_THEME_SECONDARY_DEFAULT', 'blue-500'),
    light: getEnv('VITE_THEME_SECONDARY_LIGHT', 'blue-400'),
    dark: getEnv('VITE_THEME_SECONDARY_DARK', 'blue-600'),
    bg: getEnv('VITE_THEME_SECONDARY_BG', 'blue-900/20'),
    border: getEnv('VITE_THEME_SECONDARY_BORDER', 'blue-500/30'),
  },
  // Background colors
  background: {
    DEFAULT: getEnv('VITE_THEME_BG_DEFAULT', 'slate-950'),
    card: getEnv('VITE_THEME_BG_CARD', 'slate-900'),
    elevated: getEnv('VITE_THEME_BG_ELEVATED', 'slate-800'),
    input: getEnv('VITE_THEME_BG_INPUT', 'slate-950'),
  },
  // Text colors
  text: {
    DEFAULT: getEnv('VITE_THEME_TEXT_DEFAULT', 'slate-200'),
    primary: getEnv('VITE_THEME_TEXT_PRIMARY', 'white'),
    secondary: getEnv('VITE_THEME_TEXT_SECONDARY', 'slate-300'),
    muted: getEnv('VITE_THEME_TEXT_MUTED', 'slate-400'),
    disabled: getEnv('VITE_THEME_TEXT_DISABLED', 'slate-500'),
  },
  // Border colors
  border: {
    DEFAULT: getEnv('VITE_THEME_BORDER_DEFAULT', 'slate-800'),
    light: getEnv('VITE_THEME_BORDER_LIGHT', 'slate-700'),
    subtle: getEnv('VITE_THEME_BORDER_SUBTLE', 'white/5'),
  },
  // Status colors
  status: {
    error: {
      DEFAULT: getEnv('VITE_THEME_ERROR_DEFAULT', 'red-500'),
      bg: getEnv('VITE_THEME_ERROR_BG', 'red-900/20'),
      border: getEnv('VITE_THEME_ERROR_BORDER', 'red-500/30'),
      text: getEnv('VITE_THEME_ERROR_TEXT', 'red-400'),
    },
    warning: {
      DEFAULT: getEnv('VITE_THEME_WARNING_DEFAULT', 'amber-500'),
      bg: getEnv('VITE_THEME_WARNING_BG', 'amber-900/20'),
      border: getEnv('VITE_THEME_WARNING_BORDER', 'amber-500/30'),
      text: getEnv('VITE_THEME_WARNING_TEXT', 'amber-500'),
    },
    info: {
      DEFAULT: getEnv('VITE_THEME_INFO_DEFAULT', 'blue-500'),
      bg: getEnv('VITE_THEME_INFO_BG', 'blue-900/20'),
      border: getEnv('VITE_THEME_INFO_BORDER', 'blue-500/30'),
      text: getEnv('VITE_THEME_INFO_TEXT', 'blue-400'),
    },
    success: {
      DEFAULT: getEnv('VITE_THEME_SUCCESS_DEFAULT', 'emerald-500'),
      bg: getEnv('VITE_THEME_SUCCESS_BG', 'emerald-900/20'),
      border: getEnv('VITE_THEME_SUCCESS_BORDER', 'emerald-500/30'),
      text: getEnv('VITE_THEME_SUCCESS_TEXT', 'emerald-400'),
    },
  },
} as const;

// Spacing scale
export const THEME_SPACING = {
  xs: getEnvNumber('VITE_THEME_SPACING_XS', 4),
  sm: getEnvNumber('VITE_THEME_SPACING_SM', 8),
  md: getEnvNumber('VITE_THEME_SPACING_MD', 16),
  lg: getEnvNumber('VITE_THEME_SPACING_LG', 24),
  xl: getEnvNumber('VITE_THEME_SPACING_XL', 32),
  '2xl': getEnvNumber('VITE_THEME_SPACING_2XL', 48),
} as const;

// Border radius
export const THEME_RADIUS = {
  sm: getEnv('VITE_THEME_RADIUS_SM', 'rounded'),
  md: getEnv('VITE_THEME_RADIUS_MD', 'rounded-lg'),
  lg: getEnv('VITE_THEME_RADIUS_LG', 'rounded-xl'),
  xl: getEnv('VITE_THEME_RADIUS_XL', 'rounded-2xl'),
  full: getEnv('VITE_THEME_RADIUS_FULL', 'rounded-full'),
} as const;

// Typography
export const THEME_TYPOGRAPHY = {
  fontSize: {
    xs: getEnv('VITE_THEME_FONT_SIZE_XS', 'text-[10px]'),
    sm: getEnv('VITE_THEME_FONT_SIZE_SM', 'text-xs'),
    base: getEnv('VITE_THEME_FONT_SIZE_BASE', 'text-sm'),
    md: getEnv('VITE_THEME_FONT_SIZE_MD', 'text-base'),
    lg: getEnv('VITE_THEME_FONT_SIZE_LG', 'text-lg'),
    xl: getEnv('VITE_THEME_FONT_SIZE_XL', 'text-xl'),
    '2xl': getEnv('VITE_THEME_FONT_SIZE_2XL', 'text-2xl'),
  },
  fontWeight: {
    normal: getEnv('VITE_THEME_FONT_WEIGHT_NORMAL', 'font-normal'),
    medium: getEnv('VITE_THEME_FONT_WEIGHT_MEDIUM', 'font-medium'),
    semibold: getEnv('VITE_THEME_FONT_WEIGHT_SEMIBOLD', 'font-semibold'),
    bold: getEnv('VITE_THEME_FONT_WEIGHT_BOLD', 'font-bold'),
    black: getEnv('VITE_THEME_FONT_WEIGHT_BLACK', 'font-black'),
  },
} as const;

// Shadow styles
export const THEME_SHADOWS = {
  sm: getEnv('VITE_THEME_SHADOW_SM', 'shadow-sm'),
  md: getEnv('VITE_THEME_SHADOW_MD', 'shadow-lg'),
  lg: getEnv('VITE_THEME_SHADOW_LG', 'shadow-2xl'),
  glow: {
    primary: getEnv('VITE_THEME_SHADOW_GLOW_PRIMARY', 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'),
    secondary: getEnv('VITE_THEME_SHADOW_GLOW_SECONDARY', 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]'),
  },
} as const;

// Component-specific styles
export const COMPONENT_STYLES = {
  // Button variants
  button: {
    primary: {
      base: `bg-${THEME_COLORS.primary.dark} hover:bg-${THEME_COLORS.primary.DEFAULT} text-white`,
      border: `border-${THEME_COLORS.primary.border}`,
    },
    secondary: {
      base: `bg-${THEME_COLORS.background.elevated} hover:bg-slate-700 text-${THEME_COLORS.text.DEFAULT}`,
      border: `border-${THEME_COLORS.border.light}`,
    },
    ghost: {
      base: `hover:bg-${THEME_COLORS.background.elevated} text-${THEME_COLORS.text.muted} hover:text-white`,
    },
    danger: {
      base: `border border-${THEME_COLORS.status.error.border} text-${THEME_COLORS.status.error.text} hover:bg-${THEME_COLORS.status.error.bg}`,
    },
  },
  // Card styles
  card: {
    base: `bg-${THEME_COLORS.background.card} border border-${THEME_COLORS.border.DEFAULT} ${THEME_RADIUS.lg}`,
    hover: `hover:border-${THEME_COLORS.border.light}`,
    elevated: `bg-${THEME_COLORS.background.card} border border-${THEME_COLORS.border.light} ${THEME_RADIUS.lg} ${THEME_SHADOWS.md}`,
  },
  // Input styles
  input: {
    base: `bg-${THEME_COLORS.background.input} border border-${THEME_COLORS.border.light} ${THEME_RADIUS.md} text-white focus:border-${THEME_COLORS.primary.DEFAULT}`,
  },
  // Modal styles
  modal: {
    overlay: `fixed inset-0 z-[60] flex items-center justify-center p-4 bg-${THEME_COLORS.background.DEFAULT}/90 backdrop-blur-md`,
    container: `bg-${THEME_COLORS.background.card} border border-${THEME_COLORS.border.light} w-full ${THEME_RADIUS.xl} ${THEME_SHADOWS.lg}`,
    header: `p-4 border-b border-${THEME_COLORS.border.DEFAULT} bg-${THEME_COLORS.background.DEFAULT}/50`,
  },
} as const;

// Layout constants
export const LAYOUT = {
  maxWidth: {
    sm: getEnv('VITE_LAYOUT_MAX_WIDTH_SM', 'max-w-md'),
    md: getEnv('VITE_LAYOUT_MAX_WIDTH_MD', 'max-w-2xl'),
    lg: getEnv('VITE_LAYOUT_MAX_WIDTH_LG', 'max-w-4xl'),
    xl: getEnv('VITE_LAYOUT_MAX_WIDTH_XL', 'max-w-6xl'),
  },
  container: {
    padding: getEnv('VITE_LAYOUT_CONTAINER_PADDING', 'px-4 md:px-8'),
  },
} as const;

// Z-index scale
export const Z_INDEX = {
  dropdown: getEnvNumber('VITE_Z_INDEX_DROPDOWN', 50),
  modal: getEnvNumber('VITE_Z_INDEX_MODAL', 60),
  tooltip: getEnvNumber('VITE_Z_INDEX_TOOLTIP', 70),
  toast: getEnvNumber('VITE_Z_INDEX_TOAST', 80),
} as const;

// Default export for convenience
export default {
  THEME_COLORS,
  THEME_SPACING,
  THEME_RADIUS,
  THEME_TYPOGRAPHY,
  THEME_SHADOWS,
  COMPONENT_STYLES,
  LAYOUT,
  Z_INDEX,
};
