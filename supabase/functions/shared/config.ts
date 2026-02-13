/**
 * Shared Edge Function Configuration
 * 
 * This module provides centralized configuration for all Supabase Edge Functions.
 * All hardcoded values have been externalized to environment variables with sensible defaults.
 * 
 * Usage:
 *   import { EDGE_CONFIG, MIME_TYPES, HTTP_HEADERS, AI_CONFIG } from '../shared/config.ts';
 */

// Helper to safely get environment variable with fallback
const getEnv = (key: string, defaultValue: string): string => {
  return Deno.env.get(key) ?? defaultValue;
};

// Helper to safely get numeric environment variable with fallback
const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = Deno.env.get(key);
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * HTTP Status Codes
 * Centralized status codes for consistent API responses
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * MIME Types
 * Centralized MIME type definitions for Content-Type headers
 */
export const MIME_TYPES = {
  JSON: 'application/json',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
  FORM: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
  EVENT_STREAM: 'text/event-stream',
  JAVASCRIPT: 'application/javascript',
  CSS: 'text/css',
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  GIF: 'image/gif',
  SVG: 'image/svg+xml',
  WEBP: 'image/webp',
  PDF: 'application/pdf',
  ZIP: 'application/zip',
} as const;

/**
 * HTTP Headers
 * Common header configurations for edge functions
 */
export const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  ACCEPT_ENCODING: 'Accept-Encoding',
  ACCEPT_LANGUAGE: 'Accept-Language',
  CACHE_CONTROL: 'Cache-Control',
  CORS_ORIGIN: 'Access-Control-Allow-Origin',
  CORS_METHODS: 'Access-Control-Allow-Methods',
  CORS_HEADERS: 'Access-Control-Allow-Headers',
  CORS_CREDENTIALS: 'Access-Control-Allow-Credentials',
  CORS_MAX_AGE: 'Access-Control-Max-Age',
} as const;

/**
 * CORS Configuration
 * Configurable CORS headers with environment variable overrides
 */
export const CORS_CONFIG = {
  ORIGIN: getEnv('CORS_ALLOWED_ORIGINS', '*'),
  HEADERS: getEnv('CORS_ALLOWED_HEADERS', 'authorization,x-client-info,apikey,content-type'),
  METHODS: getEnv('CORS_ALLOWED_METHODS', 'GET,POST,PUT,DELETE,OPTIONS'),
  CREDENTIALS: getEnv('CORS_ALLOW_CREDENTIALS', 'false') === 'true',
  MAX_AGE: getEnvNumber('CORS_MAX_AGE', 86400),
} as const;

/**
 * Generate CORS headers object
 */
export const createCorsHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    [HTTP_HEADERS.CORS_ORIGIN]: CORS_CONFIG.ORIGIN,
    [HTTP_HEADERS.CORS_HEADERS]: CORS_CONFIG.HEADERS,
  };
  
  if (CORS_CONFIG.CREDENTIALS) {
    headers[HTTP_HEADERS.CORS_CREDENTIALS] = 'true';
  }
  
  return headers;
};

/**
 * Deno Standard Library Configuration
 * Version and import URLs for Deno std modules
 */
export const DENO_CONFIG = {
  STD_VERSION: getEnv('DENO_STD_VERSION', '0.168.0'),
  get SERVE_URL(): string {
    return `https://deno.land/std@${this.STD_VERSION}/http/server.ts`;
  },
} as const;

/**
 * AI Provider Configuration
 * Base URLs and default parameters for AI providers
 */
export const AI_CONFIG = {
  GEMINI: {
    API_BASE_URL: getEnv('GEMINI_API_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
    DEFAULT_TEMPERATURE: getEnvNumber('GEMINI_DEFAULT_TEMPERATURE', 0.7),
    DEFAULT_MIME_TYPE: getEnv('GEMINI_DEFAULT_MIME_TYPE', 'text/plain'),
    API_KEY_ENV: 'GEMINI_API_KEY',
  },
  OPENAI: {
    API_BASE_URL: getEnv('OPENAI_API_BASE_URL', 'https://api.openai.com/v1'),
    DEFAULT_TEMPERATURE: getEnvNumber('OPENAI_DEFAULT_TEMPERATURE', 0.7),
    DEFAULT_IMAGE_MODEL: getEnv('OPENAI_DEFAULT_IMAGE_MODEL', 'dall-e-3'),
    API_KEY_ENV: 'OPENAI_API_KEY',
  },
} as const;

/**
 * Response Configuration
 * Default response settings for edge functions
 */
export const RESPONSE_CONFIG = {
  DEFAULT_ERROR_MESSAGE: getEnv('DEFAULT_ERROR_MESSAGE', 'An unexpected error occurred'),
  DEFAULT_SUCCESS_MESSAGE: getEnv('DEFAULT_SUCCESS_MESSAGE', 'ok'),
  ERROR_STATUS_CODE: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  SUCCESS_STATUS_CODE: HTTP_STATUS.OK,
} as const;

/**
 * Logging Configuration
 * Log levels and formatting for edge functions
 */
export const LOG_CONFIG = {
  LEVEL: getEnv('LOG_LEVEL', 'info'),
  PREFIX: getEnv('LOG_PREFIX', '[Edge Function]'),
  INCLUDE_TIMESTAMP: getEnv('LOG_INCLUDE_TIMESTAMP', 'true') === 'true',
} as const;

/**
 * Create a standardized JSON response
 */
export const createJsonResponse = (
  data: unknown,
  status: number = HTTP_STATUS.OK,
  headers?: Record<string, string>
): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...createCorsHeaders(),
      [HTTP_HEADERS.CONTENT_TYPE]: MIME_TYPES.JSON,
      ...headers,
    },
  });
};

/**
 * Create a standardized error response
 */
export const createErrorResponse = (
  message: string,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
): Response => {
  return createJsonResponse(
    { error: message },
    status
  );
};

/**
 * Main Edge Configuration Object
 * Export all configuration for easy importing
 */
export const EDGE_CONFIG = {
  HTTP_STATUS,
  MIME_TYPES,
  HTTP_HEADERS,
  CORS_CONFIG,
  DENO_CONFIG,
  AI_CONFIG,
  RESPONSE_CONFIG,
  LOG_CONFIG,
} as const;

export default EDGE_CONFIG;
