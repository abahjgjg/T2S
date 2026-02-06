
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
  }
} as const;
