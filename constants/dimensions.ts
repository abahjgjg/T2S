/**
 * Dimension Configuration
 * Flexy: Centralized dimension values for consistent sizing
 * All values can be overridden via environment variables.
 */

import { getEnv, getEnvNumber } from '../utils/envUtils';

// ============================================================================
// COMPONENT DIMENSIONS (in pixels or CSS units)
// ============================================================================

export const DIMENSIONS = {
  // Modal dimensions
  modal: {
    maxWidth: {
      sm: getEnv('VITE_MODAL_MAX_WIDTH_SM', '400px'),
      md: getEnv('VITE_MODAL_MAX_WIDTH_MD', '600px'),
      lg: getEnv('VITE_MODAL_MAX_WIDTH_LG', '900px'),
      xl: getEnv('VITE_MODAL_MAX_WIDTH_XL', '1200px'),
      full: getEnv('VITE_MODAL_MAX_WIDTH_FULL', '1600px'),
    },
    maxHeight: {
      sm: getEnv('VITE_MODAL_MAX_HEIGHT_SM', '60vh'),
      md: getEnv('VITE_MODAL_MAX_HEIGHT_MD', '85vh'),
      lg: getEnv('VITE_MODAL_MAX_HEIGHT_LG', '90vh'),
    },
    minHeight: {
      xs: getEnv('VITE_MODAL_MIN_HEIGHT_XS', '200px'),
      sm: getEnv('VITE_MODAL_MIN_HEIGHT_SM', '300px'),
    },
  },
  
  // Container dimensions
  container: {
    maxWidth: {
      xs: getEnv('VITE_CONTAINER_MAX_WIDTH_XS', '300px'),
      sm: getEnv('VITE_CONTAINER_MAX_WIDTH_SM', '400px'),
      md: getEnv('VITE_CONTAINER_MAX_WIDTH_MD', '600px'),
      lg: getEnv('VITE_CONTAINER_MAX_WIDTH_LG', '800px'),
      xl: getEnv('VITE_CONTAINER_MAX_WIDTH_XL', '1200px'),
    },
  },
  
  // List/scrollable area dimensions
  list: {
    maxHeight: {
      sm: getEnv('VITE_LIST_MAX_HEIGHT_SM', '200px'),
      md: getEnv('VITE_LIST_MAX_HEIGHT_MD', '300px'),
      lg: getEnv('VITE_LIST_MAX_HEIGHT_LG', '400px'),
      xl: getEnv('VITE_LIST_MAX_HEIGHT_XL', '500px'),
    },
  },
  
  // Image/avatar dimensions
  image: {
    size: {
      xs: getEnv('VITE_IMAGE_SIZE_XS', '40px'),
      sm: getEnv('VITE_IMAGE_SIZE_SM', '48px'),
      md: getEnv('VITE_IMAGE_SIZE_MD', '64px'),
      lg: getEnv('VITE_IMAGE_SIZE_LG', '128px'),
      xl: getEnv('VITE_IMAGE_SIZE_XL', '192px'),
    },
  },
  
  // Canvas dimensions
  canvas: {
    height: {
      sm: getEnv('VITE_CANVAS_HEIGHT_SM', '60px'),
      md: getEnv('VITE_CANVAS_HEIGHT_MD', '100px'),
      lg: getEnv('VITE_CANVAS_HEIGHT_LG', '200px'),
    },
  },
  
  // Progress bar dimensions
  progress: {
    minWidth: {
      xs: getEnv('VITE_PROGRESS_MIN_WIDTH_XS', '28px'),
      sm: getEnv('VITE_PROGRESS_MIN_WIDTH_SM', '40px'),
    },
  },
  
  // Grid cell dimensions (for Business Model Canvas, etc.)
  grid: {
    minHeight: {
      sm: getEnv('VITE_GRID_MIN_HEIGHT_SM', '120px'),
      md: getEnv('VITE_GRID_MIN_HEIGHT_MD', '150px'),
      lg: getEnv('VITE_GRID_MIN_HEIGHT_LG', '200px'),
      xl: getEnv('VITE_GRID_MIN_HEIGHT_XL', '250px'),
    },
    minWidth: {
      sm: getEnv('VITE_GRID_MIN_WIDTH_SM', '100px'),
      md: getEnv('VITE_GRID_MIN_WIDTH_MD', '150px'),
    },
  },
  
  // Header/navigation dimensions
  header: {
    maxWidth: {
      dropdown: getEnv('VITE_HEADER_DROPDOWN_MAX_WIDTH', '80px'),
      nav: getEnv('VITE_HEADER_NAV_MAX_WIDTH', '200px'),
    },
  },
  
  // Input dimensions
  input: {
    minHeight: {
      helper: getEnv('VITE_INPUT_HELPER_MIN_HEIGHT', '1.25rem'), // 20px
    },
  },
  
  // Timeline/event marker dimensions
  timeline: {
    position: {
      left: getEnv('VITE_TIMELINE_LEFT_POSITION', '7px'),
    },
  },
  
  // Message/chat bubble dimensions
  message: {
    maxWidth: {
      default: getEnv('VITE_MESSAGE_MAX_WIDTH', '85%'),
    },
  },
  
  // Empty state dimensions
  emptyState: {
    minHeight: getEnv('VITE_EMPTY_STATE_MIN_HEIGHT', '300px'),
  },
} as const;

// ============================================================================
// BREAKPOINT-RELATED DIMENSIONS
// ============================================================================

export const BREAKPOINTS = {
  mobile: getEnvNumber('VITE_BREAKPOINT_MOBILE', 640),   // sm breakpoint
  tablet: getEnvNumber('VITE_BREAKPOINT_TABLET', 768),   // md breakpoint
  desktop: getEnvNumber('VITE_BREAKPOINT_DESKTOP', 1024), // lg breakpoint
  wide: getEnvNumber('VITE_BREAKPOINT_WIDE', 1280),      // xl breakpoint
} as const;

// ============================================================================
// VIEWPORT-RELATIVE DIMENSIONS
// ============================================================================

export const VIEWPORT = {
  height: {
    quarter: '25vh',
    third: '33.33vh',
    half: '50vh',
    twoThirds: '66.67vh',
    threeQuarters: '75vh',
    full: '100vh',
  },
  width: {
    quarter: '25vw',
    third: '33.33vw',
    half: '50vw',
    twoThirds: '66.67vw',
    threeQuarters: '75vw',
    full: '100vw',
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse dimension value to number (removes px, rem, vh, etc.)
 * Flexy: Useful for calculations
 */
export const parseDimension = (value: string): number => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

/**
 * Add units to a numeric value
 * Flexy: Ensures consistent unit application
 */
export const addUnit = (value: number, unit: 'px' | 'rem' | 'em' | 'vh' | 'vw' | '%'): string => {
  return `${value}${unit}`;
};

/**
 * Clamp a dimension value between min and max
 * Flexy: Prevents overflow/underflow
 */
export const clampDimension = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Default export
export default {
  DIMENSIONS,
  BREAKPOINTS,
  VIEWPORT,
  parseDimension,
  addUnit,
  clampDimension,
};
