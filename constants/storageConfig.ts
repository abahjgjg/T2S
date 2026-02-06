
/**
 * Storage Keys and Configuration for Persistence
 */

export const STORAGE_KEYS = {
  RESEARCH_STATE: 'trendventures_state_v1',
  PROJECT_LIBRARY: 'trendventures_library_v1',
  SEARCH_HISTORY: 'trendventures_search_history',
  TELEMETRY_LOGS: 'trendventures_sys_logs_v1'
} as const;

export const ASSET_CONFIG = {
  KEY_PREFIX: 'search_image_',
  MAX_SIZE_MB: 5,
} as const;

export const PERSISTENCE_CONFIG = {
  SAVE_DELAY_MS: 5000,
  DB_NAME: 'trendventures_db',
  ASSET_STORE: 'assets'
} as const;
