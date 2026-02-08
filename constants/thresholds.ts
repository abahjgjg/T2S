/**
 * Thresholds Configuration
 * Centralized configuration for business logic thresholds and magic numbers
 * Flexy: Eliminating hardcoded threshold values throughout the application
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

export const TREND_THRESHOLDS = {
  // Hot trend detection
  HOT_TREND_MIN_GROWTH: getEnvNumber('VITE_THRESHOLD_HOT_TREND_MIN_GROWTH', 80),
  
  // Relevance scoring
  HIGH_RELEVANCE: getEnvNumber('VITE_THRESHOLD_HIGH_RELEVANCE', 70),
  MEDIUM_RELEVANCE: getEnvNumber('VITE_THRESHOLD_MEDIUM_RELEVANCE', 40),
  LOW_RELEVANCE: getEnvNumber('VITE_THRESHOLD_LOW_RELEVANCE', 20),
  
  // Impact scoring
  HIGH_IMPACT: getEnvNumber('VITE_THRESHOLD_HIGH_IMPACT', 75),
  MEDIUM_IMPACT: getEnvNumber('VITE_THRESHOLD_MEDIUM_IMPACT', 50),
  LOW_IMPACT: getEnvNumber('VITE_THRESHOLD_LOW_IMPACT', 25),
} as const;

export const ANALYSIS_THRESHOLDS = {
  // Confidence levels
  HIGH_CONFIDENCE: getEnvNumber('VITE_THRESHOLD_HIGH_CONFIDENCE', 0.8),
  MEDIUM_CONFIDENCE: getEnvNumber('VITE_THRESHOLD_MEDIUM_CONFIDENCE', 0.6),
  LOW_CONFIDENCE: getEnvNumber('VITE_THRESHOLD_LOW_CONFIDENCE', 0.4),
  
  // Data quality
  MIN_SOURCES_REQUIRED: getEnvNumber('VITE_THRESHOLD_MIN_SOURCES_REQUIRED', 2),
  MAX_SOURCES_DISPLAY: getEnvNumber('VITE_THRESHOLD_MAX_SOURCES_DISPLAY', 5),
} as const;

export const PAGINATION = {
  // Default items per page
  DEFAULT_PAGE_SIZE: getEnvNumber('VITE_PAGINATION_DEFAULT_PAGE_SIZE', 20),
  
  // Load more increment
  LOAD_MORE_INCREMENT: getEnvNumber('VITE_PAGINATION_LOAD_MORE_INCREMENT', 20),
  
  // Featured items
  FEATURED_LIMIT: getEnvNumber('VITE_PAGINATION_FEATURED_LIMIT', 6),
  
  // Maximum allowed
  MAX_PAGE_SIZE: getEnvNumber('VITE_PAGINATION_MAX_PAGE_SIZE', 100),
} as const;

export const SCORING = {
  // Score ranges
  EXCELLENT: getEnvNumber('VITE_SCORING_EXCELLENT', 90),
  VERY_GOOD: getEnvNumber('VITE_SCORING_VERY_GOOD', 80),
  GOOD: getEnvNumber('VITE_SCORING_GOOD', 70),
  AVERAGE: getEnvNumber('VITE_SCORING_AVERAGE', 60),
  BELOW_AVERAGE: getEnvNumber('VITE_SCORING_BELOW_AVERAGE', 50),
  POOR: getEnvNumber('VITE_SCORING_POOR', 40),
} as const;

export const isHotTrend = (growthScore?: number): boolean => {
  return (growthScore || 0) > TREND_THRESHOLDS.HOT_TREND_MIN_GROWTH;
};

export const getRelevanceLevel = (score: number): 'high' | 'medium' | 'low' => {
  if (score >= TREND_THRESHOLDS.HIGH_RELEVANCE) return 'high';
  if (score >= TREND_THRESHOLDS.MEDIUM_RELEVANCE) return 'medium';
  return 'low';
};

export type TrendThresholds = typeof TREND_THRESHOLDS;
export type AnalysisThresholds = typeof ANALYSIS_THRESHOLDS;
export type PaginationThresholds = typeof PAGINATION;
export type ScoringThresholds = typeof SCORING;

// Default export for convenience
export default {
  TREND_THRESHOLDS,
  ANALYSIS_THRESHOLDS,
  PAGINATION,
  SCORING,
  isHotTrend,
  getRelevanceLevel,
};
