/**
 * UI Timing Constants
 * Centralized configuration for all animation and timing values
 * Flexy: Uses centralized env utilities for modularity
 * All values can be overridden via environment variables.
 */

import { getEnv, getEnvNumber } from '../utils/envUtils';

export const UI_TIMING = {
  // Toast notifications
  TOAST_DURATION: getEnvNumber('VITE_UI_TOAST_DURATION_MS', 4000),
  TOAST_ANIMATION: getEnvNumber('VITE_UI_TOAST_ANIMATION_MS', 300),
  
  // Copy feedback
  COPY_FEEDBACK_DURATION: getEnvNumber('VITE_UI_COPY_FEEDBACK_DURATION_MS', 2000),
  
  // Debounce delays
  DEBOUNCE_SEARCH: getEnvNumber('VITE_UI_DEBOUNCE_SEARCH_MS', 300),
  DEBOUNCE_SAVE: getEnvNumber('VITE_UI_DEBOUNCE_SAVE_MS', 5000),
  
  // Loading animations
  LOADING_TEXT_ROTATION: getEnvNumber('VITE_UI_LOADING_TEXT_ROTATION_MS', 3000),
  
  // Transitions
  PAGE_RELOAD_DELAY: getEnvNumber('VITE_UI_PAGE_RELOAD_DELAY_MS', 1000),
  
  // Retry operations
  RETRY_BASE_DELAY: getEnvNumber('VITE_UI_RETRY_BASE_DELAY_MS', 100),
} as const;

export const CACHE_TIMING = {
  // React Query cache durations (milliseconds)
  TRENDS_STALE_TIME: getEnvNumber('VITE_CACHE_TRENDS_STALE_TIME_MS', 1000 * 60 * 15), // 15 minutes
  TRENDS_GC_TIME: getEnvNumber('VITE_CACHE_TRENDS_GC_TIME_MS', 1000 * 60 * 60), // 1 hour
  
  // Default cache times
  DEFAULT_STALE_TIME: getEnvNumber('VITE_CACHE_DEFAULT_STALE_TIME_MS', 1000 * 60 * 5), // 5 minutes
  DEFAULT_GC_TIME: getEnvNumber('VITE_CACHE_DEFAULT_GC_TIME_MS', 1000 * 60 * 30), // 30 minutes
} as const;

export const ANIMATION_TIMING = {
  // Fade animations (seconds)
  FADE_FAST: getEnvNumber('VITE_ANIMATION_FADE_FAST_S', 0.2),
  FADE_NORMAL: getEnvNumber('VITE_ANIMATION_FADE_NORMAL_S', 0.3),
  FADE_SLOW: getEnvNumber('VITE_ANIMATION_FADE_SLOW_S', 0.5),
  
  // Slide animations (seconds)
  SLIDE_UP: getEnvNumber('VITE_ANIMATION_SLIDE_UP_S', 0.3),
  SLIDE_UP_SLOW: getEnvNumber('VITE_ANIMATION_SLIDE_UP_SLOW_S', 0.4),
  SLIDE_DOWN: getEnvNumber('VITE_ANIMATION_SLIDE_DOWN_S', 0.3),
  
  // Special animations
  SHIMMER: getEnv('VITE_ANIMATION_SHIMMER_DURATION', '2s'),
  PULSE: getEnv('VITE_ANIMATION_PULSE_DURATION', '2s'),
  TREND_FADE: getEnv('VITE_ANIMATION_TREND_FADE_DURATION', '1s'),
} as const;

export const ANIMATION_EASING = {
  DEFAULT: getEnv('VITE_ANIMATION_EASING_DEFAULT', 'ease-out'),
  ENTRANCE: getEnv('VITE_ANIMATION_EASING_ENTRANCE', 'ease-out'),
  EXIT: getEnv('VITE_ANIMATION_EASING_EXIT', 'ease-in'),
  SMOOTH: getEnv('VITE_ANIMATION_EASING_SMOOTH', 'ease-in-out'),
} as const;

/**
 * Border Radius Constants
 * Centralized border radius values for consistent component styling
 */
export const BORDER_RADIUS = {
  NONE: 'rounded-none',
  SM: 'rounded-sm',
  DEFAULT: 'rounded',
  MD: 'rounded-md',
  LG: 'rounded-lg',
  XL: 'rounded-xl',
  XL2: 'rounded-2xl',
  XL3: 'rounded-3xl',
  FULL: 'rounded-full',
} as const;

export type UITiming = typeof UI_TIMING;
export type BorderRadius = typeof BORDER_RADIUS;

// Default export for convenience
export default {
  UI_TIMING,
  CACHE_TIMING,
  ANIMATION_TIMING,
  ANIMATION_EASING,
  BORDER_RADIUS,
};
