/**
 * Animation Timing Configuration
 * Centralized animation durations and timing functions
 * Flexy: Eliminating hardcoded animation values throughout the codebase
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

// Animation durations in milliseconds
export const ANIMATION_DURATION = {
  // Micro interactions (buttons, hovers)
  micro: {
    fast: getEnvNumber('VITE_ANIMATION_MICRO_FAST', 100),
    normal: getEnvNumber('VITE_ANIMATION_MICRO_NORMAL', 150),
    slow: getEnvNumber('VITE_ANIMATION_MICRO_SLOW', 200),
  },
  // Standard transitions (modals, dropdowns)
  standard: {
    fast: getEnvNumber('VITE_ANIMATION_STANDARD_FAST', 200),
    normal: getEnvNumber('VITE_ANIMATION_STANDARD_NORMAL', 300),
    slow: getEnvNumber('VITE_ANIMATION_STANDARD_SLOW', 500),
  },
  // Page transitions
  page: {
    fast: getEnvNumber('VITE_ANIMATION_PAGE_FAST', 300),
    normal: getEnvNumber('VITE_ANIMATION_PAGE_NORMAL', 500),
    slow: getEnvNumber('VITE_ANIMATION_PAGE_SLOW', 700),
  },
  // Loading and progress
  loading: {
    pulse: getEnvNumber('VITE_ANIMATION_LOADING_PULSE', 1500),
    spin: getEnvNumber('VITE_ANIMATION_LOADING_SPIN', 1000),
    shimmer: getEnvNumber('VITE_ANIMATION_LOADING_SHIMMER', 2000),
  },
} as const;

// Animation timing functions
export const ANIMATION_EASING = {
  default: getEnv('VITE_ANIMATION_EASING_DEFAULT', 'ease-out'),
  smooth: getEnv('VITE_ANIMATION_EASING_SMOOTH', 'cubic-bezier(0.4, 0, 0.2, 1)'),
  bounce: getEnv('VITE_ANIMATION_EASING_BOUNCE', 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'),
  spring: getEnv('VITE_ANIMATION_EASING_SPRING', 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'),
  easeIn: getEnv('VITE_ANIMATION_EASING_IN', 'ease-in'),
  easeOut: getEnv('VITE_ANIMATION_EASING_OUT', 'ease-out'),
  easeInOut: getEnv('VITE_ANIMATION_EASING_IN_OUT', 'ease-in-out'),
  linear: getEnv('VITE_ANIMATION_EASING_LINEAR', 'linear'),
} as const;

// Predefined animation classes (for Tailwind)
export const ANIMATION_CLASSES = {
  fadeIn: {
    fast: `animate-[fadeIn_${ANIMATION_DURATION.standard.fast}ms_${ANIMATION_EASING.default}]`,
    normal: `animate-[fadeIn_${ANIMATION_DURATION.standard.normal}ms_${ANIMATION_EASING.default}]`,
    slow: `animate-[fadeIn_${ANIMATION_DURATION.standard.slow}ms_${ANIMATION_EASING.default}]`,
  },
  slideUp: {
    fast: `animate-[slideUp_${ANIMATION_DURATION.standard.fast}ms_${ANIMATION_EASING.spring}]`,
    normal: `animate-[slideUp_${ANIMATION_DURATION.standard.normal}ms_${ANIMATION_EASING.spring}]`,
    slow: `animate-[slideUp_${ANIMATION_DURATION.standard.slow}ms_${ANIMATION_EASING.spring}]`,
  },
  scale: {
    fast: `animate-[scale_${ANIMATION_DURATION.micro.normal}ms_${ANIMATION_EASING.spring}]`,
    normal: `animate-[scale_${ANIMATION_DURATION.standard.fast}ms_${ANIMATION_EASING.spring}]`,
  },
} as const;

// Stagger delays for list animations
export const STAGGER_DELAY = {
  fast: getEnvNumber('VITE_STAGGER_DELAY_FAST', 50),
  normal: getEnvNumber('VITE_STAGGER_DELAY_NORMAL', 100),
  slow: getEnvNumber('VITE_STAGGER_DELAY_SLOW', 150),
} as const;

// Default export for convenience
export default {
  ANIMATION_DURATION,
  ANIMATION_EASING,
  ANIMATION_CLASSES,
  STAGGER_DELAY,
};
