
/**
 * Modal Configuration
 * Centralized configuration for modal dimensions and behavior
 * Flexy: Eliminating hardcoded modal sizing throughout the application
 */

export const MODAL_DIMENSIONS = {
  // Chat modals
  CHAT: {
    height: 'h-[500px] md:h-[600px]',
    width: 'w-full max-w-sm md:max-w-md',
  },
  
  // Agent chat modal
  AGENT_CHAT: {
    height: 'h-[600px]',
    width: 'w-full max-w-lg',
  },
  
  // Live pitch modal
  LIVE_PITCH: {
    height: 'h-[600px]',
    width: 'w-full max-w-2xl',
  },
  
  // Deep dive modal
  DEEP_DIVE: {
    height: 'h-[80vh]',
    width: 'w-full max-w-4xl',
  },
  
  // Location scout modal
  LOCATION_SCOUT: {
    height: 'h-auto max-h-[90vh]',
    width: 'w-full max-w-2xl',
  },
  
  // Brand studio modal
  BRAND_STUDIO: {
    height: 'h-auto max-h-[90vh]',
    width: 'w-full max-w-3xl',
  },
  
  // Customer personas modal
  PERSONAS: {
    height: 'h-auto max-h-[90vh]',
    width: 'w-full max-w-4xl',
  },
  
  // Blueprint preview modal
  BLUEPRINT_PREVIEW: {
    height: 'h-[90vh]',
    width: 'w-full max-w-5xl',
  },
} as const;

export const MODAL_Z_INDEX = {
  BACKDROP: 'z-40',
  CONTENT: 'z-50',
  FLOATING_BUTTON: 'z-50',
} as const;

export const MODAL_ANIMATION = {
  ENTER: 'animate-[fadeIn_0.2s_ease-out]',
  SLIDE_UP: 'animate-[slideUp_0.3s_ease-out]',
  SLIDE_DOWN: 'animate-[slideDown_0.3s_ease-out]',
} as const;

export type ModalDimensions = typeof MODAL_DIMENSIONS;
export type ModalZIndex = typeof MODAL_Z_INDEX;
