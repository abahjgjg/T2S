
/**
 * Display Configuration
 * Centralized configuration for list sizes, truncation lengths, and display limits
 * Flexy: Eliminating hardcoded display values throughout the application
 */

// Text truncation lengths used across the application
export const TEXT_TRUNCATION = {
  // Short titles and names
  TITLE_SHORT: 15,
  // Medium length titles
  TITLE_MEDIUM: 20,
  // Longer context previews
  CONTEXT_PREVIEW: 20,
  // Bio and description previews
  BIO_PREVIEW: 100,
  // Strategy summaries
  STRATEGY_PREVIEW: 150,
  // Niche context in blueprints
  NICHE_CONTEXT: 50,
  // Meta descriptions for SEO
  META_DESCRIPTION: 160,
  // Error stack traces
  ERROR_STACK_PREVIEW: 50,
} as const;

// List and grid display limits
export const DISPLAY_LIMITS = {
  // Dashboard recent items
  DASHBOARD_RECENT_BLUEPRINTS: 5,
  // Trend analysis items
  TRENDS_MAX_ITEMS: 5,
  // Search history
  SEARCH_HISTORY_MAX: 5,
  // Search history in dropdown
  SEARCH_HISTORY_DROPDOWN: 3,
  // Category grid items
  CATEGORY_GRID_MAX: 6,
  // Deep dive sources
  DEEP_DIVE_SOURCES: 4,
  // Related blueprints/content
  RELATED_CONTENT_MAX: 3,
  // Tech stack preview
  TECH_STACK_PREVIEW: 3,
  // News wire domains
  NEWS_WIRE_DOMAINS: 3,
  // Agent tasks display
  AGENT_TASKS_MAX: 3,
  // Agent tools display
  AGENT_TOOLS_MAX: 3,
  // Affiliate table page size
  AFFILIATE_PAGE_SIZE: 10,
} as const;

// Pagination defaults
export const PAGINATION_CONFIG = {
  // Default page size for tables and lists
  DEFAULT_PAGE_SIZE: 20,
  // Featured items count
  FEATURED_ITEMS: 6,
  // Maximum items per page
  MAX_PAGE_SIZE: 100,
} as const;

// Directory and browsing limits
export const DIRECTORY_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  FEATURED_LIMIT: 6,
} as const;

// Blueprint preview limits
export const BLUEPRINT_PREVIEW_CONFIG = {
  MAX_TECH_ITEMS: 3,
  ROADMAP_ITEMS: 3,
} as const;

export type TextTruncation = typeof TEXT_TRUNCATION;
export type DisplayLimits = typeof DISPLAY_LIMITS;
