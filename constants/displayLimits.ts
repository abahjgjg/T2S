/**
 * Display Limits Configuration
 * Centralized limits for truncation, slicing, and display counts
 * Flexy: Uses centralized env utilities for modularity
 * All values can be overridden via environment variables.
 */

import { getEnv, getEnvNumber } from '../utils/envUtils';

// Text truncation limits
export const TEXT_TRUNCATION = {
  short: getEnvNumber('VITE_TRUNCATE_SHORT', 50),
  medium: getEnvNumber('VITE_TRUNCATE_MEDIUM', 100),
  long: getEnvNumber('VITE_TRUNCATE_LONG', 150),
  description: getEnvNumber('VITE_TRUNCATE_DESCRIPTION', 200),
  error: getEnvNumber('VITE_TRUNCATE_ERROR', 50),
  niche: getEnvNumber('VITE_TRUNCATE_NICHE', 20),
  insight: getEnvNumber('VITE_TRUNCATE_INSIGHT', 150),
} as const;

// List display limits
export const DISPLAY_LIMITS = {
  // Domain and source lists
  domains: {
    stats: getEnvNumber('VITE_LIMIT_DOMAIN_STATS', 3),
    trusted: getEnvNumber('VITE_LIMIT_TRUSTED_DOMAINS', 10),
  },
  // Blueprint items
  blueprint: {
    tasks: getEnvNumber('VITE_LIMIT_BLUEPRINT_TASKS', 3),
    tools: getEnvNumber('VITE_LIMIT_BLUEPRINT_TOOLS', 3),
    agents: getEnvNumber('VITE_LIMIT_BLUEPRINT_AGENTS', 5),
    opportunities: getEnvNumber('VITE_LIMIT_BLUEPRINT_OPPORTUNITIES', 6),
  },
  // Analytics and charts
  analytics: {
    dataPoints: getEnvNumber('VITE_LIMIT_ANALYTICS_POINTS', 10),
    historyDays: getEnvNumber('VITE_LIMIT_ANALYTICS_HISTORY_DAYS', 30),
  },
  // Search results
  search: {
    trends: getEnvNumber('VITE_LIMIT_SEARCH_TRENDS', 5),
    ideas: getEnvNumber('VITE_LIMIT_SEARCH_IDEAS', 10),
    suggestions: getEnvNumber('VITE_LIMIT_SEARCH_SUGGESTIONS', 5),
  },
  // News and content
  content: {
    newsItems: getEnvNumber('VITE_LIMIT_CONTENT_NEWS', 5),
    relatedLinks: getEnvNumber('VITE_LIMIT_CONTENT_RELATED', 5),
  },
  // Admin panel
  admin: {
    logs: getEnvNumber('VITE_LIMIT_ADMIN_LOGS', 100),
    leads: getEnvNumber('VITE_LIMIT_ADMIN_LEADS', 50),
    affiliates: getEnvNumber('VITE_LIMIT_ADMIN_AFFILIATES', 20),
  },
} as const;

// Coordinate precision
export const COORDINATE_PRECISION = {
  latitude: getEnvNumber('VITE_COORD_PRECISION_LAT', 4),
  longitude: getEnvNumber('VITE_COORD_PRECISION_LONG', 4),
} as const;

// Date formatting limits
export const DATE_LIMITS = {
  filenameDateSlice: getEnvNumber('VITE_DATE_FILENAME_SLICE', 10),
  displayDateFormat: getEnv('VITE_DATE_DISPLAY_FORMAT', 'MMM dd, yyyy'),
} as const;

// Canvas dimensions
export const CANVAS_DIMENSIONS = {
  audioVisualizer: {
    width: getEnvNumber('VITE_CANVAS_AUDIO_WIDTH', 300),
    height: getEnvNumber('VITE_CANVAS_AUDIO_HEIGHT', 60),
  },
} as const;

// Slider configuration ranges
export const SLIDER_RANGES = {
  conversion: {
    min: getEnvNumber('VITE_SLIDER_CONVERSION_MIN', 0.5),
    max: getEnvNumber('VITE_SLIDER_CONVERSION_MAX', 5.0),
    step: getEnvNumber('VITE_SLIDER_CONVERSION_STEP', 0.1),
    default: getEnvNumber('VITE_SLIDER_CONVERSION_DEFAULT', 2.0),
  },
  price: {
    min: getEnvNumber('VITE_SLIDER_PRICE_MIN', 0.5),
    max: getEnvNumber('VITE_SLIDER_PRICE_MAX', 3.0),
    step: getEnvNumber('VITE_SLIDER_PRICE_STEP', 0.1),
    default: getEnvNumber('VITE_SLIDER_PRICE_DEFAULT', 1.5),
  },
} as const;

// Score thresholds
export const SCORE_THRESHOLDS = {
  excellent: getEnvNumber('VITE_SCORE_EXCELLENT', 80),
  good: getEnvNumber('VITE_SCORE_GOOD', 60),
  average: getEnvNumber('VITE_SCORE_AVERAGE', 50),
  poor: getEnvNumber('VITE_SCORE_POOR', 40),
} as const;

// Gradient offsets
export const GRADIENT_OFFSETS = {
  start: getEnv('VITE_GRADIENT_OFFSET_START', '5%'),
  end: getEnv('VITE_GRADIENT_OFFSET_END', '95%'),
} as const;

// Favicon configuration
export const FAVICON_CONFIG = {
  size: getEnvNumber('VITE_FAVICON_SIZE', 64),
  serviceUrl: getEnv('VITE_FAVICON_SERVICE', 'https://www.google.com/s2/favicons'),
} as const;

// Default export for convenience
export default {
  TEXT_TRUNCATION,
  DISPLAY_LIMITS,
  COORDINATE_PRECISION,
  DATE_LIMITS,
  CANVAS_DIMENSIONS,
  SLIDER_RANGES,
  SCORE_THRESHOLDS,
  GRADIENT_OFFSETS,
  FAVICON_CONFIG,
};
