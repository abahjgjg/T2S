
export const GEMINI_MODELS = {
  // Basic Text Tasks (summarization, proofreading, simple Q&A, fast generation)
  BASIC: 'gemini-3-flash-preview',
  
  // Complex Text Tasks (reasoning, coding, blueprint generation)
  COMPLEX: 'gemini-3-pro-preview',
  
  // General Image Generation
  IMAGE: 'gemini-2.5-flash-image',
  
  // Video Generation
  VIDEO: 'veo-3.1-fast-generate-preview',
  
  // Real-time audio & video conversation
  LIVE: 'gemini-2.5-flash-native-audio-preview-09-2025',
  
  // Text-to-speech
  TTS: 'gemini-2.5-flash-preview-tts',
};

export const OPENAI_MODELS = {
  // Fast, cost-effective model
  BASIC: 'gpt-4o-mini',

  // High-intelligence model
  COMPLEX: 'gpt-4o',

  // Image generation
  IMAGE: 'dall-e-3',

  // Text-to-speech
  TTS: 'tts-1'
};

// Media Generation Configuration
export const MEDIA_CONFIG = {
  // Default Voice for TTS
  DEFAULT_VOICE: 'Kore',

  // TTS text length limit (characters)
  TTS_MAX_CHARS: 3000,

  // Video generation description limit (characters)
  VIDEO_DESC_MAX_CHARS: 150,

  // Video generation polling interval (milliseconds)
  VIDEO_POLL_INTERVAL_MS: 5000,

  // Retry configuration
  RETRY: {
    DEFAULT_DELAY_MS: 500,
    LONG_DELAY_MS: 2000,
    DEFAULT_MAX_RETRIES: 3,
  },

  // Text truncation limits
  TEXT_TRUNCATION: {
    // Description for brand image generation
    BRAND_IMAGE_DESC: 200,
    // Bio text for persona avatar generation
    PERSONA_BIO: 150,
  }
} as const;

// Database query limits
export const QUERY_LIMITS = {
  // Default page size for paginated results
  DEFAULT_PAGE_SIZE: 20,
  // Number of items in featured sections
  FEATURED_ITEMS: 6,
  // Number of roadmap items to store in metadata
  ROADMAP_PREVIEW_ITEMS: 3,
} as const;
