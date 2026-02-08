/**
 * AI Model Configuration
 * Centralized configuration for AI model names and media generation settings
 * 
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

// Gemini Models - Configurable via environment variables
export const GEMINI_MODELS = {
  // Basic Text Tasks (summarization, proofreading, simple Q&A, fast generation)
  BASIC: getEnv('VITE_GEMINI_MODEL_BASIC', 'gemini-3-flash-preview'),
  
  // Complex Text Tasks (reasoning, coding, blueprint generation)
  COMPLEX: getEnv('VITE_GEMINI_MODEL_COMPLEX', 'gemini-3-pro-preview'),
  
  // General Image Generation
  IMAGE: getEnv('VITE_GEMINI_MODEL_IMAGE', 'gemini-2.5-flash-image'),
  
  // Video Generation
  VIDEO: getEnv('VITE_GEMINI_MODEL_VIDEO', 'veo-3.1-fast-generate-preview'),
  
  // Real-time audio & video conversation
  LIVE: getEnv('VITE_GEMINI_MODEL_LIVE', 'gemini-2.5-flash-native-audio-preview-09-2025'),
  
  // Text-to-speech
  TTS: getEnv('VITE_GEMINI_MODEL_TTS', 'gemini-2.5-flash-preview-tts'),
};

// OpenAI Models - Configurable via environment variables
export const OPENAI_MODELS = {
  // Fast, cost-effective model
  BASIC: getEnv('VITE_OPENAI_MODEL_BASIC', 'gpt-4o-mini'),

  // High-intelligence model
  COMPLEX: getEnv('VITE_OPENAI_MODEL_COMPLEX', 'gpt-4o'),

  // Image generation
  IMAGE: getEnv('VITE_OPENAI_MODEL_IMAGE', 'dall-e-3'),

  // Text-to-speech
  TTS: getEnv('VITE_OPENAI_MODEL_TTS', 'tts-1')
};

// Media Generation Configuration - Configurable via environment variables
export const MEDIA_CONFIG = {
  // Default Voice for TTS
  DEFAULT_VOICE: getEnv('VITE_MEDIA_DEFAULT_VOICE', 'Kore'),

  // TTS text length limit (characters)
  TTS_MAX_CHARS: getEnvNumber('VITE_MEDIA_TTS_MAX_CHARS', 3000),

  // Video generation description limit (characters)
  VIDEO_DESC_MAX_CHARS: getEnvNumber('VITE_MEDIA_VIDEO_DESC_MAX_CHARS', 150),

  // Video generation polling interval (milliseconds)
  VIDEO_POLL_INTERVAL_MS: getEnvNumber('VITE_MEDIA_VIDEO_POLL_INTERVAL_MS', 5000),

  // Video resolution and aspect ratio
  VIDEO_RESOLUTION: getEnv('VITE_MEDIA_VIDEO_RESOLUTION', '720p'),
  VIDEO_ASPECT_RATIO: getEnv('VITE_MEDIA_VIDEO_ASPECT_RATIO', '16:9'),

  // Retry configuration
  RETRY: {
    DEFAULT_DELAY_MS: getEnvNumber('VITE_MEDIA_RETRY_DEFAULT_DELAY_MS', 500),
    LONG_DELAY_MS: getEnvNumber('VITE_MEDIA_RETRY_LONG_DELAY_MS', 2000),
    DEFAULT_MAX_RETRIES: getEnvNumber('VITE_MEDIA_RETRY_DEFAULT_MAX_RETRIES', 3),
  },

  // Text truncation limits
  TEXT_TRUNCATION: {
    // Description for brand image generation
    BRAND_IMAGE_DESC: getEnvNumber('VITE_MEDIA_TRUNCATION_BRAND_IMAGE_DESC', 200),
    // Bio text for persona avatar generation
    PERSONA_BIO: getEnvNumber('VITE_MEDIA_TRUNCATION_PERSONA_BIO', 150),
  },

  // Audio configuration
  AUDIO: {
    // Sample rate for TTS audio context (Hz)
    SAMPLE_RATE: getEnvNumber('VITE_MEDIA_AUDIO_SAMPLE_RATE', 24000),
    // Buffer size for audio processing
    BUFFER_SIZE: getEnvNumber('VITE_MEDIA_AUDIO_BUFFER_SIZE', 2048),
  },

  // AI Temperature values
  TEMPERATURES: {
    CREATIVE: getEnvNumber('VITE_MEDIA_TEMPERATURE_CREATIVE', 0.9),
    BALANCED: getEnvNumber('VITE_MEDIA_TEMPERATURE_BALANCED', 0.7),
    PRECISE: getEnvNumber('VITE_MEDIA_TEMPERATURE_PRECISE', 0.3),
    DETERMINISTIC: getEnvNumber('VITE_MEDIA_TEMPERATURE_DETERMINISTIC', 0.1),
  },
};

// Database query limits - Configurable via environment variables
export const QUERY_LIMITS = {
  // Default page size for paginated results
  DEFAULT_PAGE_SIZE: getEnvNumber('VITE_QUERY_DEFAULT_PAGE_SIZE', 20),
  // Number of items in featured sections
  FEATURED_ITEMS: getEnvNumber('VITE_QUERY_FEATURED_ITEMS', 6),
  // Number of roadmap items to store in metadata
  ROADMAP_PREVIEW_ITEMS: getEnvNumber('VITE_QUERY_ROADMAP_PREVIEW_ITEMS', 3),
};

// Default export for convenience
export default {
  GEMINI_MODELS,
  OPENAI_MODELS,
  MEDIA_CONFIG,
  QUERY_LIMITS,
};
