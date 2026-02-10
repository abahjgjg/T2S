/**
 * Typography Configuration
 * Centralized typography values for consistent text styling throughout the application
 * Flexy: Eliminating hardcoded typography values throughout the codebase
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

// Font size classes
export const FONT_SIZE = {
  // Extra small sizes
  '2xs': 'text-[8px]',
  xs: 'text-[10px]',
  sm: 'text-xs',
  
  // Standard sizes
  base: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  
  // Heading sizes
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
  
  // Custom pixel values
  custom: {
    '8': `text-[8px]`,
    '10': `text-[10px]`,
    '11': `text-[11px]`,
    '12': `text-[12px]`,
    '13': `text-[13px]`,
    '14': `text-[14px]`,
    '16': `text-[16px]`,
    '18': `text-[18px]`,
    '20': `text-[20px]`,
    '24': `text-[24px]`,
  },
} as const;

// Font weight classes
export const FONT_WEIGHT = {
  thin: 'font-thin',
  extralight: 'font-extralight',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
} as const;

// Line height classes
export const LINE_HEIGHT = {
  none: 'leading-none',
  tight: 'leading-tight',
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
} as const;

// Letter spacing classes
export const LETTER_SPACING = {
  tighter: 'tracking-tighter',
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  wider: 'tracking-wider',
  widest: 'tracking-widest',
} as const;

// Typography presets for common patterns
export const TYPOGRAPHY = {
  // Headings
  heading: {
    h1: `${FONT_SIZE['4xl']} ${FONT_WEIGHT.bold} ${LINE_HEIGHT.tight}`,
    h2: `${FONT_SIZE['3xl']} ${FONT_WEIGHT.semibold} ${LINE_HEIGHT.tight}`,
    h3: `${FONT_SIZE['2xl']} ${FONT_WEIGHT.semibold} ${LINE_HEIGHT.snug}`,
    h4: `${FONT_SIZE.xl} ${FONT_WEIGHT.semibold} ${LINE_HEIGHT.snug}`,
    h5: `${FONT_SIZE.lg} ${FONT_WEIGHT.medium} ${LINE_HEIGHT.normal}`,
    h6: `${FONT_SIZE.md} ${FONT_WEIGHT.medium} ${LINE_HEIGHT.normal}`,
  },
  
  // Body text
  body: {
    large: `${FONT_SIZE.md} ${FONT_WEIGHT.normal} ${LINE_HEIGHT.relaxed}`,
    normal: `${FONT_SIZE.base} ${FONT_WEIGHT.normal} ${LINE_HEIGHT.normal}`,
    small: `${FONT_SIZE.sm} ${FONT_WEIGHT.normal} ${LINE_HEIGHT.normal}`,
    tiny: `${FONT_SIZE.xs} ${FONT_WEIGHT.normal} ${LINE_HEIGHT.normal}`,
  },
  
  // UI elements
  ui: {
    button: `${FONT_SIZE.sm} ${FONT_WEIGHT.medium}`,
    input: `${FONT_SIZE.base} ${FONT_WEIGHT.normal}`,
    label: `${FONT_SIZE.sm} ${FONT_WEIGHT.medium}`,
    caption: `${FONT_SIZE.xs} ${FONT_WEIGHT.normal}`,
    helper: `${FONT_SIZE.xs} ${FONT_WEIGHT.normal}`,
    badge: `${FONT_SIZE.xs} ${FONT_WEIGHT.semibold} ${LETTER_SPACING.wide}`,
    tag: `${FONT_SIZE.xs} ${FONT_WEIGHT.medium}`,
  },
  
  // Special
  mono: {
    normal: 'font-mono text-sm',
    small: 'font-mono text-xs',
    large: 'font-mono text-base',
  },
} as const;

// Text truncation
export const TEXT_TRUNCATE = {
  single: 'truncate',
  multi: (lines: number): string => `line-clamp-${lines}`,
} as const;

// Typography values in pixels (for inline styles)
export const FONT_SIZE_VALUES = {
  '2xs': getEnvNumber('VITE_FONT_SIZE_2XS', 8),
  xs: getEnvNumber('VITE_FONT_SIZE_XS', 10),
  sm: getEnvNumber('VITE_FONT_SIZE_SM', 12),
  base: getEnvNumber('VITE_FONT_SIZE_BASE', 14),
  md: getEnvNumber('VITE_FONT_SIZE_MD', 16),
  lg: getEnvNumber('VITE_FONT_SIZE_LG', 18),
  xl: getEnvNumber('VITE_FONT_SIZE_XL', 20),
  '2xl': getEnvNumber('VITE_FONT_SIZE_2XL', 24),
  '3xl': getEnvNumber('VITE_FONT_SIZE_3XL', 30),
  '4xl': getEnvNumber('VITE_FONT_SIZE_4XL', 36),
  '5xl': getEnvNumber('VITE_FONT_SIZE_5XL', 48),
  '6xl': getEnvNumber('VITE_FONT_SIZE_6XL', 60),
} as const;

export type Typography = typeof TYPOGRAPHY;
export type FontSize = typeof FONT_SIZE;

// Default export for convenience
export default {
  FONT_SIZE,
  FONT_WEIGHT,
  LINE_HEIGHT,
  LETTER_SPACING,
  TYPOGRAPHY,
  TEXT_TRUNCATE,
  FONT_SIZE_VALUES,
};
