
/**
 * UI Timing Constants
 * Centralized configuration for all animation and timing values
 */

export const UI_TIMING = {
  // Toast notifications
  TOAST_DURATION: 4000,
  TOAST_ANIMATION: 300,
  
  // Copy feedback
  COPY_FEEDBACK_DURATION: 2000,
  
  // Debounce delays
  DEBOUNCE_SEARCH: 300,
  DEBOUNCE_SAVE: 5000,
  
  // Loading animations
  LOADING_TEXT_ROTATION: 3000,
  
  // Transitions
  PAGE_RELOAD_DELAY: 1000,
  
  // Retry operations
  RETRY_BASE_DELAY: 100,
} as const;

export const CACHE_TIMING = {
  // React Query cache durations (milliseconds)
  TRENDS_STALE_TIME: 1000 * 60 * 15, // 15 minutes
  TRENDS_GC_TIME: 1000 * 60 * 60, // 1 hour
  
  // Default cache times
  DEFAULT_STALE_TIME: 1000 * 60 * 5, // 5 minutes
  DEFAULT_GC_TIME: 1000 * 60 * 30, // 30 minutes
} as const;

export const ANIMATION_TIMING = {
  // Fade animations (seconds)
  FADE_FAST: 0.2,
  FADE_NORMAL: 0.3,
  FADE_SLOW: 0.5,
  
  // Slide animations (seconds)
  SLIDE_UP: 0.3,
  SLIDE_UP_SLOW: 0.4,
  SLIDE_DOWN: 0.3,
  
  // Special animations
  SHIMMER: '2s',
  PULSE: '2s',
  TREND_FADE: '1s',
} as const;

export const ANIMATION_EASING = {
  DEFAULT: 'ease-out',
  ENTRANCE: 'ease-out',
  EXIT: 'ease-in',
  SMOOTH: 'ease-in-out',
} as const;

export type UITiming = typeof UI_TIMING;
