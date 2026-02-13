/**
 * Button Configuration
 * Centralized configuration for button components
 * Flexy: Eliminates hardcoded button values and timing
 * All values can be overridden via environment variables.
 */

import { getEnvNumber } from '../utils/envUtils';

// Delete button configuration
export const DELETE_BUTTON = {
  // Confirmation timing
  confirmationDelay: getEnvNumber('VITE_DELETE_CONFIRMATION_DELAY_MS', 800),
  
  // Reset delay after completion (ms)
  resetDelay: getEnvNumber('VITE_DELETE_RESET_DELAY_MS', 150),
  
  // Progress ring configuration
  progressRing: {
    // Circle radius (calculated for SVG viewBox)
    radius: 45,
    // Calculate circumference: 2 * PI * radius
    get circumference() {
      return 2 * Math.PI * this.radius;
    },
    // Stroke width for the progress ring
    strokeWidth: 4,
    // Multiplier for converting progress percentage to stroke-dashoffset
    // This equals circumference / 100 to map 0-100% to dash offset
    get progressMultiplier() {
      return this.circumference / 100;
    },
  },
  
  // Tooltip configuration
  tooltip: {
    // Font size (in rem)
    fontSize: '0.625rem', // 10px equivalent
    // Arrow border width (in px)
    arrowBorderWidth: 4,
  },
} as const;

// Button timing constants
export const BUTTON_TIMING = {
  // Animation durations (ms)
  fadeIn: getEnvNumber('VITE_BUTTON_FADE_IN_MS', 150),
  pulse: getEnvNumber('VITE_BUTTON_PULSE_MS', 500),
  
  // Ripple effect duration (ms)
  rippleDuration: getEnvNumber('VITE_BUTTON_RIPPLE_DURATION_MS', 600),
} as const;

// Size token mapping for buttons
export const BUTTON_SIZES = {
  sm: {
    padding: 'p-1.5',
    iconSize: 'w-3.5 h-3.5',
  },
  md: {
    padding: 'p-2',
    iconSize: 'w-4 h-4',
  },
  lg: {
    padding: 'p-2.5',
    iconSize: 'w-5 h-5',
  },
} as const;

// Tooltip text configuration
export const TOOLTIP_TEXT = {
  delete: {
    initial: 'Hold to delete',
    confirming: 'Keep holding...',
    completed: 'Release to confirm deletion',
  },
} as const;

export type ButtonSize = keyof typeof BUTTON_SIZES;
export type DeleteButtonConfig = typeof DELETE_BUTTON;
export type ButtonTiming = typeof BUTTON_TIMING;

// Default export for convenience
export default {
  DELETE_BUTTON,
  BUTTON_TIMING,
  BUTTON_SIZES,
  TOOLTIP_TEXT,
};
