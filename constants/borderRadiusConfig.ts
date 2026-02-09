/**
 * Border Radius Configuration
 * Centralized border radius values for consistent styling throughout the application
 * Flexy: Eliminating hardcoded border radius values throughout the codebase
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

// Standard Tailwind border radius classes
export const BORDER_RADIUS = {
  // Standard sizes
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
  
  // Custom pixel values (for specific design needs)
  custom: {
    xs: `rounded-[${getEnvNumber('VITE_BORDER_RADIUS_XS', 2)}px]`,
    sm: `rounded-[${getEnvNumber('VITE_BORDER_RADIUS_SM', 4)}px]`,
    md: `rounded-[${getEnvNumber('VITE_BORDER_RADIUS_MD', 6)}px]`,
    lg: `rounded-[${getEnvNumber('VITE_BORDER_RADIUS_LG', 8)}px]`,
    xl: `rounded-[${getEnvNumber('VITE_BORDER_RADIUS_XL', 10)}px]`,
    '2xl': `rounded-[${getEnvNumber('VITE_BORDER_RADIUS_2XL', 12)}px]`,
    '3xl': `rounded-[${getEnvNumber('VITE_BORDER_RADIUS_3XL', 16)}px]`,
    '4xl': `rounded-[${getEnvNumber('VITE_BORDER_RADIUS_4XL', 20)}px]`,
  },
  
  // Component-specific radius values
  button: getEnv('VITE_BORDER_RADIUS_BUTTON', 'rounded-lg'),
  buttonPill: getEnv('VITE_BORDER_RADIUS_BUTTON_PILL', 'rounded-full'),
  input: getEnv('VITE_BORDER_RADIUS_INPUT', 'rounded-lg'),
  card: getEnv('VITE_BORDER_RADIUS_CARD', 'rounded-xl'),
  cardLarge: getEnv('VITE_BORDER_RADIUS_CARD_LARGE', 'rounded-2xl'),
  modal: getEnv('VITE_BORDER_RADIUS_MODAL', 'rounded-2xl'),
  modalSmall: getEnv('VITE_BORDER_RADIUS_MODAL_SMALL', 'rounded-xl'),
  tooltip: getEnv('VITE_BORDER_RADIUS_TOOLTIP', 'rounded-md'),
  dropdown: getEnv('VITE_BORDER_RADIUS_DROPDOWN', 'rounded-lg'),
  tag: getEnv('VITE_BORDER_RADIUS_TAG', 'rounded-full'),
  badge: getEnv('VITE_BORDER_RADIUS_BADGE', 'rounded-md'),
  avatar: getEnv('VITE_BORDER_RADIUS_AVATAR', 'rounded-full'),
  image: getEnv('VITE_BORDER_RADIUS_IMAGE', 'rounded-lg'),
  container: getEnv('VITE_BORDER_RADIUS_CONTAINER', 'rounded-2xl'),
  panel: getEnv('VITE_BORDER_RADIUS_PANEL', 'rounded-xl'),
} as const;

// Border radius values in pixels (for inline styles or calculations)
export const BORDER_RADIUS_VALUES = {
  none: getEnvNumber('VITE_BORDER_RADIUS_VALUE_NONE', 0),
  xs: getEnvNumber('VITE_BORDER_RADIUS_VALUE_XS', 2),
  sm: getEnvNumber('VITE_BORDER_RADIUS_VALUE_SM', 4),
  md: getEnvNumber('VITE_BORDER_RADIUS_VALUE_MD', 6),
  lg: getEnvNumber('VITE_BORDER_RADIUS_VALUE_LG', 8),
  xl: getEnvNumber('VITE_BORDER_RADIUS_VALUE_XL', 10),
  '2xl': getEnvNumber('VITE_BORDER_RADIUS_VALUE_2XL', 12),
  '3xl': getEnvNumber('VITE_BORDER_RADIUS_VALUE_3XL', 16),
  '4xl': getEnvNumber('VITE_BORDER_RADIUS_VALUE_4XL', 20),
  full: getEnvNumber('VITE_BORDER_RADIUS_VALUE_FULL', 9999),
} as const;

// Helper function to create custom border radius
export const createBorderRadius = (value: number): string => {
  return `rounded-[${value}px]`;
};

export type BorderRadius = typeof BORDER_RADIUS;

// Default export for convenience
export default {
  BORDER_RADIUS,
  BORDER_RADIUS_VALUES,
  createBorderRadius,
};
