
/**
 * Database Table Names
 * Centralized configuration for all database table names
 * This eliminates hardcoded table names throughout the codebase
 */

export const DATABASE_TABLES = {
  // Blueprints and content
  PUBLISHED_BLUEPRINTS: 'published_blueprints',
  
  // Community features
  COMMENTS: 'comments',
  
  // Admin and affiliate system
  AFFILIATE_PRODUCTS: 'affiliate_products',
  
  // Lead capture
  LEADS: 'leads',
  
  // Prompts storage
  PROMPTS: 'prompts',
} as const;

export const DATABASE_SPECIAL_IDS = {
  // Admin lock identifier
  ADMIN_LOCK: 'ADMIN_LOCK',
  
  // System identifiers
  SYSTEM_LOCK_NAME: 'SYSTEM_LOCK',
} as const;

export type DatabaseTable = typeof DATABASE_TABLES[keyof typeof DATABASE_TABLES];
export type DatabaseSpecialId = typeof DATABASE_SPECIAL_IDS[keyof typeof DATABASE_SPECIAL_IDS];
