
/**
 * Thresholds Configuration
 * Centralized configuration for business logic thresholds and magic numbers
 * Flexy: Eliminating hardcoded threshold values throughout the application
 */

export const TREND_THRESHOLDS = {
  // Hot trend detection
  HOT_TREND_MIN_GROWTH: 80,
  
  // Relevance scoring
  HIGH_RELEVANCE: 70,
  MEDIUM_RELEVANCE: 40,
  LOW_RELEVANCE: 20,
  
  // Impact scoring
  HIGH_IMPACT: 75,
  MEDIUM_IMPACT: 50,
  LOW_IMPACT: 25,
} as const;

export const ANALYSIS_THRESHOLDS = {
  // Confidence levels
  HIGH_CONFIDENCE: 0.8,
  MEDIUM_CONFIDENCE: 0.6,
  LOW_CONFIDENCE: 0.4,
  
  // Data quality
  MIN_SOURCES_REQUIRED: 2,
  MAX_SOURCES_DISPLAY: 5,
} as const;

export const PAGINATION = {
  // Default items per page
  DEFAULT_PAGE_SIZE: 20,
  
  // Load more increment
  LOAD_MORE_INCREMENT: 20,
  
  // Featured items
  FEATURED_LIMIT: 6,
  
  // Maximum allowed
  MAX_PAGE_SIZE: 100,
} as const;

export const SCORING = {
  // Score ranges
  EXCELLENT: 90,
  VERY_GOOD: 80,
  GOOD: 70,
  AVERAGE: 60,
  BELOW_AVERAGE: 50,
  POOR: 40,
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
