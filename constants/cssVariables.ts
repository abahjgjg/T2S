/**
 * CSS Custom Properties Configuration
 * Generates CSS variables for theming and styling
 * Flexy: Centralized CSS variables for maximum modularity
 * All values can be overridden via environment variables.
 */

import { getEnv, getEnvNumber } from '../utils/envUtils';

// Color palette configuration
const CSS_COLORS = {
  // Primary brand colors
  '--color-primary-emerald': getEnv('VITE_COLOR_PRIMARY_EMERALD', '#10b981'),
  '--color-primary-blue': getEnv('VITE_COLOR_PRIMARY_BLUE', '#3b82f6'),
  '--color-primary-purple': getEnv('VITE_COLOR_PRIMARY_PURPLE', '#8b5cf6'),
  
  // Slate palette (dark theme base)
  '--color-slate-50': getEnv('VITE_COLOR_SLATE_50', '#f8fafc'),
  '--color-slate-100': getEnv('VITE_COLOR_SLATE_100', '#f1f5f9'),
  '--color-slate-200': getEnv('VITE_COLOR_SLATE_200', '#e2e8f0'),
  '--color-slate-300': getEnv('VITE_COLOR_SLATE_300', '#cbd5e1'),
  '--color-slate-400': getEnv('VITE_COLOR_SLATE_400', '#94a3b8'),
  '--color-slate-500': getEnv('VITE_COLOR_SLATE_500', '#64748b'),
  '--color-slate-600': getEnv('VITE_COLOR_SLATE_600', '#475569'),
  '--color-slate-700': getEnv('VITE_COLOR_SLATE_700', '#334155'),
  '--color-slate-800': getEnv('VITE_COLOR_SLATE_800', '#1e293b'),
  '--color-slate-900': getEnv('VITE_COLOR_SLATE_900', '#0f172a'),
  '--color-slate-950': getEnv('VITE_COLOR_SLATE_950', '#020617'),
  
  // Status colors
  '--color-success': getEnv('VITE_COLOR_STATUS_SUCCESS', '#10b981'),
  '--color-error': getEnv('VITE_COLOR_STATUS_ERROR', '#ef4444'),
  '--color-warning': getEnv('VITE_COLOR_STATUS_WARNING', '#f59e0b'),
  '--color-info': getEnv('VITE_COLOR_STATUS_INFO', '#3b82f6'),
  
  // Semantic colors
  '--color-focus': getEnv('VITE_COLOR_FOCUS', '#10b981'),
  '--color-accent': getEnv('VITE_COLOR_ACCENT', '#10b981'),
  
  // Scrollbar colors
  '--color-scrollbar-track': getEnv('VITE_COLOR_SLATE_900', '#0f172a'),
  '--color-scrollbar-thumb': getEnv('VITE_COLOR_SLATE_700', '#334155'),
  '--color-scrollbar-thumb-hover': getEnv('VITE_COLOR_SLATE_600', '#475569'),
  
  // Print colors
  '--color-print-bg': getEnv('VITE_COLOR_PRINT_BG', '#ffffff'),
  '--color-print-text': getEnv('VITE_COLOR_PRINT_TEXT', '#000000'),
  '--color-print-border': getEnv('VITE_COLOR_PRINT_BORDER', '#e2e8f0'),
} as const;

// Animation duration configuration
const CSS_ANIMATIONS = {
  '--animation-duration-shimmer': `${getEnvNumber('VITE_ANIMATION_SHIMMER_DURATION', 2000)}ms`,
  '--animation-duration-marquee': `${getEnvNumber('VITE_ANIMATION_MARQUEE_DURATION', 30000)}ms`,
  '--animation-duration-spin-slow': `${getEnvNumber('VITE_ANIMATION_SPIN_SLOW_DURATION', 8000)}ms`,
  '--animation-duration-float': `${getEnvNumber('VITE_ANIMATION_FLOAT_DURATION', 3000)}ms`,
  '--animation-duration-shake': `${getEnvNumber('VITE_ANIMATION_SHAKE_DURATION', 500)}ms`,
  '--animation-duration-focus': `${getEnvNumber('VITE_ANIMATION_FOCUS_DURATION', 200)}ms`,
} as const;

// Layout configuration
const CSS_LAYOUT = {
  '--scrollbar-width': `${getEnvNumber('VITE_SCROLLBAR_WIDTH', 8)}px`,
  '--scrollbar-height': `${getEnvNumber('VITE_SCROLLBAR_HEIGHT', 8)}px`,
  '--scrollbar-border-radius': `${getEnvNumber('VITE_SCROLLBAR_BORDER_RADIUS', 4)}px`,
  '--outline-width': `${getEnvNumber('VITE_OUTLINE_WIDTH', 2)}px`,
  '--outline-offset': `${getEnvNumber('VITE_OUTLINE_OFFSET', 2)}px`,
} as const;

// Typography configuration
const CSS_TYPOGRAPHY = {
  '--font-family-sans': getEnv('VITE_FONT_FAMILY_SANS', "'Inter', sans-serif"),
  '--font-family-mono': getEnv('VITE_FONT_FAMILY_MONO', "'Fira Code', monospace"),
  '--font-weight-light': getEnv('VITE_FONT_WEIGHT_LIGHT', '300'),
  '--font-weight-regular': getEnv('VITE_FONT_WEIGHT_REGULAR', '400'),
  '--font-weight-semibold': getEnv('VITE_FONT_WEIGHT_SEMIBOLD', '600'),
  '--font-weight-bold': getEnv('VITE_FONT_WEIGHT_BOLD', '800'),
} as const;

// Reduced motion configuration
const CSS_REDUCED_MOTION = {
  '--reduced-motion-duration': '0.01ms',
  '--reduced-motion-iteration': '1',
} as const;

// Combine all CSS variables
export const CSS_VARIABLES = {
  ...CSS_COLORS,
  ...CSS_ANIMATIONS,
  ...CSS_LAYOUT,
  ...CSS_TYPOGRAPHY,
  ...CSS_REDUCED_MOTION,
} as const;

/**
 * Generate CSS variable declarations string
 * Use this to inject into CSS or style tags
 */
export const generateCSSVariables = (): string => {
  const variables = Object.entries(CSS_VARIABLES)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
  
  return `:root {\n${variables}\n}`;
};

/**
 * Generate CSS variable string for inline styles
 */
export const getCSSVariable = (name: keyof typeof CSS_VARIABLES): string => {
  return CSS_VARIABLES[name];
};

/**
 * Generate a style object for React inline styles
 */
export const generateStyleObject = (): Record<string, string> => {
  return Object.entries(CSS_VARIABLES).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
};

// Individual exports for specific variable groups
export { CSS_COLORS, CSS_ANIMATIONS, CSS_LAYOUT, CSS_TYPOGRAPHY };

// Default export
export default CSS_VARIABLES;
