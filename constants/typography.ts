/**
 * Typography Configuration
 * Centralized typography tokens for consistent text styling across the application
 * Flexy: Uses centralized env utilities for modularity
 * All values can be overridden via environment variables.
 */

import { getEnv } from '../utils/envUtils';

// ============================================================================
// FONT SIZE TOKENS (Tailwind text-* classes)
// ============================================================================

export const FONT_SIZES = {
  '3xs': getEnv('VITE_FONT_SIZE_3XS_CLASS', 'text-[8px]'),
  micro: getEnv('VITE_FONT_SIZE_MICRO_CLASS', 'text-[9px]'),
  '2xs': getEnv('VITE_FONT_SIZE_2XS_CLASS', 'text-[10px]'),
  '2xsAlt': getEnv('VITE_FONT_SIZE_2XS_ALT_CLASS', 'text-[11px]'),
  xs: getEnv('VITE_FONT_SIZE_XS_CLASS', 'text-xs'),
  sm: getEnv('VITE_FONT_SIZE_SM_CLASS', 'text-sm'),
  base: getEnv('VITE_FONT_SIZE_BASE_CLASS', 'text-base'),
  lg: getEnv('VITE_FONT_SIZE_LG_CLASS', 'text-lg'),
  xl: getEnv('VITE_FONT_SIZE_XL_CLASS', 'text-xl'),
  '2xl': getEnv('VITE_FONT_SIZE_2XL_CLASS', 'text-2xl'),
  '3xl': getEnv('VITE_FONT_SIZE_3XL_CLASS', 'text-3xl'),
  '4xl': getEnv('VITE_FONT_SIZE_4XL_CLASS', 'text-4xl'),
} as const;

// ============================================================================
// FONT WEIGHT TOKENS
// ============================================================================

export const FONT_WEIGHTS = {
  normal: getEnv('VITE_FONT_WEIGHT_NORMAL_CLASS', 'font-normal'),
  medium: getEnv('VITE_FONT_WEIGHT_MEDIUM_CLASS', 'font-medium'),
  semibold: getEnv('VITE_FONT_WEIGHT_SEMIBOLD_CLASS', 'font-semibold'),
  bold: getEnv('VITE_FONT_WEIGHT_BOLD_CLASS', 'font-bold'),
  black: getEnv('VITE_FONT_WEIGHT_BLACK_CLASS', 'font-black'),
} as const;

// ============================================================================
// LINE HEIGHT TOKENS
// ============================================================================

export const LINE_HEIGHTS = {
  none: getEnv('VITE_LINE_HEIGHT_NONE_CLASS', 'leading-none'),
  tight: getEnv('VITE_LINE_HEIGHT_TIGHT_CLASS', 'leading-tight'),
  snug: getEnv('VITE_LINE_HEIGHT_SNUG_CLASS', 'leading-snug'),
  normal: getEnv('VITE_LINE_HEIGHT_NORMAL_CLASS', 'leading-normal'),
  relaxed: getEnv('VITE_LINE_HEIGHT_RELAXED_CLASS', 'leading-relaxed'),
  loose: getEnv('VITE_LINE_HEIGHT_LOOSE_CLASS', 'leading-loose'),
} as const;

// ============================================================================
// LETTER SPACING TOKENS
// ============================================================================

export const LETTER_SPACING = {
  tighter: getEnv('VITE_LETTER_SPACING_TIGHTER_CLASS', 'tracking-tighter'),
  tight: getEnv('VITE_LETTER_SPACING_TIGHT_CLASS', 'tracking-tight'),
  normal: getEnv('VITE_LETTER_SPACING_NORMAL_CLASS', 'tracking-normal'),
  wide: getEnv('VITE_LETTER_SPACING_WIDE_CLASS', 'tracking-wide'),
  wider: getEnv('VITE_LETTER_SPACING_WIDER_CLASS', 'tracking-wider'),
  widest: getEnv('VITE_LETTER_SPACING_WIDEST_CLASS', 'tracking-widest'),
} as const;

// ============================================================================
// TEXT COLOR TOKENS (using Tailwind classes)
// ============================================================================

export const TEXT_COLORS = {
  white: getEnv('VITE_TEXT_COLOR_WHITE_CLASS', 'text-white'),
  slate: {
    50: getEnv('VITE_TEXT_COLOR_SLATE_50_CLASS', 'text-slate-50'),
    100: getEnv('VITE_TEXT_COLOR_SLATE_100_CLASS', 'text-slate-100'),
    200: getEnv('VITE_TEXT_COLOR_SLATE_200_CLASS', 'text-slate-200'),
    300: getEnv('VITE_TEXT_COLOR_SLATE_300_CLASS', 'text-slate-300'),
    400: getEnv('VITE_TEXT_COLOR_SLATE_400_CLASS', 'text-slate-400'),
    500: getEnv('VITE_TEXT_COLOR_SLATE_500_CLASS', 'text-slate-500'),
    600: getEnv('VITE_TEXT_COLOR_SLATE_600_CLASS', 'text-slate-600'),
    700: getEnv('VITE_TEXT_COLOR_SLATE_700_CLASS', 'text-slate-700'),
    800: getEnv('VITE_TEXT_COLOR_SLATE_800_CLASS', 'text-slate-800'),
    900: getEnv('VITE_TEXT_COLOR_SLATE_900_CLASS', 'text-slate-900'),
    950: getEnv('VITE_TEXT_COLOR_SLATE_950_CLASS', 'text-slate-950'),
  },
  primary: {
    emerald: getEnv('VITE_TEXT_COLOR_EMERALD_CLASS', 'text-emerald-400'),
    blue: getEnv('VITE_TEXT_COLOR_BLUE_CLASS', 'text-blue-400'),
    purple: getEnv('VITE_TEXT_COLOR_PURPLE_CLASS', 'text-purple-400'),
    indigo: getEnv('VITE_TEXT_COLOR_INDIGO_CLASS', 'text-indigo-400'),
  },
  status: {
    success: getEnv('VITE_TEXT_COLOR_SUCCESS_CLASS', 'text-emerald-400'),
    error: getEnv('VITE_TEXT_COLOR_ERROR_CLASS', 'text-red-400'),
    warning: getEnv('VITE_TEXT_COLOR_WARNING_CLASS', 'text-yellow-400'),
    info: getEnv('VITE_TEXT_COLOR_INFO_CLASS', 'text-blue-400'),
  },
} as const;

// ============================================================================
// TYPOGRAPHY COMBINATIONS (Presets)
// ============================================================================

export const TYPOGRAPHY_PRESETS = {
  // Headings
  h1: `${FONT_SIZES['4xl']} ${FONT_WEIGHTS.bold} ${TEXT_COLORS.white}`,
  h2: `${FONT_SIZES['3xl']} ${FONT_WEIGHTS.bold} ${TEXT_COLORS.white}`,
  h3: `${FONT_SIZES['2xl']} ${FONT_WEIGHTS.bold} ${TEXT_COLORS.white}`,
  h4: `${FONT_SIZES.xl} ${FONT_WEIGHTS.bold} ${TEXT_COLORS.white}`,
  h5: `${FONT_SIZES.lg} ${FONT_WEIGHTS.bold} ${TEXT_COLORS.white}`,
  h6: `${FONT_SIZES.base} ${FONT_WEIGHTS.bold} ${TEXT_COLORS.white}`,
  
  // Body text
  body: `${FONT_SIZES.base} ${FONT_WEIGHTS.normal} ${TEXT_COLORS.slate[300]}`,
  bodySmall: `${FONT_SIZES.sm} ${FONT_WEIGHTS.normal} ${TEXT_COLORS.slate[400]}`,
  caption: `${FONT_SIZES.xs} ${FONT_WEIGHTS.normal} ${TEXT_COLORS.slate[500]}`,
  captionSmall: `${FONT_SIZES['2xs']} ${FONT_WEIGHTS.normal} ${TEXT_COLORS.slate[500]}`,
  captionMicro: `${FONT_SIZES.micro} ${FONT_WEIGHTS.normal} ${TEXT_COLORS.slate[500]}`,
  captionTiny: `${FONT_SIZES['3xs']} ${FONT_WEIGHTS.normal} ${TEXT_COLORS.slate[500]}`,
  
  // Labels
  label: `${FONT_SIZES.xs} ${FONT_WEIGHTS.bold} ${LETTER_SPACING.wider} ${TEXT_COLORS.slate[400]} uppercase`,
  labelSmall: `${FONT_SIZES['2xs']} ${FONT_WEIGHTS.bold} ${LETTER_SPACING.wider} ${TEXT_COLORS.slate[500]} uppercase`,
  labelMicro: `${FONT_SIZES.micro} ${FONT_WEIGHTS.bold} ${LETTER_SPACING.wider} ${TEXT_COLORS.slate[500]} uppercase`,
  labelTiny: `${FONT_SIZES['3xs']} ${FONT_WEIGHTS.bold} ${LETTER_SPACING.wider} ${TEXT_COLORS.slate[500]} uppercase`,
  
  // Interactive
  button: `${FONT_SIZES.sm} ${FONT_WEIGHTS.bold}`,
  link: `${FONT_SIZES.sm} ${FONT_WEIGHTS.medium} ${TEXT_COLORS.primary.emerald} hover:underline`,
  
  // Code/Mono
  code: `${FONT_SIZES.sm} ${FONT_WEIGHTS.normal} font-mono ${TEXT_COLORS.slate[300]}`,
  mono: `${FONT_SIZES.xs} ${FONT_WEIGHTS.normal} font-mono ${TEXT_COLORS.slate[400]}`,
  
  // Status messages
  success: `${FONT_SIZES.sm} ${FONT_WEIGHTS.medium} ${TEXT_COLORS.status.success}`,
  error: `${FONT_SIZES.sm} ${FONT_WEIGHTS.medium} ${TEXT_COLORS.status.error}`,
  warning: `${FONT_SIZES.sm} ${FONT_WEIGHTS.medium} ${TEXT_COLORS.status.warning}`,
  info: `${FONT_SIZES.sm} ${FONT_WEIGHTS.medium} ${TEXT_COLORS.status.info}`,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build a typography class string from individual tokens
 * Flexy loves this modular approach!
 */
export const buildTypography = (options: {
  size?: keyof typeof FONT_SIZES;
  weight?: keyof typeof FONT_WEIGHTS;
  color?: string;
  lineHeight?: keyof typeof LINE_HEIGHTS;
  letterSpacing?: keyof typeof LETTER_SPACING;
}): string => {
  const classes: string[] = [];
  
  if (options.size) classes.push(FONT_SIZES[options.size]);
  if (options.weight) classes.push(FONT_WEIGHTS[options.weight]);
  if (options.color) classes.push(options.color);
  if (options.lineHeight) classes.push(LINE_HEIGHTS[options.lineHeight]);
  if (options.letterSpacing) classes.push(LETTER_SPACING[options.letterSpacing]);
  
  return classes.join(' ');
};

// Default export for convenience
export default {
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  LETTER_SPACING,
  TEXT_COLORS,
  TYPOGRAPHY_PRESETS,
  buildTypography,
};
