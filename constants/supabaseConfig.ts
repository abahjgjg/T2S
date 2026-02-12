/**
 * Supabase Configuration Module
 * Flexy: Eliminating hardcoded validation patterns!
 * 
 * All Supabase validation settings are now configurable via environment variables
 */

import { getEnv, getEnvArray, getEnvBoolean } from '../utils/envUtils';

/**
 * Supabase validation configuration interface
 */
export interface SupabaseValidationConfig {
  readonly INVALID_URL_PATTERNS: string[];
  readonly VALID_DOMAIN_SUFFIXES: string[];
  readonly REQUIRE_HTTPS: boolean;
  readonly INVALID_KEY_PATTERNS: string[];
}

/**
 * Default invalid URL patterns - Flexy: Now configurable!
 * These patterns will cause a Supabase URL to be rejected as invalid
 */
const DEFAULT_INVALID_URL_PATTERNS = [
  'dummy',
  'placeholder',
  'example',
  'test',
  'localhost',
  '127.0.0.1',
];

/**
 * Default valid domain suffixes - Flexy: Now configurable!
 * Supabase URLs must end with one of these suffixes to be considered valid
 */
const DEFAULT_VALID_DOMAIN_SUFFIXES = [
  '.supabase.co',
  '.supabase.in',
  '.supabase.net',
];

/**
 * Default invalid key patterns - Flexy: Now configurable!
 * These patterns will cause a Supabase key to be rejected as invalid
 */
const DEFAULT_INVALID_KEY_PATTERNS = [
  'dummy',
  'placeholder',
  'example',
  'test',
];

/**
 * Supabase validation configuration
 * Flexy: No more hardcoded validation logic!
 */
export const SUPABASE_VALIDATION: SupabaseValidationConfig = {
  INVALID_URL_PATTERNS: getEnvArray(
    'VITE_SUPABASE_INVALID_URL_PATTERNS',
    DEFAULT_INVALID_URL_PATTERNS
  ),
  VALID_DOMAIN_SUFFIXES: getEnvArray(
    'VITE_SUPABASE_VALID_DOMAIN_SUFFIXES',
    DEFAULT_VALID_DOMAIN_SUFFIXES
  ),
  REQUIRE_HTTPS: getEnvBoolean('VITE_SUPABASE_REQUIRE_HTTPS', true),
  INVALID_KEY_PATTERNS: getEnvArray(
    'VITE_SUPABASE_INVALID_KEY_PATTERNS',
    DEFAULT_INVALID_KEY_PATTERNS
  ),
};

/**
 * Validates a Supabase URL against configured rules
 * Flexy: Modular validation - no more hardcoded checks!
 * 
 * @param url - The Supabase URL to validate
 * @returns boolean indicating if the URL is valid
 */
export const isValidSupabaseUrl = (url: string): boolean => {
  // Check for invalid patterns
  if (!url) return false;
  
  for (const pattern of SUPABASE_VALIDATION.INVALID_URL_PATTERNS) {
    if (url.toLowerCase().includes(pattern.toLowerCase())) {
      return false;
    }
  }

  try {
    const urlObj = new URL(url);
    
    // Check HTTPS requirement
    if (SUPABASE_VALIDATION.REQUIRE_HTTPS && urlObj.protocol !== 'https:') {
      return false;
    }
    
    // Check domain suffix
    const hasValidSuffix = SUPABASE_VALIDATION.VALID_DOMAIN_SUFFIXES.some(
      suffix => urlObj.hostname.toLowerCase().endsWith(suffix.toLowerCase())
    );
    
    return hasValidSuffix;
  } catch {
    return false;
  }
};

/**
 * Validates a Supabase key against configured rules
 * Flexy: Modular validation - no more hardcoded checks!
 * 
 * @param key - The Supabase key to validate
 * @returns boolean indicating if the key is valid
 */
export const isValidSupabaseKey = (key: string): boolean => {
  if (!key || key.length < 10) return false;
  
  // Check for invalid patterns
  for (const pattern of SUPABASE_VALIDATION.INVALID_KEY_PATTERNS) {
    if (key.toLowerCase().includes(pattern.toLowerCase())) {
      return false;
    }
  }
  
  return true;
};

// Re-export for convenience
export { getEnv, getEnvArray, getEnvBoolean };
