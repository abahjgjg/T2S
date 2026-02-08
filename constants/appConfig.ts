
/**
 * Application Configuration
 * Centralized configuration for app URLs, SEO, and global settings
 */

export const APP_URLS = {
  BASE: 'https://trendventures.ai',
  ADMIN: 'https://trendventures.ai/admin',
} as const;

export const SEO_CONFIG = {
  DEFAULT_TITLE: 'TrendVentures AI | Market Research Suite',
  DEFAULT_DESCRIPTION: 'Generate comprehensive business blueprints and revenue models with AI-powered market intelligence. Transform ideas into actionable strategies.',
  OG_IMAGE_WIDTH: 1200,
  OG_IMAGE_HEIGHT: 630,
} as const;

export const getOgImageUrl = (text: string = 'TrendVentures+AI'): string => {
  const { BASE_URL, DEFAULT_BG, DEFAULT_TEXT_COLOR } = PLACEHOLDER_CONFIG;
  return `${BASE_URL}/${SEO_CONFIG.OG_IMAGE_WIDTH}x${SEO_CONFIG.OG_IMAGE_HEIGHT}/${DEFAULT_BG}/${DEFAULT_TEXT_COLOR}?text=${text}&font=roboto`;
};

// Import for the function above
import { PLACEHOLDER_CONFIG } from './apiConfig';

export const STORAGE_CONFIG = {
  CACHE_TTL: 3600, // 1 hour in seconds
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
} as const;

export const TELEMETRY_CONFIG = {
  MAX_LOGS: 50,
  FLUSH_INTERVAL_MS: 30000,
} as const;

export const AUDIO_CONSTANTS = {
  INT16_MAX: 32768.0,
  INT16_MIN: -32768.0,
  SAMPLE_RATE: 24000,
} as const;

export const LIVE_AUDIO_CONFIG = {
  MERGE_WINDOW_MS: 3000,
  BUFFER_SIZE: 2048,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  // Default stale time for React Query (5 minutes in milliseconds)
  DEFAULT_STALE_TIME_MS: 1000 * 60 * 5,
  // Default cache time
  DEFAULT_CACHE_TIME_MS: 1000 * 60 * 10,
} as const;

// Validation Configuration
export const VALIDATION_CONFIG = {
  // Maximum search input length
  MAX_SEARCH_LENGTH: 150,
  // Maximum prompt length for internal variables
  MAX_PROMPT_LENGTH: 2000,
} as const;

// Development Configuration
export const DEV_CONFIG = {
  // Default development server port
  DEFAULT_PORT: 3000,
  // Default reload delay after settings change
  RELOAD_DELAY_MS: 1000,
} as const;

// Asset ID Prefix Configuration
export const ASSET_ID_PREFIX = {
  SEARCH: 'search-',
  BLUEPRINT: 'blueprint-',
  USER: 'user-',
  TEMP: 'temp-',
} as const;
