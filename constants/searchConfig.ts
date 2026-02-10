/**
 * Search Configuration
 * Centralized configuration for search regions, timeframes, and defaults
 * Flexy: Uses centralized env utilities for modularity
 * All values can be overridden via environment variables.
 */

import { SearchRegion, SearchTimeframe } from '../types';
import { getEnv, getEnvBoolean } from '../utils/envUtils';

// Parse regions from env or use defaults
const parseRegions = (): SearchRegion[] => {
  const envRegions = getEnv('VITE_SEARCH_REGIONS', '');
  if (envRegions) {
    return envRegions.split(',').map(r => r.trim() as SearchRegion);
  }
  return ['Global', 'USA', 'Indonesia', 'Europe', 'Asia'];
};

// Parse timeframes from env or use defaults
const parseTimeframes = (): { label: string; value: SearchTimeframe }[] => {
  const envTimeframes = getEnv('VITE_SEARCH_TIMEFRAMES', '');
  if (envTimeframes) {
    return envTimeframes.split(',').map(t => {
      const [label, value] = t.trim().split(':');
      return { label: label || value, value: value as SearchTimeframe };
    });
  }
  return [
    { label: '24 Hours', value: '24h' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' }
  ];
};

export const REGIONS: SearchRegion[] = parseRegions();

export const TIMEFRAMES: { label: string; value: SearchTimeframe }[] = parseTimeframes();

// Default search configuration - centralized to avoid hardcoded values
export const DEFAULT_SEARCH_CONFIG = {
  REGION: getEnv('VITE_SEARCH_DEFAULT_REGION', 'Global') as SearchRegion,
  TIMEFRAME: getEnv('VITE_SEARCH_DEFAULT_TIMEFRAME', '30d') as SearchTimeframe,
  DEEP_MODE: getEnvBoolean('VITE_SEARCH_DEFAULT_DEEP_MODE', false),
} as const;

// Cache configuration for standard searches
export const STANDARD_SEARCH_CONFIG = {
  REGION: getEnv('VITE_SEARCH_STANDARD_REGION', 'Global') as SearchRegion,
  TIMEFRAME: getEnv('VITE_SEARCH_STANDARD_TIMEFRAME', '30d') as SearchTimeframe,
} as const;

// Default export for convenience
export default {
  REGIONS,
  TIMEFRAMES,
  DEFAULT_SEARCH_CONFIG,
  STANDARD_SEARCH_CONFIG,
};
