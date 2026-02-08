
/**
 * API Configuration
 * Centralized configuration for all API endpoints and AI parameters
 */

export const API_ENDPOINTS = {
  OPENAI: {
    CHAT: 'https://api.openai.com/v1/chat/completions',
    SPEECH: 'https://api.openai.com/v1/audio/speech',
    IMAGES: 'https://api.openai.com/v1/images/generations',
  },
  EXTERNAL: {
    FAVICON: 'https://www.google.com/s2/favicons',
  },
} as const;

export const TOKEN_LIMITS = {
  MAX_OUTPUT: 32768,
  DEFAULT_OUTPUT: 8192,
  MINIMAL_OUTPUT: 1024,
} as const;

export const THINKING_BUDGETS = {
  COMPLEX: 10240,
  STANDARD: 2048,
  FAST: 1024,
  MINIMAL: 256,
} as const;

export const AI_TEMPERATURES = {
  DEFAULT: 0.7,
  CREATIVE: 0.9,
  PRECISE: 0.2,
  BALANCED: 0.5,
} as const;

export const RESPONSE_FORMATS = {
  BASE64: 'b64_json',
  URL: 'url',
  JSON: 'json',
} as const;

export const VOICE_NAMES = {
  DEFAULT: 'alloy',
  ALTERNATE: 'echo',
  FEMALE: 'nova',
  MALE: 'onyx',
} as const;

export const IMAGE_SIZES = {
  SQUARE: '1024x1024',
  LANDSCAPE: '1024x768',
  PORTRAIT: '768x1024',
  WIDE: '1792x1024',
  TALL: '1024x1792',
} as const;

export const SPEECH_CONFIG = {
  DEFAULT_LANG: 'en-US',
  FALLBACK_LANG: 'en',
} as const;

export const PLACEHOLDER_CONFIG = {
  BASE_URL: 'https://placehold.co',
  DEFAULT_BG: '0f172a',
  DEFAULT_TEXT: '10b981',
  DEFAULT_TEXT_COLOR: 'f8fafc',
} as const;
