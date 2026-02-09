/**
 * Chart Configuration
 * Centralized configuration for chart defaults, ranges, and styling
 * Flexy: Eliminating hardcoded chart values throughout the application
 * All values can be overridden via environment variables.
 */

import { COLORS } from './theme';

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

// Parse array from env
const parseArray = <T>(key: string, defaultValue: T[]): T[] => {
  const envValue = getEnv(key, '');
  if (envValue) {
    try {
      return JSON.parse(envValue);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

// Parse tuple from env for specific array shapes
const parseTuple = (key: string, defaultValue: [number, number, number, number]): [number, number, number, number] => {
  const envValue = getEnv(key, '');
  if (envValue) {
    try {
      const parsed = JSON.parse(envValue);
      if (Array.isArray(parsed) && parsed.length === 4 && parsed.every((n: unknown) => typeof n === 'number')) {
        return parsed as [number, number, number, number];
      }
    } catch {
      // Fall through to default
    }
  }
  return defaultValue;
};

// Chart color scheme using theme colors
export const CHART_COLORS = {
  // Primary data series colors
  primary: [
    COLORS.primary.blue,
    COLORS.primary.emerald,
    COLORS.primary.purple,
    COLORS.primary.indigo,
  ],
  // Semantic colors for data representation
  semantic: {
    positive: COLORS.sentiment.positive,
    negative: COLORS.sentiment.negative,
    neutral: COLORS.sentiment.neutral,
  },
  // Chart element colors
  elements: {
    grid: COLORS.chart.grid,
    axis: COLORS.chart.axis,
    axisLabel: COLORS.chart.axisLabel,
    tooltipBg: COLORS.chart.tooltipBg,
    tooltipBorder: COLORS.chart.tooltipBorder,
    tooltipText: COLORS.chart.tooltipText,
    cursor: COLORS.chart.cursor,
  },
  // Bar chart colors
  bars: {
    primary: COLORS.chart.bar1,
    secondary: COLORS.chart.bar2,
    alternate: [COLORS.primary.emerald, COLORS.primary.blue],
  },
  // Area/Line chart colors
  area: {
    stroke: COLORS.primary.emerald,
    fillStart: COLORS.primary.emerald,
    fillOpacity: {
      start: 0.3,
      end: 0,
    },
  },
  // Cell colors for pie/donut charts
  cells: {
    primary: COLORS.chart.cell1,
    secondary: COLORS.chart.cell2,
  },
  // Stroke colors for polar/radar charts
  stroke: {
    grid: COLORS.chart.stroke1,
    axis: COLORS.chart.stroke2,
  },
} as const;

export const CHART_RANGES = {
  // Score ranges (0-100)
  SCORE: {
    min: getEnvNumber('VITE_CHART_SCORE_MIN', 0),
    max: getEnvNumber('VITE_CHART_SCORE_MAX', 100),
    default: getEnvNumber('VITE_CHART_SCORE_DEFAULT', 50),
  },
  
  // Growth/hype ranges
  GROWTH: {
    min: getEnvNumber('VITE_CHART_GROWTH_MIN', 0),
    max: getEnvNumber('VITE_CHART_GROWTH_MAX', 100),
    default: getEnvNumber('VITE_CHART_GROWTH_DEFAULT', 50),
  },
  
  // Impact scatter size range
  IMPACT_SIZE: {
    min: getEnvNumber('VITE_CHART_IMPACT_SIZE_MIN', 50),
    max: getEnvNumber('VITE_CHART_IMPACT_SIZE_MAX', 400),
  },
  
  // Bar chart radius
  BAR_RADIUS: parseTuple('VITE_CHART_BAR_RADIUS', [0, 4, 4, 0]),
  BAR_SIZE: getEnvNumber('VITE_CHART_BAR_SIZE', 20),
} as const;

export const CHART_MARGINS = {
  DEFAULT: { 
    top: getEnvNumber('VITE_CHART_MARGIN_DEFAULT_TOP', 5), 
    right: getEnvNumber('VITE_CHART_MARGIN_DEFAULT_RIGHT', 30), 
    left: getEnvNumber('VITE_CHART_MARGIN_DEFAULT_LEFT', 20), 
    bottom: getEnvNumber('VITE_CHART_MARGIN_DEFAULT_BOTTOM', 5) 
  },
  SCATTER: { 
    top: getEnvNumber('VITE_CHART_MARGIN_SCATTER_TOP', 20), 
    right: getEnvNumber('VITE_CHART_MARGIN_SCATTER_RIGHT', 20), 
    bottom: getEnvNumber('VITE_CHART_MARGIN_SCATTER_BOTTOM', 20), 
    left: getEnvNumber('VITE_CHART_MARGIN_SCATTER_LEFT', 20) 
  },
  TIMELINE: { 
    top: getEnvNumber('VITE_CHART_MARGIN_TIMELINE_TOP', 10), 
    right: getEnvNumber('VITE_CHART_MARGIN_TIMELINE_RIGHT', 10), 
    bottom: getEnvNumber('VITE_CHART_MARGIN_TIMELINE_BOTTOM', 10), 
    left: getEnvNumber('VITE_CHART_MARGIN_TIMELINE_LEFT', 10) 
  },
} as const;

export const CHART_GRID = {
  strokeDasharray: getEnv('VITE_CHART_GRID_STROKE_DASHARRAY', '3 3'),
  horizontal: getEnv('VITE_CHART_GRID_HORIZONTAL', 'true') === 'true',
  vertical: getEnv('VITE_CHART_GRID_VERTICAL', 'false') === 'true',
} as const;

export const CHART_AXIS = {
  fontSize: getEnvNumber('VITE_CHART_AXIS_FONT_SIZE', 12),
  tickLine: getEnv('VITE_CHART_AXIS_TICK_LINE', 'false') === 'true',
  axisLine: getEnv('VITE_CHART_AXIS_AXIS_LINE', 'false') === 'true',
} as const;

export const CHART_HEIGHTS = {
  TREND_ANALYSIS: getEnvNumber('VITE_CHART_HEIGHT_TREND_ANALYSIS', 300),
  TIMELINE: getEnvNumber('VITE_CHART_HEIGHT_TIMELINE', 400),
  SCATTER: getEnvNumber('VITE_CHART_HEIGHT_SCATTER', 350),
} as const;

export type ChartRanges = typeof CHART_RANGES;
export type ChartMargins = typeof CHART_MARGINS;

// Default export for convenience
export default {
  CHART_RANGES,
  CHART_MARGINS,
  CHART_GRID,
  CHART_AXIS,
  CHART_HEIGHTS,
};
