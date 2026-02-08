/**
 * Storage Keys and Configuration for Persistence
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

export const STORAGE_KEYS = {
  RESEARCH_STATE: getEnv('VITE_STORAGE_KEY_RESEARCH_STATE', 'trendventures_state_v1'),
  PROJECT_LIBRARY: getEnv('VITE_STORAGE_KEY_PROJECT_LIBRARY', 'trendventures_library_v1'),
  SEARCH_HISTORY: getEnv('VITE_STORAGE_KEY_SEARCH_HISTORY', 'trendventures_search_history'),
  TELEMETRY_LOGS: getEnv('VITE_STORAGE_KEY_TELEMETRY_LOGS', 'trendventures_sys_logs_v1')
} as const;

export const ASSET_CONFIG = {
  KEY_PREFIX: getEnv('VITE_STORAGE_ASSET_KEY_PREFIX', 'search_image_'),
  MAX_SIZE_MB: getEnvNumber('VITE_STORAGE_ASSET_MAX_SIZE_MB', 5),
} as const;

export const PERSISTENCE_CONFIG = {
  SAVE_DELAY_MS: getEnvNumber('VITE_STORAGE_SAVE_DELAY_MS', 5000),
  DB_NAME: getEnv('VITE_STORAGE_DB_NAME', 'trendventures_db'),
  ASSET_STORE: getEnv('VITE_STORAGE_ASSET_STORE', 'assets')
} as const;

// Default export for convenience
export default {
  STORAGE_KEYS,
  ASSET_CONFIG,
  PERSISTENCE_CONFIG,
};
