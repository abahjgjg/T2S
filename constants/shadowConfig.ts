/**
 * Shadow Configuration
 * Centralized shadow values for consistent styling throughout the application
 * Flexy: Eliminating hardcoded shadow values throughout the codebase
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

// Standard Tailwind shadow classes
export const SHADOWS = {
  // Basic shadows
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
  none: 'shadow-none',
  
  // Glow shadows with emerald color
  glow: {
    emerald: {
      sm: `shadow-[0_0_10px_-2px_rgba(16,185,129,${getEnvNumber('VITE_SHADOW_GLOW_OPACITY_SM', 0.15)})]`,
      md: `shadow-[0_0_20px_-5px_rgba(16,185,129,${getEnvNumber('VITE_SHADOW_GLOW_OPACITY_MD', 0.15)})]`,
      lg: `shadow-[0_0_20px_-5px_rgba(16,185,129,${getEnvNumber('VITE_SHADOW_GLOW_OPACITY_LG', 0.3)})]`,
      xl: `shadow-[0_0_30px_rgba(16,185,129,${getEnvNumber('VITE_SHADOW_GLOW_OPACITY_XL', 0.3)})]`,
    },
    blue: {
      sm: `shadow-[0_0_10px_-2px_rgba(59,130,246,${getEnvNumber('VITE_SHADOW_GLOW_OPACITY_SM', 0.15)})]`,
      md: `shadow-[0_0_20px_-5px_rgba(59,130,246,${getEnvNumber('VITE_SHADOW_GLOW_OPACITY_MD', 0.15)})]`,
      lg: `shadow-[0_0_20px_-5px_rgba(59,130,246,${getEnvNumber('VITE_SHADOW_GLOW_OPACITY_LG', 0.3)})]`,
      xl: `shadow-[0_0_30px_rgba(59,130,246,${getEnvNumber('VITE_SHADOW_GLOW_OPACITY_XL', 0.3)})]`,
    },
    purple: {
      sm: `shadow-[0_0_10px_-2px_rgba(139,92,246,${getEnvNumber('VITE_SHADOW_GLOW_OPACITY_SM', 0.15)})]`,
      md: `shadow-[0_0_20px_-5px_rgba(139,92,246,${getEnvNumber('VITE_SHADOW_GLOW_OPACITY_MD', 0.15)})]`,
      lg: `shadow-[0_0_20px_-5px_rgba(139,92,246,${getEnvNumber('VITE_SHADOW_GLOW_OPACITY_LG', 0.3)})]`,
      xl: `shadow-[0_0_30px_rgba(139,92,246,${getEnvNumber('VITE_SHADOW_GLOW_OPACITY_XL', 0.3)})]`,
    },
  },
  
  // Colored shadows
  colored: {
    emerald: getEnv('VITE_SHADOW_COLORED_EMERALD', 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)]'),
    emeraldStrong: getEnv('VITE_SHADOW_COLORED_EMERALD_STRONG', 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'),
    emeraldLarge: getEnv('VITE_SHADOW_COLORED_EMERALD_LARGE', 'shadow-[0_0_30px_rgba(16,185,129,0.3)]'),
    blue: getEnv('VITE_SHADOW_COLORED_BLUE', 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)]'),
    purple: getEnv('VITE_SHADOW_COLORED_PURPLE', 'shadow-[0_0_20px_-5px_rgba(139,92,246,0.15)]'),
    dark: getEnv('VITE_SHADOW_COLORED_DARK', 'shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)]'),
  },
  
  // Special shadows
  card: getEnv('VITE_SHADOW_CARD', 'shadow-lg'),
  cardHover: getEnv('VITE_SHADOW_CARD_HOVER', 'shadow-xl'),
  modal: getEnv('VITE_SHADOW_MODAL', 'shadow-2xl'),
  button: getEnv('VITE_SHADOW_BUTTON', 'shadow-md'),
  buttonHover: getEnv('VITE_SHADOW_BUTTON_HOVER', 'shadow-lg'),
  input: getEnv('VITE_SHADOW_INPUT', 'shadow-inner'),
  dropdown: getEnv('VITE_SHADOW_DROPDOWN', 'shadow-lg'),
  tooltip: getEnv('VITE_SHADOW_TOOLTIP', 'shadow-md'),
  toast: getEnv('VITE_SHADOW_TOAST', 'shadow-lg'),
} as const;

// Shadow opacity values for dynamic use
export const SHADOW_OPACITY = {
  subtle: getEnvNumber('VITE_SHADOW_OPACITY_SUBTLE', 0.1),
  light: getEnvNumber('VITE_SHADOW_OPACITY_LIGHT', 0.15),
  medium: getEnvNumber('VITE_SHADOW_OPACITY_MEDIUM', 0.3),
  strong: getEnvNumber('VITE_SHADOW_OPACITY_STRONG', 0.5),
  intense: getEnvNumber('VITE_SHADOW_OPACITY_INTENSE', 0.7),
} as const;

// Shadow blur radius values
export const SHADOW_BLUR = {
  sm: getEnvNumber('VITE_SHADOW_BLUR_SM', 10),
  md: getEnvNumber('VITE_SHADOW_BLUR_MD', 20),
  lg: getEnvNumber('VITE_SHADOW_BLUR_LG', 30),
  xl: getEnvNumber('VITE_SHADOW_BLUR_XL', 40),
} as const;

// Helper function to generate custom shadow
export const createShadow = (
  color: string,
  opacity: number,
  blur: number,
  spread: number = -5,
  x: number = 0,
  y: number = 0
): string => {
  return `shadow-[${x}px_${y}px_${blur}px_${spread}px_rgba(${color},${opacity})]`;
};

export type Shadows = typeof SHADOWS;

// Default export for convenience
export default {
  SHADOWS,
  SHADOW_OPACITY,
  SHADOW_BLUR,
  createShadow,
};
