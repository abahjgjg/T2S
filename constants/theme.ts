/**
 * Theme Colors Configuration
 * Centralized color palette for consistent theming across the application
 * Flexy: Eliminating hardcoded colors throughout the codebase
 * All values can be overridden via environment variables.
 */

// Helper to safely get env var with fallback
const getEnv = (key: string, defaultValue: string): string => {
  const value = (import.meta as unknown as Record<string, Record<string, string>>)?.env?.[key] 
    ?? (typeof process !== 'undefined' ? process.env?.[key] : undefined);
  return value || defaultValue;
};

// Helper to generate rgba values from hex colors
const hexToRgba = (hex: string, alpha: number): string => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const COLORS = {
  // Primary brand colors
  primary: {
    emerald: getEnv('VITE_COLOR_PRIMARY_EMERALD', '#10b981'),
    blue: getEnv('VITE_COLOR_PRIMARY_BLUE', '#3b82f6'),
    purple: getEnv('VITE_COLOR_PRIMARY_PURPLE', '#8b5cf6'),
    indigo: getEnv('VITE_COLOR_PRIMARY_INDIGO', '#6366f1'),
  },
  
  // Semantic colors
  sentiment: {
    positive: getEnv('VITE_COLOR_SENTIMENT_POSITIVE', '#10b981'),
    negative: getEnv('VITE_COLOR_SENTIMENT_NEGATIVE', '#ef4444'),
    neutral: getEnv('VITE_COLOR_SENTIMENT_NEUTRAL', '#3b82f6'),
  },
  
  // Chart colors
  chart: {
    grid: getEnv('VITE_COLOR_CHART_GRID', '#1e293b'),
    axis: getEnv('VITE_COLOR_CHART_AXIS', '#64748b'),
    axisLabel: getEnv('VITE_COLOR_CHART_AXIS_LABEL', '#64748b'),
    tooltipBg: getEnv('VITE_COLOR_CHART_TOOLTIP_BG', '#0f172a'),
    tooltipBorder: getEnv('VITE_COLOR_CHART_TOOLTIP_BORDER', '#334155'),
    tooltipText: getEnv('VITE_COLOR_CHART_TOOLTIP_TEXT', '#f8fafc'),
    cursor: getEnv('VITE_COLOR_CHART_CURSOR', '#1e293b'),
    bar1: getEnv('VITE_COLOR_CHART_BAR1', '#3b82f6'),
    bar2: getEnv('VITE_COLOR_CHART_BAR2', '#10b981'),
    cell1: getEnv('VITE_COLOR_CHART_CELL1', '#8b5cf6'),
    cell2: getEnv('VITE_COLOR_CHART_CELL2', '#a78bfa'),
    stroke1: getEnv('VITE_COLOR_CHART_STROKE1', '#334155'),
    stroke2: getEnv('VITE_COLOR_CHART_STROKE2', '#94a3b8'),
  },
  
  // UI colors (Tailwind slate palette)
  slate: {
    50: getEnv('VITE_COLOR_SLATE_50', '#f8fafc'),
    100: getEnv('VITE_COLOR_SLATE_100', '#f1f5f9'),
    200: getEnv('VITE_COLOR_SLATE_200', '#e2e8f0'),
    300: getEnv('VITE_COLOR_SLATE_300', '#cbd5e1'),
    400: getEnv('VITE_COLOR_SLATE_400', '#94a3b8'),
    500: getEnv('VITE_COLOR_SLATE_500', '#64748b'),
    600: getEnv('VITE_COLOR_SLATE_600', '#475569'),
    700: getEnv('VITE_COLOR_SLATE_700', '#334155'),
    800: getEnv('VITE_COLOR_SLATE_800', '#1e293b'),
    900: getEnv('VITE_COLOR_SLATE_900', '#0f172a'),
    950: getEnv('VITE_COLOR_SLATE_950', '#020617'),
  },
  
  // Status colors
  status: {
    success: getEnv('VITE_COLOR_STATUS_SUCCESS', '#10b981'),
    error: getEnv('VITE_COLOR_STATUS_ERROR', '#ef4444'),
    warning: getEnv('VITE_COLOR_STATUS_WARNING', '#f59e0b'),
    info: getEnv('VITE_COLOR_STATUS_INFO', '#3b82f6'),
  },
  
  // Gradient colors
  gradient: {
    start: getEnv('VITE_COLOR_GRADIENT_START', '#10b981'),
    end: getEnv('VITE_COLOR_GRADIENT_END', '#3b82f6'),
  },
  
  // Shadow colors (rgba)
  shadow: {
    emerald: getEnv('VITE_COLOR_SHADOW_EMERALD', 'rgba(16, 185, 129, 0.3)'),
    blue: getEnv('VITE_COLOR_SHADOW_BLUE', 'rgba(59, 130, 246, 0.3)'),
    purple: getEnv('VITE_COLOR_SHADOW_PURPLE', 'rgba(139, 92, 246, 0.3)'),
    dark: getEnv('VITE_COLOR_SHADOW_DARK', 'rgba(0, 0, 0, 0.5)'),
    white: getEnv('VITE_COLOR_SHADOW_WHITE', 'rgba(255, 255, 255, 0.05)'),
  },
} as const;

// RGBA color utilities for dynamic alpha values
export const RGBA = {
  emerald: (alpha: number) => hexToRgba(COLORS.primary.emerald, alpha),
  blue: (alpha: number) => hexToRgba(COLORS.primary.blue, alpha),
  purple: (alpha: number) => hexToRgba(COLORS.primary.purple, alpha),
  indigo: (alpha: number) => hexToRgba(COLORS.primary.indigo, alpha),
  slate: {
    50: (alpha: number) => hexToRgba(COLORS.slate[50], alpha),
    100: (alpha: number) => hexToRgba(COLORS.slate[100], alpha),
    200: (alpha: number) => hexToRgba(COLORS.slate[200], alpha),
    300: (alpha: number) => hexToRgba(COLORS.slate[300], alpha),
    400: (alpha: number) => hexToRgba(COLORS.slate[400], alpha),
    500: (alpha: number) => hexToRgba(COLORS.slate[500], alpha),
    600: (alpha: number) => hexToRgba(COLORS.slate[600], alpha),
    700: (alpha: number) => hexToRgba(COLORS.slate[700], alpha),
    800: (alpha: number) => hexToRgba(COLORS.slate[800], alpha),
    900: (alpha: number) => hexToRgba(COLORS.slate[900], alpha),
  },
  white: (alpha: number) => `rgba(255, 255, 255, ${alpha})`,
  black: (alpha: number) => `rgba(0, 0, 0, ${alpha})`,
} as const;

export type ThemeColors = typeof COLORS;

// Default export for convenience
export default COLORS;
