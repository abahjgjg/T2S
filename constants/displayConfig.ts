/**
 * Display Configuration
 * Centralized configuration for list sizes, truncation lengths, and display limits
 * Flexy: Uses centralized env utilities for modularity
 * All values can be overridden via environment variables.
 */

import { getEnv, getEnvNumber } from '../utils/envUtils';

// Text truncation lengths used across the application
export const TEXT_TRUNCATION = {
  // Short titles and names
  TITLE_SHORT: getEnvNumber('VITE_DISPLAY_TITLE_SHORT', 15),
  // Medium length titles
  TITLE_MEDIUM: getEnvNumber('VITE_DISPLAY_TITLE_MEDIUM', 20),
  // Longer context previews
  CONTEXT_PREVIEW: getEnvNumber('VITE_DISPLAY_CONTEXT_PREVIEW', 20),
  // Bio and description previews
  BIO_PREVIEW: getEnvNumber('VITE_DISPLAY_BIO_PREVIEW', 100),
  // Strategy summaries
  STRATEGY_PREVIEW: getEnvNumber('VITE_DISPLAY_STRATEGY_PREVIEW', 150),
  // Niche context in blueprints
  NICHE_CONTEXT: getEnvNumber('VITE_DISPLAY_NICHE_CONTEXT', 50),
  // Meta descriptions for SEO
  META_DESCRIPTION: getEnvNumber('VITE_DISPLAY_META_DESCRIPTION', 160),
  // Error stack traces
  ERROR_STACK_PREVIEW: getEnvNumber('VITE_DISPLAY_ERROR_STACK_PREVIEW', 50),
} as const;

// List and grid display limits
export const DISPLAY_LIMITS = {
  // Dashboard recent items
  DASHBOARD_RECENT_BLUEPRINTS: getEnvNumber('VITE_DISPLAY_DASHBOARD_RECENT', 5),
  // Trend analysis items
  TRENDS_MAX_ITEMS: getEnvNumber('VITE_DISPLAY_TRENDS_MAX', 5),
  // Search history
  SEARCH_HISTORY_MAX: getEnvNumber('VITE_DISPLAY_SEARCH_HISTORY_MAX', 5),
  // Search history in dropdown
  SEARCH_HISTORY_DROPDOWN: getEnvNumber('VITE_DISPLAY_SEARCH_HISTORY_DROPDOWN', 3),
  // Category grid items
  CATEGORY_GRID_MAX: getEnvNumber('VITE_DISPLAY_CATEGORY_GRID_MAX', 6),
  // Deep dive sources
  DEEP_DIVE_SOURCES: getEnvNumber('VITE_DISPLAY_DEEP_DIVE_SOURCES', 4),
  // Related blueprints/content
  RELATED_CONTENT_MAX: getEnvNumber('VITE_DISPLAY_RELATED_CONTENT_MAX', 3),
  // Tech stack preview
  TECH_STACK_PREVIEW: getEnvNumber('VITE_DISPLAY_TECH_STACK_PREVIEW', 3),
  // News wire domains
  NEWS_WIRE_DOMAINS: getEnvNumber('VITE_DISPLAY_NEWS_WIRE_DOMAINS', 3),
  // Agent tasks display
  AGENT_TASKS_MAX: getEnvNumber('VITE_DISPLAY_AGENT_TASKS_MAX', 3),
  // Agent tools display
  AGENT_TOOLS_MAX: getEnvNumber('VITE_DISPLAY_AGENT_TOOLS_MAX', 3),
  // Affiliate table page size
  AFFILIATE_PAGE_SIZE: getEnvNumber('VITE_DISPLAY_AFFILIATE_PAGE_SIZE', 10),
} as const;

// Pagination defaults
export const PAGINATION_CONFIG = {
  // Default page size for tables and lists
  DEFAULT_PAGE_SIZE: getEnvNumber('VITE_DISPLAY_PAGINATION_DEFAULT', 20),
  // Featured items count
  FEATURED_ITEMS: getEnvNumber('VITE_DISPLAY_FEATURED_ITEMS', 6),
  // Maximum items per page
  MAX_PAGE_SIZE: getEnvNumber('VITE_DISPLAY_MAX_PAGE_SIZE', 100),
} as const;

// Directory and browsing limits
export const DIRECTORY_CONFIG = {
  DEFAULT_PAGE_SIZE: getEnvNumber('VITE_DISPLAY_DIRECTORY_PAGE_SIZE', 20),
  FEATURED_LIMIT: getEnvNumber('VITE_DISPLAY_DIRECTORY_FEATURED', 6),
} as const;

// Blueprint preview limits
export const BLUEPRINT_PREVIEW_CONFIG = {
  MAX_TECH_ITEMS: getEnvNumber('VITE_DISPLAY_BLUEPRINT_TECH_ITEMS', 3),
  ROADMAP_ITEMS: getEnvNumber('VITE_DISPLAY_BLUEPRINT_ROADMAP_ITEMS', 3),
} as const;

export type TextTruncation = typeof TEXT_TRUNCATION;
export type DisplayLimits = typeof DISPLAY_LIMITS;

// Default export for convenience
export default {
  TEXT_TRUNCATION,
  DISPLAY_LIMITS,
  PAGINATION_CONFIG,
  DIRECTORY_CONFIG,
  BLUEPRINT_PREVIEW_CONFIG,
};
