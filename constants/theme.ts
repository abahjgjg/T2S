/**
 * Theme Colors Configuration
 * Centralized color palette for consistent theming across the application
 * All values can be overridden via environment variables.
 */

// Helper to safely get env var with fallback
const getEnv = (key: string, defaultValue: string): string => {
  const value = (import.meta as unknown as Record<string, Record<string, string>>)?.env?.[key] 
    ?? (typeof process !== 'undefined' ? process.env?.[key] : undefined);
  return value || defaultValue;
};

export const COLORS = {
  // Primary brand colors
  primary: {
    emerald: getEnv('VITE_COLOR_PRIMARY_EMERALD', '#10b981'),
    blue: getEnv('VITE_COLOR_PRIMARY_BLUE', '#3b82f6'),
    purple: getEnv('VITE_COLOR_PRIMARY_PURPLE', '#8b5cf6'),
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
} as const;

export type ThemeColors = typeof COLORS;

// Default export for convenience
export default COLORS;
