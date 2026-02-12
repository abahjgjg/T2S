/**
 * Dimension Configuration
 * Centralized dimension values for consistent component sizing
 * Flexy: Eliminates hardcoded heights, widths, and max-dimensions
 * All values can be overridden via environment variables.
 */

import { getEnvNumber } from '../utils/envUtils';

// Height configurations (in pixels)
export const DIMENSIONS = {
  // Admin panel heights
  admin: {
    logsMaxHeight: getEnvNumber('VITE_DIMENSION_ADMIN_LOGS_MAX_HEIGHT', 600),
    promptsMaxHeight: getEnvNumber('VITE_DIMENSION_ADMIN_PROMPTS_MAX_HEIGHT', 600),
    editorHeight: getEnvNumber('VITE_DIMENSION_ADMIN_EDITOR_HEIGHT', 600),
    leadsMaxHeight: getEnvNumber('VITE_DIMENSION_ADMIN_LEADS_MAX_HEIGHT', 500),
  },
  
  // Dashboard heights
  dashboard: {
    chartHeightSmall: getEnvNumber('VITE_DIMENSION_DASHBOARD_CHART_SMALL', 250),
    emptyStateHeight: getEnvNumber('VITE_DIMENSION_DASHBOARD_EMPTY', 200),
  },
  
  // Modal heights
  modal: {
    chatHeight: getEnvNumber('VITE_DIMENSION_MODAL_CHAT_HEIGHT', 500),
    chatHeightMd: getEnvNumber('VITE_DIMENSION_MODAL_CHAT_HEIGHT_MD', 600),
  },
  
  // Presentation mode
  presentation: {
    maxWidth: getEnvNumber('VITE_DIMENSION_PRESENTATION_MAX_WIDTH', 1600),
  },
  
  // Header components
  header: {
    usernameMaxWidth: getEnvNumber('VITE_DIMENSION_HEADER_USERNAME_MAX', 80),
  },
} as const;

// CSS class builders for Tailwind dimensions
export const DIMENSION_CLASSES = {
  // Heights
  heights: {
    adminLogs: `max-h-[${DIMENSIONS.admin.logsMaxHeight}px]`,
    adminPrompts: `max-h-[${DIMENSIONS.admin.promptsMaxHeight}px]`,
    adminEditor: `h-[${DIMENSIONS.admin.editorHeight}px]`,
    adminLeads: `max-h-[${DIMENSIONS.admin.leadsMaxHeight}px]`,
    dashboardChart: `h-[${DIMENSIONS.dashboard.chartHeightSmall}px]`,
    dashboardEmpty: `h-[${DIMENSIONS.dashboard.emptyStateHeight}px]`,
    chatModal: `h-[${DIMENSIONS.modal.chatHeight}px] md:h-[${DIMENSIONS.modal.chatHeightMd}px]`,
  },
  
  // Widths
  widths: {
    presentationMax: `max-w-[${DIMENSIONS.presentation.maxWidth}px]`,
    usernameMax: `max-w-[${DIMENSIONS.header.usernameMaxWidth}px]`,
  },
} as const;

export type Dimensions = typeof DIMENSIONS;

export default DIMENSIONS;
