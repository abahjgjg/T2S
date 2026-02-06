
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

export type UITiming = typeof UI_TIMING;
