/**
 * Application Configuration
 * Centralized configuration for app URLs, SEO, and global settings
 * 
 * All values can be overridden via environment variables.
 * @deprecated Use config/index.ts instead for direct access to environment-aware configuration
 */

import {
  APP_CONFIG,
  APP_URLS,
  SEO_CONFIG,
  STORAGE_CONFIG,
  TELEMETRY_CONFIG,
  AUDIO_CONSTANTS,
  LIVE_AUDIO_CONFIG,
  CACHE_CONFIG,
  VALIDATION_CONFIG,
  DEV_CONFIG,
  ASSET_ID_PREFIX,
  SCROLL_CONFIG,
  getOgImageUrl,
  PLACEHOLDER_CONFIG,
} from '../config';

// Re-export for backward compatibility
export {
  APP_URLS,
  SEO_CONFIG,
  STORAGE_CONFIG,
  TELEMETRY_CONFIG,
  AUDIO_CONSTANTS,
  LIVE_AUDIO_CONFIG,
  CACHE_CONFIG,
  VALIDATION_CONFIG,
  DEV_CONFIG,
  ASSET_ID_PREFIX,
  SCROLL_CONFIG,
  getOgImageUrl,
  APP_CONFIG,
};

// Default export for convenience
export default APP_CONFIG;
