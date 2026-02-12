/**
 * Search Configuration Module
 * Flexy: Eliminating hardcoded search regions and timeframes!
 * 
 * All search configuration is now customizable via environment variables
 */

import { getEnv, getEnvArray } from '../utils/envUtils';

/**
 * Search region configuration
 */
export interface SearchRegionConfig {
  readonly REGIONS: string[];
  readonly DEFAULT_REGION: string;
  readonly STANDARD_REGION: string;
}

/**
 * Search timeframe configuration
 */
export interface SearchTimeframeConfig {
  readonly TIMEFRAMES: string[];
  readonly DEFAULT_TIMEFRAME: string;
  readonly STANDARD_TIMEFRAME: string;
  readonly DEEP_MODE_DEFAULT: boolean;
}

/**
 * Search display configuration
 */
export interface SearchDisplayConfig {
  readonly HISTORY_MAX: number;
  readonly HISTORY_DROPDOWN: number;
  readonly DEBOUNCE_MS: number;
}

/**
 * Default search regions - Flexy: Now configurable!
 */
const DEFAULT_REGIONS = [
  'Global',
  'Indonesia', 
  'USA',
  'Europe',
  'Asia',
];

/**
 * Default search timeframes - Flexy: Now configurable!
 * Format can be: "Label:value" or just "value"
 */
const DEFAULT_TIMEFRAMES = [
  '24h',
  '7d',
  '30d',
  '90d',
];

/**
 * Parse timeframe config that may include labels
 * Format: "Label:value,Label2:value2" or "value1,value2"
 * Returns array of just the values
 */
const parseTimeframeValues = (config: string): string[] => {
  if (!config) return DEFAULT_TIMEFRAMES;
  
  return config.split(',').map(item => {
    const parts = item.split(':');
    // If format is "Label:value", return value, else return the whole item
    return parts.length > 1 ? parts[parts.length - 1].trim() : item.trim();
  }).filter(Boolean);
};

/**
 * Search regions configuration
 * Flexy: No more hardcoded regions!
 */
export const SEARCH_REGIONS: SearchRegionConfig = {
  REGIONS: getEnvArray('VITE_SEARCH_REGIONS', DEFAULT_REGIONS),
  DEFAULT_REGION: getEnv('VITE_SEARCH_DEFAULT_REGION', 'Global'),
  STANDARD_REGION: getEnv('VITE_SEARCH_STANDARD_REGION', 'Global'),
};

/**
 * Search timeframes configuration
 * Flexy: No more hardcoded timeframes!
 */
export const SEARCH_TIMEFRAMES: SearchTimeframeConfig = {
  TIMEFRAMES: parseTimeframeValues(
    getEnv('VITE_SEARCH_TIMEFRAMES', DEFAULT_TIMEFRAMES.join(','))
  ),
  DEFAULT_TIMEFRAME: getEnv('VITE_SEARCH_DEFAULT_TIMEFRAME', '30d'),
  STANDARD_TIMEFRAME: getEnv('VITE_SEARCH_STANDARD_TIMEFRAME', '30d'),
  DEEP_MODE_DEFAULT: getEnv('VITE_SEARCH_DEFAULT_DEEP_MODE', 'false') === 'true',
};

/**
 * Search display configuration
 * Flexy: No more hardcoded display limits!
 */
export const SEARCH_DISPLAY: SearchDisplayConfig = {
  HISTORY_MAX: parseInt(getEnv('VITE_DISPLAY_SEARCH_HISTORY_MAX', '5')),
  HISTORY_DROPDOWN: parseInt(getEnv('VITE_DISPLAY_SEARCH_HISTORY_DROPDOWN', '3')),
  DEBOUNCE_MS: parseInt(getEnv('VITE_UI_DEBOUNCE_SEARCH_MS', '300')),
};

/**
 * Validates if a region is in the configured list
 * Flexy: Runtime validation instead of hardcoded union types!
 * 
 * @param region - The region to validate
 * @returns boolean indicating if the region is valid
 */
export const isValidSearchRegion = (region: string): boolean => {
  return SEARCH_REGIONS.REGIONS.includes(region);
};

/**
 * Validates if a timeframe is in the configured list
 * Flexy: Runtime validation instead of hardcoded union types!
 * 
 * @param timeframe - The timeframe to validate
 * @returns boolean indicating if the timeframe is valid
 */
export const isValidSearchTimeframe = (timeframe: string): boolean => {
  return SEARCH_TIMEFRAMES.TIMEFRAMES.includes(timeframe);
};

/**
 * Gets all available regions
 * @returns Array of configured regions
 */
export const getAvailableRegions = (): string[] => [...SEARCH_REGIONS.REGIONS];

/**
 * Gets all available timeframes
 * @returns Array of configured timeframes
 */
export const getAvailableTimeframes = (): string[] => [...SEARCH_TIMEFRAMES.TIMEFRAMES];

// Re-export for convenience
export { getEnv, getEnvArray };
