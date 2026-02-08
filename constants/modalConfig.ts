/**
 * Modal Configuration
 * Centralized configuration for modal dimensions and behavior
 * Flexy: Eliminating hardcoded modal sizing throughout the application
 * All values can be overridden via environment variables.
 */

// Helper to safely get env var with fallback
const getEnv = (key: string, defaultValue: string): string => {
  const value = (import.meta as unknown as Record<string, Record<string, string>>)?.env?.[key] 
    ?? (typeof process !== 'undefined' ? process.env?.[key] : undefined);
  return value || defaultValue;
};

export const MODAL_DIMENSIONS = {
  // Chat modals
  CHAT: {
    height: getEnv('VITE_MODAL_CHAT_HEIGHT', 'h-[500px] md:h-[600px]'),
    width: getEnv('VITE_MODAL_CHAT_WIDTH', 'w-full max-w-sm md:max-w-md'),
  },
  
  // Agent chat modal
  AGENT_CHAT: {
    height: getEnv('VITE_MODAL_AGENT_CHAT_HEIGHT', 'h-[600px]'),
    width: getEnv('VITE_MODAL_AGENT_CHAT_WIDTH', 'w-full max-w-lg'),
  },
  
  // Live pitch modal
  LIVE_PITCH: {
    height: getEnv('VITE_MODAL_LIVE_PITCH_HEIGHT', 'h-[600px]'),
    width: getEnv('VITE_MODAL_LIVE_PITCH_WIDTH', 'w-full max-w-2xl'),
  },
  
  // Deep dive modal
  DEEP_DIVE: {
    height: getEnv('VITE_MODAL_DEEP_DIVE_HEIGHT', 'h-[80vh]'),
    width: getEnv('VITE_MODAL_DEEP_DIVE_WIDTH', 'w-full max-w-4xl'),
  },
  
  // Location scout modal
  LOCATION_SCOUT: {
    height: getEnv('VITE_MODAL_LOCATION_SCOUT_HEIGHT', 'h-auto max-h-[90vh]'),
    width: getEnv('VITE_MODAL_LOCATION_SCOUT_WIDTH', 'w-full max-w-2xl'),
  },
  
  // Brand studio modal
  BRAND_STUDIO: {
    height: getEnv('VITE_MODAL_BRAND_STUDIO_HEIGHT', 'h-auto max-h-[90vh]'),
    width: getEnv('VITE_MODAL_BRAND_STUDIO_WIDTH', 'w-full max-w-3xl'),
  },
  
  // Customer personas modal
  PERSONAS: {
    height: getEnv('VITE_MODAL_PERSONAS_HEIGHT', 'h-auto max-h-[90vh]'),
    width: getEnv('VITE_MODAL_PERSONAS_WIDTH', 'w-full max-w-4xl'),
  },
  
  // Blueprint preview modal
  BLUEPRINT_PREVIEW: {
    height: getEnv('VITE_MODAL_BLUEPRINT_PREVIEW_HEIGHT', 'h-[90vh]'),
    width: getEnv('VITE_MODAL_BLUEPRINT_PREVIEW_WIDTH', 'w-full max-w-5xl'),
  },
} as const;

export const MODAL_Z_INDEX = {
  BACKDROP: getEnv('VITE_MODAL_Z_BACKDROP', 'z-40'),
  CONTENT: getEnv('VITE_MODAL_Z_CONTENT', 'z-50'),
  FLOATING_BUTTON: getEnv('VITE_MODAL_Z_FLOATING_BUTTON', 'z-50'),
} as const;

export const MODAL_ANIMATION = {
  ENTER: getEnv('VITE_MODAL_ANIMATION_ENTER', 'animate-[fadeIn_0.2s_ease-out]'),
  SLIDE_UP: getEnv('VITE_MODAL_ANIMATION_SLIDE_UP', 'animate-[slideUp_0.3s_ease-out]'),
  SLIDE_DOWN: getEnv('VITE_MODAL_ANIMATION_SLIDE_DOWN', 'animate-[slideDown_0.3s_ease-out]'),
} as const;

export type ModalDimensions = typeof MODAL_DIMENSIONS;
export type ModalZIndex = typeof MODAL_Z_INDEX;

// Default export for convenience
export default {
  MODAL_DIMENSIONS,
  MODAL_Z_INDEX,
  MODAL_ANIMATION,
};
