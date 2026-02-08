
/**
 * Audio Visualizer Configuration
 * Centralized configuration for audio visualizer settings
 * Flexy: Eliminating hardcoded visualizer values
 */

export const AUDIO_VISUALIZER_CONFIG = {
  // Number of bars in the visualizer
  BAR_COUNT: 30,
  // Spacing between bars (pixels)
  BAR_SPACING: 2,
  // Padding for bar width calculation
  BAR_WIDTH_PADDING: 4,
  // Wave animation speed divisor
  WAVE_SPEED_DIVISOR: 200,
  // Volume smoothing factors
  SMOOTHING: {
    // Primary smoothing factor (80%)
    PRIMARY: 0.8,
    // Secondary smoothing factor (20%)
    SECONDARY: 0.2,
  },
} as const;

// Audio processing configuration
export const AUDIO_PROCESSING_CONFIG = {
  // Volume scaling multiplier for UI display
  VOLUME_UI_SCALE: 5,
  // FFT size for audio analysis
  FFT_SIZE: 256,
  // Min decibels for frequency data
  MIN_DECIBELS: -90,
  // Max decibels for frequency data
  MAX_DECIBELS: -10,
  // Smoothing time constant
  SMOOTHING_TIME_CONSTANT: 0.8,
} as const;

// Persona voice configuration
export const PERSONA_VOICE_CONFIG = {
  // Voice names for alternation
  VOICES: ['Puck', 'Zephyr'] as const,
  // Default voice index (for alternation logic)
  DEFAULT_VOICE_INDEX: 0,
} as const;

// Persona ID prefixes
export const PERSONA_ID_PREFIX = {
  GENERATED: 'gen_',
  CUSTOM: 'custom_',
} as const;

export type AudioVisualizerConfig = typeof AUDIO_VISUALIZER_CONFIG;
export type AudioProcessingConfig = typeof AUDIO_PROCESSING_CONFIG;
