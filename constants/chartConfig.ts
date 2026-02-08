
/**
 * Chart Configuration
 * Centralized configuration for chart defaults, ranges, and styling
 * Flexy: Eliminating hardcoded chart values throughout the application
 */

export const CHART_RANGES = {
  // Score ranges (0-100)
  SCORE: {
    min: 0,
    max: 100,
    default: 50,
  },
  
  // Growth/hype ranges
  GROWTH: {
    min: 0,
    max: 100,
    default: 50,
  },
  
  // Impact scatter size range
  IMPACT_SIZE: {
    min: 50,
    max: 400,
  },
  
  // Bar chart radius
  BAR_RADIUS: [0, 4, 4, 0] as [number, number, number, number],
  BAR_SIZE: 20,
} as const;

export const CHART_MARGINS = {
  DEFAULT: { top: 5, right: 30, left: 20, bottom: 5 },
  SCATTER: { top: 20, right: 20, bottom: 20, left: 20 },
  TIMELINE: { top: 10, right: 10, bottom: 10, left: 10 },
} as const;

export const CHART_GRID = {
  strokeDasharray: '3 3',
  horizontal: true,
  vertical: false,
} as const;

export const CHART_AXIS = {
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

export const CHART_HEIGHTS = {
  TREND_ANALYSIS: 300,
  TIMELINE: 400,
  SCATTER: 350,
} as const;

export type ChartRanges = typeof CHART_RANGES;
export type ChartMargins = typeof CHART_MARGINS;
