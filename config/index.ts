/**
 * Config Loader Module
 * Loads configuration from environment variables with sensible defaults
 * This is the central configuration hub - all config values should be imported from here
 */

// Type definitions for configuration
export interface ApiConfig {
  readonly ENDPOINTS: {
    readonly OPENAI: {
      readonly CHAT: string;
      readonly SPEECH: string;
      readonly IMAGES: string;
    };
    readonly EXTERNAL: {
      readonly FAVICON: string;
    };
  };
  readonly TOKEN_LIMITS: {
    readonly MAX_OUTPUT: number;
    readonly DEFAULT_OUTPUT: number;
    readonly MINIMAL_OUTPUT: number;
  };
  readonly THINKING_BUDGETS: {
    readonly COMPLEX: number;
    readonly STANDARD: number;
    readonly FAST: number;
    readonly MINIMAL: number;
  };
  readonly AI_TEMPERATURES: {
    readonly DEFAULT: number;
    readonly CREATIVE: number;
    readonly PRECISE: number;
    readonly BALANCED: number;
  };
  readonly RESPONSE_FORMATS: {
    readonly BASE64: string;
    readonly URL: string;
    readonly JSON: string;
  };
  readonly VOICE_NAMES: {
    readonly DEFAULT: string;
    readonly ALTERNATE: string;
    readonly FEMALE: string;
    readonly MALE: string;
  };
  readonly IMAGE_SIZES: {
    readonly SQUARE: string;
    readonly LANDSCAPE: string;
    readonly PORTRAIT: string;
    readonly WIDE: string;
    readonly TALL: string;
  };
  readonly SPEECH_CONFIG: {
    readonly DEFAULT_LANG: string;
    readonly FALLBACK_LANG: string;
  };
  readonly PLACEHOLDER_CONFIG: {
    readonly BASE_URL: string;
    readonly DEFAULT_BG: string;
    readonly DEFAULT_TEXT: string;
    readonly DEFAULT_TEXT_COLOR: string;
  };
}

export interface AppConfig {
  readonly URLS: {
    readonly BASE: string;
    readonly ADMIN: string;
  };
  readonly BRAND: {
    readonly NAME: string;
    readonly NAME_HIGHLIGHT: string;
    readonly TAGLINE: string;
  };
  readonly SEO: {
    readonly DEFAULT_TITLE: string;
    readonly DEFAULT_DESCRIPTION: string;
    readonly OG_IMAGE_WIDTH: number;
    readonly OG_IMAGE_HEIGHT: number;
  };
  readonly STORAGE: {
    readonly CACHE_TTL: number;
    readonly MAX_FILE_SIZE_BYTES: number;
  };
  readonly TELEMETRY: {
    readonly MAX_LOGS: number;
    readonly FLUSH_INTERVAL_MS: number;
  };
  readonly AUDIO: {
    readonly INT16_MAX: number;
    readonly INT16_MIN: number;
    readonly SAMPLE_RATE: number;
  };
  readonly LIVE_AUDIO: {
    readonly MERGE_WINDOW_MS: number;
    readonly BUFFER_SIZE: number;
  };
  readonly CACHE: {
    readonly DEFAULT_STALE_TIME_MS: number;
    readonly DEFAULT_CACHE_TIME_MS: number;
  };
  readonly VALIDATION: {
    readonly MAX_SEARCH_LENGTH: number;
    readonly MAX_PROMPT_LENGTH: number;
  };
  readonly DEV: {
    readonly DEFAULT_PORT: number;
    readonly RELOAD_DELAY_MS: number;
    readonly BROWSER_ANALYZE_PORT: number;
  };
  readonly DATABASE: {
    readonly DB_NAME: string;
    readonly DB_VERSION: number;
    readonly STORE_NAME: string;
    readonly ASSETS_STORE_NAME: string;
  };
  readonly SUPABASE_STORAGE: {
    readonly BUCKET_NAME: string;
  };
  readonly TOAST: {
    readonly EVENT_NAME: string;
  };
  readonly ASSET_PREFIX: {
    readonly SEARCH: string;
    readonly BLUEPRINT: string;
    readonly USER: string;
    readonly TEMP: string;
  };
  readonly SCROLL: {
    readonly THRESHOLD: number;
    readonly TOP_POSITION: number;
  };
}

import { getEnv, getEnvNumber, getEnvBoolean } from '../utils/envUtils';

// API Configuration
export const API_CONFIG: ApiConfig = {
  ENDPOINTS: {
    OPENAI: {
      CHAT: getEnv('VITE_OPENAI_CHAT_ENDPOINT', 'https://api.openai.com/v1/chat/completions'),
      SPEECH: getEnv('VITE_OPENAI_SPEECH_ENDPOINT', 'https://api.openai.com/v1/audio/speech'),
      IMAGES: getEnv('VITE_OPENAI_IMAGES_ENDPOINT', 'https://api.openai.com/v1/images/generations'),
    },
    EXTERNAL: {
      FAVICON: getEnv('VITE_FAVICON_SERVICE_URL', 'https://www.google.com/s2/favicons'),
    },
  },
  TOKEN_LIMITS: {
    MAX_OUTPUT: getEnvNumber('VITE_MAX_OUTPUT_TOKENS', 32768),
    DEFAULT_OUTPUT: getEnvNumber('VITE_DEFAULT_OUTPUT_TOKENS', 8192),
    MINIMAL_OUTPUT: getEnvNumber('VITE_MINIMAL_OUTPUT_TOKENS', 1024),
  },
  THINKING_BUDGETS: {
    COMPLEX: getEnvNumber('VITE_COMPLEX_THINKING_BUDGET', 10240),
    STANDARD: getEnvNumber('VITE_STANDARD_THINKING_BUDGET', 2048),
    FAST: getEnvNumber('VITE_FAST_THINKING_BUDGET', 1024),
    MINIMAL: getEnvNumber('VITE_MINIMAL_THINKING_BUDGET', 256),
  },
  AI_TEMPERATURES: {
    DEFAULT: getEnvNumber('VITE_DEFAULT_TEMPERATURE', 0.7),
    CREATIVE: getEnvNumber('VITE_CREATIVE_TEMPERATURE', 0.9),
    PRECISE: getEnvNumber('VITE_PRECISE_TEMPERATURE', 0.2),
    BALANCED: getEnvNumber('VITE_BALANCED_TEMPERATURE', 0.5),
  },
  RESPONSE_FORMATS: {
    BASE64: getEnv('VITE_RESPONSE_FORMAT_BASE64', 'b64_json'),
    URL: getEnv('VITE_RESPONSE_FORMAT_URL', 'url'),
    JSON: getEnv('VITE_RESPONSE_FORMAT_JSON', 'json'),
  },
  VOICE_NAMES: {
    DEFAULT: getEnv('VITE_VOICE_DEFAULT', 'alloy'),
    ALTERNATE: getEnv('VITE_VOICE_ALTERNATE', 'echo'),
    FEMALE: getEnv('VITE_VOICE_FEMALE', 'nova'),
    MALE: getEnv('VITE_VOICE_MALE', 'onyx'),
  },
  IMAGE_SIZES: {
    SQUARE: getEnv('VITE_IMAGE_SIZE_SQUARE', '1024x1024'),
    LANDSCAPE: getEnv('VITE_IMAGE_SIZE_LANDSCAPE', '1024x768'),
    PORTRAIT: getEnv('VITE_IMAGE_SIZE_PORTRAIT', '768x1024'),
    WIDE: getEnv('VITE_IMAGE_SIZE_WIDE', '1792x1024'),
    TALL: getEnv('VITE_IMAGE_SIZE_TALL', '1024x1792'),
  },
  SPEECH_CONFIG: {
    DEFAULT_LANG: getEnv('VITE_SPEECH_DEFAULT_LANG', 'en-US'),
    FALLBACK_LANG: getEnv('VITE_SPEECH_FALLBACK_LANG', 'en'),
  },
  PLACEHOLDER_CONFIG: {
    BASE_URL: getEnv('VITE_PLACEHOLDER_BASE_URL', 'https://placehold.co'),
    DEFAULT_BG: getEnv('VITE_PLACEHOLDER_DEFAULT_BG', '0f172a'),
    DEFAULT_TEXT: getEnv('VITE_PLACEHOLDER_DEFAULT_TEXT', '10b981'),
    DEFAULT_TEXT_COLOR: getEnv('VITE_PLACEHOLDER_DEFAULT_TEXT_COLOR', 'f8fafc'),
  },
};

// Application Configuration
export const APP_CONFIG: AppConfig = {
  URLS: {
    BASE: getEnv('VITE_APP_BASE_URL', 'https://trendventures.ai'),
    ADMIN: getEnv('VITE_APP_ADMIN_URL', 'https://trendventures.ai/admin'),
  },
  BRAND: {
    NAME: getEnv('VITE_BRAND_NAME', 'TrendVentures'),
    NAME_HIGHLIGHT: getEnv('VITE_BRAND_NAME_HIGHLIGHT', 'AI'),
    TAGLINE: getEnv('VITE_BRAND_TAGLINE', 'Market Research Suite'),
  },
  SEO: {
    DEFAULT_TITLE: getEnv('VITE_APP_DEFAULT_TITLE', 'TrendVentures AI | Market Research Suite'),
    DEFAULT_DESCRIPTION: getEnv(
      'VITE_APP_DEFAULT_DESCRIPTION',
      'Generate comprehensive business blueprints and revenue models with AI-powered market intelligence. Transform ideas into actionable strategies.'
    ),
    OG_IMAGE_WIDTH: getEnvNumber('VITE_OG_IMAGE_WIDTH', 1200),
    OG_IMAGE_HEIGHT: getEnvNumber('VITE_OG_IMAGE_HEIGHT', 630),
  },
  STORAGE: {
    CACHE_TTL: getEnvNumber('VITE_CACHE_TTL_SECONDS', 3600),
    MAX_FILE_SIZE_BYTES: getEnvNumber('VITE_MAX_FILE_SIZE_BYTES', 5242880),
  },
  TELEMETRY: {
    MAX_LOGS: getEnvNumber('VITE_TELEMETRY_MAX_LOGS', 50),
    FLUSH_INTERVAL_MS: getEnvNumber('VITE_TELEMETRY_FLUSH_INTERVAL_MS', 30000),
  },
  AUDIO: {
    INT16_MAX: getEnvNumber('VITE_AUDIO_INT16_MAX', 32768.0),
    INT16_MIN: getEnvNumber('VITE_AUDIO_INT16_MIN', -32768.0),
    SAMPLE_RATE: getEnvNumber('VITE_AUDIO_SAMPLE_RATE', 24000),
  },
  LIVE_AUDIO: {
    MERGE_WINDOW_MS: getEnvNumber('VITE_LIVE_AUDIO_MERGE_WINDOW_MS', 3000),
    BUFFER_SIZE: getEnvNumber('VITE_LIVE_AUDIO_BUFFER_SIZE', 2048),
  },
  CACHE: {
    DEFAULT_STALE_TIME_MS: getEnvNumber('VITE_DEFAULT_STALE_TIME_MS', 300000),
    DEFAULT_CACHE_TIME_MS: getEnvNumber('VITE_DEFAULT_CACHE_TIME_MS', 600000),
  },
  VALIDATION: {
    MAX_SEARCH_LENGTH: getEnvNumber('VITE_MAX_SEARCH_LENGTH', 150),
    MAX_PROMPT_LENGTH: getEnvNumber('VITE_MAX_PROMPT_LENGTH', 2000),
  },
  DEV: {
    DEFAULT_PORT: getEnvNumber('VITE_DEV_DEFAULT_PORT', 3000),
    RELOAD_DELAY_MS: getEnvNumber('VITE_DEV_RELOAD_DELAY_MS', 1000),
    BROWSER_ANALYZE_PORT: getEnvNumber('VITE_DEV_BROWSER_ANALYZE_PORT', 4173),
  },
  ASSET_PREFIX: {
    SEARCH: getEnv('VITE_ASSET_PREFIX_SEARCH', 'search-'),
    BLUEPRINT: getEnv('VITE_ASSET_PREFIX_BLUEPRINT', 'blueprint-'),
    USER: getEnv('VITE_ASSET_PREFIX_USER', 'user-'),
    TEMP: getEnv('VITE_ASSET_PREFIX_TEMP', 'temp-'),
  },
  SCROLL: {
    THRESHOLD: getEnvNumber('VITE_SCROLL_THRESHOLD', 400),
    TOP_POSITION: getEnvNumber('VITE_SCROLL_TOP_POSITION', 0),
  },
  DATABASE: {
    DB_NAME: getEnv('VITE_DATABASE_NAME', 'TrendVenturesDB'),
    DB_VERSION: getEnvNumber('VITE_DATABASE_VERSION', 1),
    STORE_NAME: getEnv('VITE_DATABASE_STORE_NAME', 'keyval'),
    ASSETS_STORE_NAME: getEnv('VITE_DATABASE_ASSETS_STORE_NAME', 'assets'),
  },
  SUPABASE_STORAGE: {
    BUCKET_NAME: getEnv('VITE_SUPABASE_BUCKET_NAME', 'public-assets'),
  },
  TOAST: {
    EVENT_NAME: getEnv('VITE_TOAST_EVENT_NAME', 'trendventures_toast_event'),
  },
};

// Export legacy constants for backward compatibility (deprecated)
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;
export const TOKEN_LIMITS = API_CONFIG.TOKEN_LIMITS;
export const THINKING_BUDGETS = API_CONFIG.THINKING_BUDGETS;
export const AI_TEMPERATURES = API_CONFIG.AI_TEMPERATURES;
export const RESPONSE_FORMATS = API_CONFIG.RESPONSE_FORMATS;
export const VOICE_NAMES = API_CONFIG.VOICE_NAMES;
export const IMAGE_SIZES = API_CONFIG.IMAGE_SIZES;
export const SPEECH_CONFIG = API_CONFIG.SPEECH_CONFIG;
export const PLACEHOLDER_CONFIG = API_CONFIG.PLACEHOLDER_CONFIG;
export const APP_URLS = APP_CONFIG.URLS;
export const BRAND_CONFIG = APP_CONFIG.BRAND;
export const SEO_CONFIG = APP_CONFIG.SEO;
export const STORAGE_CONFIG = APP_CONFIG.STORAGE;
export const TELEMETRY_CONFIG = APP_CONFIG.TELEMETRY;
export const AUDIO_CONSTANTS = APP_CONFIG.AUDIO;
export const LIVE_AUDIO_CONFIG = APP_CONFIG.LIVE_AUDIO;
export const CACHE_CONFIG = APP_CONFIG.CACHE;
export const VALIDATION_CONFIG = APP_CONFIG.VALIDATION;
export const DEV_CONFIG = APP_CONFIG.DEV;
export const ASSET_ID_PREFIX = APP_CONFIG.ASSET_PREFIX;
export const SCROLL_CONFIG = APP_CONFIG.SCROLL;
export const DATABASE_CONFIG = APP_CONFIG.DATABASE;
export const SUPABASE_STORAGE_CONFIG = APP_CONFIG.SUPABASE_STORAGE;
export const TOAST_CONFIG = APP_CONFIG.TOAST;

// Utility function to get OG Image URL
export const getOgImageUrl = (text: string = 'TrendVentures+AI'): string => {
  const { BASE_URL, DEFAULT_BG, DEFAULT_TEXT_COLOR } = API_CONFIG.PLACEHOLDER_CONFIG;
  const { OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } = APP_CONFIG.SEO;
  return `${BASE_URL}/${OG_IMAGE_WIDTH}x${OG_IMAGE_HEIGHT}/${DEFAULT_BG}/${DEFAULT_TEXT_COLOR}?text=${text}&font=roboto`;
};

// Configuration validator
export const validateConfig = (): string[] => {
  const errors: string[] = [];
  
  // Validate numeric ranges
  if (API_CONFIG.TOKEN_LIMITS.MAX_OUTPUT <= 0) {
    errors.push('VITE_MAX_OUTPUT_TOKENS must be greater than 0');
  }
  
  if (API_CONFIG.AI_TEMPERATURES.DEFAULT < 0 || API_CONFIG.AI_TEMPERATURES.DEFAULT > 2) {
    errors.push('VITE_DEFAULT_TEMPERATURE must be between 0 and 2');
  }
  
  if (APP_CONFIG.STORAGE.MAX_FILE_SIZE_BYTES <= 0) {
    errors.push('VITE_MAX_FILE_SIZE_BYTES must be greater than 0');
  }
  
  // Validate URLs
  try {
    new URL(API_CONFIG.ENDPOINTS.OPENAI.CHAT);
  } catch {
    errors.push('VITE_OPENAI_CHAT_ENDPOINT must be a valid URL');
  }
  
  try {
    new URL(APP_CONFIG.URLS.BASE);
  } catch {
    errors.push('VITE_APP_BASE_URL must be a valid URL');
  }
  
  return errors;
};

// Export all config for debugging (only in development)
export const getAllConfig = (): { api: ApiConfig; app: AppConfig } => ({
  api: API_CONFIG,
  app: APP_CONFIG,
});

// Re-export design tokens for convenience
export {
  SPACING,
  ICON_SIZES,
  BUTTON_PADDING,
  GAP_CLASSES,
  PADDING_CLASSES,
  RADIUS_CLASSES,
  SHADOWS,
  Z_LAYERS,
  TYPOGRAPHY,
  TRANSITIONS,
  getIconSizeClass,
} from '../constants/designTokens';

// Re-export keyboard shortcuts for convenience
export {
  MODIFIERS,
  KEYBOARD_SHORTCUTS,
  formatShortcut,
  matchesShortcut,
  isInputElement,
  type ShortcutConfig,
} from '../constants/keyboardShortcuts';

// Re-export typography tokens for convenience (Flexy: Modular typography system!)
export {
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  LETTER_SPACING,
  TEXT_COLORS,
  TYPOGRAPHY_PRESETS,
  buildTypography,
} from '../constants/typography';
