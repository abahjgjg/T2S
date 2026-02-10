/**
 * Content Configuration
 * Centralized content strings for prompts, messages, and instructions
 * Flexy: Eliminating hardcoded content strings throughout the codebase
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

// Date and Locale Configuration
export const DATE_CONFIG = {
  // Default locale for date formatting
  DEFAULT_LOCALE: getEnv('VITE_DATE_DEFAULT_LOCALE', 'en-US'),
  
  // Date format options
  FORMAT_OPTIONS: {
    full: {
      weekday: 'long' as const,
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const,
    },
    fullWithTime: {
      weekday: 'long' as const,
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const,
      hour: '2-digit' as const,
      minute: '2-digit' as const,
    },
  },
} as const;

// AI Prompt Instructions
export const AI_INSTRUCTIONS = {
  // Visual context instruction when image is provided
  VISUAL_CONTEXT: getEnv(
    'VITE_AI_VISUAL_CONTEXT',
    'VISUAL CONTEXT PROVIDED: An image has been attached. Analyze the image contents and identify trends related to the objects, style, or data visible in the image. Combine this visual insight with the search query.'
  ),
  
  // Urgency instruction for short timeframes
  URGENCY_SHORT_TIMEFRAME: getEnv(
    'VITE_AI_URGENCY_SHORT',
    'CRITICAL PRIORITY: YOU ARE A REAL-TIME NEWS SCANNER. The user wants to know what is happening RIGHT NOW. Prioritize BREAKING NEWS, LIVE EVENTS, and DEVELOPING STORIES from the last 24-48 hours. IGNORE general knowledge or outdated trends. If no breaking news exists for this niche, find the most recent relevant update from this week. Do not hallucinate dates.'
  ),
  
  // Standard timeframe instruction
  URGENCY_STANDARD_TIMEFRAME: getEnv(
    'VITE_AI_URGENCY_STANDARD',
    'Focus on established market shifts and emerging patterns from the last month.'
  ),
  
  // Topic extraction prompt
  TOPIC_EXTRACTION: getEnv(
    'VITE_AI_TOPIC_EXTRACTION',
    `Analyze this image. It could be a chart, a product photo, a screenshot of a news article, or a real-world scene.
Identify the MAIN SUBJECT, NICHE, or TREND topic represented in this image.
Return ONLY a short, searchable string (max {{maxWords}} words) describing this topic.
Example: "AI Semiconductor Market", "Sustainable Sneaker Trends", "EV Battery Tech".
Do not explain. Just return the topic string.
{{langInstruction}}`
  ),
  
  // Simple topic extraction (for OpenAI)
  TOPIC_EXTRACTION_SIMPLE: getEnv(
    'VITE_AI_TOPIC_EXTRACTION_SIMPLE',
    'Identify the MAIN SUBJECT, NICHE, or TREND topic represented in this image.\nReturn ONLY a short, searchable string (max {{maxWords}} words).\n{{langInstruction}}'
  ),
  
  // Language instruction templates
  LANGUAGE_OUTPUT: {
    id: getEnv('VITE_AI_LANG_ID', 'Output in Indonesian.'),
    en: getEnv('VITE_AI_LANG_EN', 'Output in English.'),
  },
  
  // Chat language instruction templates
  CHAT_LANGUAGE: {
    id: getEnv('VITE_CHAT_LANG_ID', 'Reply in Indonesian.'),
    en: getEnv('VITE_CHAT_LANG_EN', 'Reply in English.'),
  },
  
  // Chat update messages
  CHAT_UPDATE_MESSAGES: {
    id: getEnv('VITE_CHAT_UPDATE_ID', 'Saya telah memperbarui blueprint sesuai permintaan Anda.'),
    en: getEnv('VITE_CHAT_UPDATE_EN', 'I have updated the blueprint with your changes.'),
  },
} as const;

// MIME Types Configuration
export const MIME_TYPES = {
  // Default MIME type for images
  DEFAULT_IMAGE: getEnv('VITE_MIME_DEFAULT_IMAGE', 'image/jpeg'),
  
  // Supported image MIME types
  SUPPORTED_IMAGES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
  ] as const,
  
  // MIME type regex patterns
  PATTERNS: {
    BASE64_HEADER: /^data:(image\/[a-zA-Z+]+);base64,/,
    ASSET_PROTOCOL: /^asset:\/\//,
  },
} as const;

// Content Limits
export const CONTENT_LIMITS = {
  // Maximum words for topic extraction
  TOPIC_EXTRACTION_MAX_WORDS: getEnvNumber('VITE_CONTENT_TOPIC_MAX_WORDS', 5),
  
  // Maximum characters for text extraction
  TEXT_EXTRACTION_MAX_CHARS: getEnvNumber('VITE_CONTENT_TEXT_MAX_CHARS', 100),
  
  // Maximum trend items to return
  MAX_TREND_ITEMS: getEnvNumber('VITE_CONTENT_MAX_TRENDS', 10),
  
  // Maximum search results
  MAX_SEARCH_RESULTS: getEnvNumber('VITE_CONTENT_MAX_SEARCH_RESULTS', 20),
} as const;

// API Response Formats
export const RESPONSE_FORMATS = {
  JSON: 'application/json',
  TEXT: 'text/plain',
} as const;

// Default export for convenience
export default {
  DATE_CONFIG,
  AI_INSTRUCTIONS,
  MIME_TYPES,
  CONTENT_LIMITS,
  RESPONSE_FORMATS,
};
