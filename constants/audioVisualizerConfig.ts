/**
 * Audio Visualizer Configuration
 * Centralized configuration for audio visualizer settings
 * Flexy: Eliminating hardcoded visualizer values
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

// Parse array from env
const parseArray = <T>(key: string, defaultValue: T[]): T[] => {
  const envValue = getEnv(key, '');
  if (envValue) {
    try {
      return JSON.parse(envValue);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

export const AUDIO_VISUALIZER_CONFIG = {
  // Number of bars in the visualizer
  BAR_COUNT: getEnvNumber('VITE_AUDIO_VISUALIZER_BAR_COUNT', 30),
  // Spacing between bars (pixels)
  BAR_SPACING: getEnvNumber('VITE_AUDIO_VISUALIZER_BAR_SPACING', 2),
  // Padding for bar width calculation
  BAR_WIDTH_PADDING: getEnvNumber('VITE_AUDIO_VISUALIZER_BAR_WIDTH_PADDING', 4),
  // Wave animation speed divisor
  WAVE_SPEED_DIVISOR: getEnvNumber('VITE_AUDIO_VISUALIZER_WAVE_SPEED_DIVISOR', 200),
  // Volume smoothing factors
  SMOOTHING: {
    // Primary smoothing factor (80%)
    PRIMARY: getEnvNumber('VITE_AUDIO_VISUALIZER_SMOOTHING_PRIMARY', 0.8),
    // Secondary smoothing factor (20%)
    SECONDARY: getEnvNumber('VITE_AUDIO_VISUALIZER_SMOOTHING_SECONDARY', 0.2),
  },
} as const;

// Audio processing configuration
export const AUDIO_PROCESSING_CONFIG = {
  // Volume scaling multiplier for UI display
  VOLUME_UI_SCALE: getEnvNumber('VITE_AUDIO_PROCESSING_VOLUME_UI_SCALE', 5),
  // FFT size for audio analysis
  FFT_SIZE: getEnvNumber('VITE_AUDIO_PROCESSING_FFT_SIZE', 256),
  // Min decibels for frequency data
  MIN_DECIBELS: getEnvNumber('VITE_AUDIO_PROCESSING_MIN_DECIBELS', -90),
  // Max decibels for frequency data
  MAX_DECIBELS: getEnvNumber('VITE_AUDIO_PROCESSING_MAX_DECIBELS', -10),
  // Smoothing time constant
  SMOOTHING_TIME_CONSTANT: getEnvNumber('VITE_AUDIO_PROCESSING_SMOOTHING_TIME', 0.8),
} as const;

// Persona voice configuration
export const PERSONA_VOICE_CONFIG = {
  // Voice names for alternation
  VOICES: parseArray<string>('VITE_PERSONA_VOICE_NAMES', ['Puck', 'Zephyr']),
  // Default voice index (for alternation logic)
  DEFAULT_VOICE_INDEX: getEnvNumber('VITE_PERSONA_VOICE_DEFAULT_INDEX', 0),
} as const;

// Persona ID prefixes
export const PERSONA_ID_PREFIX = {
  GENERATED: getEnv('VITE_PERSONA_ID_PREFIX_GENERATED', 'gen_'),
  CUSTOM: getEnv('VITE_PERSONA_ID_PREFIX_CUSTOM', 'custom_'),
} as const;

export type AudioVisualizerConfig = typeof AUDIO_VISUALIZER_CONFIG;
export type AudioProcessingConfig = typeof AUDIO_PROCESSING_CONFIG;

// Default export for convenience
export default {
  AUDIO_VISUALIZER_CONFIG,
  AUDIO_PROCESSING_CONFIG,
  PERSONA_VOICE_CONFIG,
  PERSONA_ID_PREFIX,
};
