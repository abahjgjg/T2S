
/**
 * Theme Colors Configuration
 * Centralized color palette for consistent theming across the application
 */

export const COLORS = {
  // Primary brand colors
  primary: {
    emerald: '#10b981',
    blue: '#3b82f6',
    purple: '#8b5cf6',
  },
  
  // Semantic colors
  sentiment: {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#3b82f6',
  },
  
  // Chart colors
  chart: {
    grid: '#1e293b',
    axis: '#64748b',
    axisLabel: '#64748b',
    tooltipBg: '#0f172a',
    tooltipBorder: '#334155',
    tooltipText: '#f8fafc',
    cursor: '#1e293b',
    bar1: '#3b82f6',
    bar2: '#10b981',
    cell1: '#8b5cf6',
  },
  
  // UI colors (Tailwind slate palette)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  
  // Status colors
  status: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
} as const;

export type ThemeColors = typeof COLORS;
