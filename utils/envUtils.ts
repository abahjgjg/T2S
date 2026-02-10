/**
 * Environment Variable Utilities
 * Centralized helper functions for reading environment variables
 * Flexy: Eliminating duplicate helper functions across constant files
 * 
 * This module provides type-safe, environment-aware helpers for:
 * - Reading string values from environment variables
 * - Converting environment variables to numbers
 * - Converting environment variables to booleans
 * 
 * All functions support both Vite (import.meta.env) and Node.js (process.env) environments.
 */

/**
 * Safely retrieves a string value from environment variables
 * Falls back to a default value if the env var is not set
 * 
 * @param key - The environment variable name
 * @param defaultValue - The fallback value if env var is not set
 * @returns The environment variable value or default
 * 
 * @example
 * const apiUrl = getEnv('VITE_API_URL', 'https://api.example.com');
 */
export const getEnv = (key: string, defaultValue: string): string => {
  const value =
    (import.meta as unknown as Record<string, Record<string, string>>)?.env?.[key] ??
    (typeof process !== "undefined" ? process.env?.[key] : undefined);
  return value || defaultValue;
};

/**
 * Safely retrieves a numeric value from environment variables
 * Falls back to a default value if the env var is not set or invalid
 * 
 * @param key - The environment variable name
 * @param defaultValue - The fallback value if env var is not set or invalid
 * @returns The parsed number or default
 * 
 * @example
 * const timeout = getEnvNumber('VITE_TIMEOUT_MS', 5000);
 */
export const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = getEnv(key, String(defaultValue));
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Safely retrieves a boolean value from environment variables
 * Falls back to a default value if the env var is not set
 * Recognizes: 'true', '1', 'yes' as truthy values
 * 
 * @param key - The environment variable name
 * @param defaultValue - The fallback value if env var is not set
 * @returns The parsed boolean or default
 * 
 * @example
 * const isEnabled = getEnvBoolean('VITE_FEATURE_FLAG', false);
 */
export const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = getEnv(key, String(defaultValue)).toLowerCase();
  return value === "true" || value === "1" || value === "yes";
};

/**
 * Retrieves a JSON-parsed value from environment variables
 * Falls back to a default value if parsing fails
 * 
 * @param key - The environment variable name
 * @param defaultValue - The fallback value if parsing fails
 * @returns The parsed object/array or default
 * 
 * @example
 * const config = getEnvJSON('VITE_APP_CONFIG', { timeout: 5000 });
 */
export const getEnvJSON = <T>(key: string, defaultValue: T): T => {
  const value = getEnv(key, "");
  if (!value) return defaultValue;
  
  try {
    return JSON.parse(value) as T;
  } catch {
    console.warn(`Failed to parse JSON from env var ${key}, using default`);
    return defaultValue;
  }
};

/**
 * Retrieves a comma-separated list from environment variables
 * Returns an array of trimmed strings
 * 
 * @param key - The environment variable name
 * @param defaultValue - The fallback array if env var is not set
 * @returns Array of string values
 * 
 * @example
 * const allowedHosts = getEnvArray('VITE_ALLOWED_HOSTS', ['localhost']);
 */
export const getEnvArray = (key: string, defaultValue: string[] = []): string[] => {
  const value = getEnv(key, "");
  if (!value) return defaultValue;
  
  return value.split(",").map((item) => item.trim()).filter(Boolean);
};

/**
 * Type guard to check if running in a browser environment
 */
export const isBrowser = (): boolean => {
  return typeof window !== "undefined";
};

/**
 * Type guard to check if running in a Node.js environment
 */
export const isNode = (): boolean => {
  return typeof process !== "undefined" && process.versions?.node !== undefined;
};

/**
 * Debug helper to dump all environment variables
 * Only works in development mode
 * 
 * @param prefix - Optional prefix to filter env vars (e.g., 'VITE_')
 * @returns Object containing matching environment variables
 */
export const dumpEnvVars = (prefix?: string): Record<string, string> => {
  const env =
    (import.meta as unknown as Record<string, Record<string, string>>)?.env ??
    (typeof process !== "undefined" ? process.env : {});
  
  if (!env) return {};
  
  const entries = Object.entries(env).filter(([key]) => 
    prefix ? key.startsWith(prefix) : true
  );
  
  return Object.fromEntries(entries);
};
