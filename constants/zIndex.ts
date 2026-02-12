/**
 * Z-Index Scale Configuration
 * Centralized z-index values for consistent layering throughout the application
 * Flexy: Uses centralized env utilities for modularity
 * All values can be overridden via environment variables.
 */

import { getEnv, getEnvNumber } from '../utils/envUtils';

export const Z_INDEX = {
  // Background layers
  BASE: getEnv('VITE_Z_INDEX_BASE', 'z-0'),
  CONTENT: getEnv('VITE_Z_INDEX_CONTENT', 'z-10'),
  
  // Floating elements
  DROPDOWN: getEnv('VITE_Z_INDEX_DROPDOWN', 'z-20'),
  TOOLTIP: getEnv('VITE_Z_INDEX_TOOLTIP', 'z-30'),
  
  // Overlays
  OVERLAY: getEnv('VITE_Z_INDEX_OVERLAY', 'z-40'),
  MODAL_BACKDROP: getEnv('VITE_Z_INDEX_MODAL_BACKDROP', 'z-40'),
  
  // Modal content
  MODAL: getEnv('VITE_Z_INDEX_MODAL', 'z-50'),
  DRAWER: getEnv('VITE_Z_INDEX_DRAWER', 'z-50'),
  
  // Critical UI
  TOAST: getEnv('VITE_Z_INDEX_TOAST', 'z-[100]'),
  NOTIFICATION: getEnv('VITE_Z_INDEX_NOTIFICATION', 'z-[100]'),
  
  // Maximum
  MAXIMUM: getEnv('VITE_Z_INDEX_MAXIMUM', 'z-[9999]'),
} as const;

export const Z_INDEX_VALUES = {
  BASE: getEnvNumber('VITE_Z_INDEX_VALUE_BASE', 0),
  CONTENT: getEnvNumber('VITE_Z_INDEX_VALUE_CONTENT', 10),
  DROPDOWN: getEnvNumber('VITE_Z_INDEX_VALUE_DROPDOWN', 20),
  TOOLTIP: getEnvNumber('VITE_Z_INDEX_VALUE_TOOLTIP', 30),
  OVERLAY: getEnvNumber('VITE_Z_INDEX_VALUE_OVERLAY', 40),
  MODAL_BACKDROP: getEnvNumber('VITE_Z_INDEX_VALUE_MODAL_BACKDROP', 40),
  MODAL: getEnvNumber('VITE_Z_INDEX_VALUE_MODAL', 50),
  DRAWER: getEnvNumber('VITE_Z_INDEX_VALUE_DRAWER', 50),
  TOAST: getEnvNumber('VITE_Z_INDEX_VALUE_TOAST', 100),
  NOTIFICATION: getEnvNumber('VITE_Z_INDEX_VALUE_NOTIFICATION', 100),
  MAXIMUM: getEnvNumber('VITE_Z_INDEX_VALUE_MAXIMUM', 9999),
} as const;

export type ZIndex = typeof Z_INDEX;
export type ZIndexValues = typeof Z_INDEX_VALUES;

// Default export for convenience
export default {
  Z_INDEX,
  Z_INDEX_VALUES,
};
