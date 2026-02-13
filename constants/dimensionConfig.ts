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
    chartHeightEmpty: getEnvNumber('VITE_DIMENSION_DASHBOARD_CHART_EMPTY', 200),
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
  
  // Chart heights
  chart: {
    revenue: getEnvNumber('VITE_DIMENSION_CHART_REVENUE', 300),
    audit: getEnvNumber('VITE_DIMENSION_CHART_AUDIT', 250),
  },
  
  // Asset/Content heights
  asset: {
    previewMinHeight: getEnvNumber('VITE_DIMENSION_ASSET_PREVIEW_MIN', 160),
    launchpadMinHeight: getEnvNumber('VITE_DIMENSION_LAUNCHPAD_MIN', 250),
    launchpadMaxHeight: getEnvNumber('VITE_DIMENSION_LAUNCHPAD_MAX', 400),
    newsWireMaxHeight: getEnvNumber('VITE_DIMENSION_NEWSWIRE_MAX', 500),
    emptyStateMinHeight: getEnvNumber('VITE_DIMENSION_EMPTY_STATE_MIN', 300),
  },
  
  // BMC (Business Model Canvas) block heights
  bmc: {
    blockLarge: getEnvNumber('VITE_DIMENSION_BMC_LARGE', 300),
    blockMedium: getEnvNumber('VITE_DIMENSION_BMC_MEDIUM', 150),
    blockSmall: getEnvNumber('VITE_DIMENSION_BMC_SMALL', 120),
  },
  
  // Roadmap widths
  roadmap: {
    itemMinWidth: getEnvNumber('VITE_DIMENSION_ROADMAP_ITEM_MIN', 200),
  },
  
  // Agent card heights
  agent: {
    objectiveMinHeight: getEnvNumber('VITE_DIMENSION_AGENT_OBJECTIVE_MIN', 40),
  },
} as const;

// CSS class builders for Tailwind dimensions
// Note: Tailwind requires full class names at build time, so we use inline styles for dynamic values
// Flexy: These can be overridden via environment variables for maximum modularity

export const DIMENSION_CLASSES = {
  // Heights
  heights: {
    adminLogs: 'max-h-[' + DIMENSIONS.admin.logsMaxHeight + 'px]',
    adminPrompts: 'max-h-[' + DIMENSIONS.admin.promptsMaxHeight + 'px]',
    adminEditor: 'h-[' + DIMENSIONS.admin.editorHeight + 'px]',
    adminLeads: 'max-h-[' + DIMENSIONS.admin.leadsMaxHeight + 'px]',
    dashboardChart: 'h-[' + DIMENSIONS.dashboard.chartHeightSmall + 'px]',
    dashboardEmpty: 'h-[' + DIMENSIONS.dashboard.chartHeightEmpty + 'px]',
    chatModal: 'h-[' + DIMENSIONS.modal.chatHeight + 'px] md:h-[' + DIMENSIONS.modal.chatHeightMd + 'px]',
  },

  // Widths
  widths: {
    presentationMax: 'max-w-[' + DIMENSIONS.presentation.maxWidth + 'px]',
    usernameMax: 'max-w-[' + DIMENSIONS.header.usernameMaxWidth + 'px]',
  },
} as const;

// Helper function to get dimension styles for runtime configuration
// Flexy: This allows dimensions to be truly dynamic based on environment variables
export const getDimensionStyles = (dimensionKey: keyof typeof DIMENSIONS) => {
  return {
    height: DIMENSIONS[dimensionKey],
  };
};

export type Dimensions = typeof DIMENSIONS;

export default DIMENSIONS;
