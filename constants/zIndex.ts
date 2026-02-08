
/**
 * Z-Index Scale Configuration
 * Centralized z-index values for consistent layering throughout the application
 * Flexy: Eliminating hardcoded z-index values throughout the application
 */

export const Z_INDEX = {
  // Background layers
  BASE: 'z-0',
  CONTENT: 'z-10',
  
  // Floating elements
  DROPDOWN: 'z-20',
  TOOLTIP: 'z-30',
  
  // Overlays
  OVERLAY: 'z-40',
  MODAL_BACKDROP: 'z-40',
  
  // Modal content
  MODAL: 'z-50',
  DRAWER: 'z-50',
  
  // Critical UI
  TOAST: 'z-[100]',
  NOTIFICATION: 'z-[100]',
  
  // Maximum
  MAXIMUM: 'z-[9999]',
} as const;

export const Z_INDEX_VALUES = {
  BASE: 0,
  CONTENT: 10,
  DROPDOWN: 20,
  TOOLTIP: 30,
  OVERLAY: 40,
  MODAL_BACKDROP: 40,
  MODAL: 50,
  DRAWER: 50,
  TOAST: 100,
  NOTIFICATION: 100,
  MAXIMUM: 9999,
} as const;

export type ZIndex = typeof Z_INDEX;
export type ZIndexValues = typeof Z_INDEX_VALUES;
