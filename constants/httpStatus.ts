/**
 * HTTP Status Codes Configuration
 * Centralized configuration for HTTP status codes and their meanings
 * 
 * All values can be overridden via environment variables.
 */

// Helper to safely get env var with fallback
const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = (import.meta as unknown as Record<string, Record<string, string>>)?.env?.[key] 
    ?? (typeof process !== 'undefined' ? process.env?.[key] : undefined)
    ?? String(defaultValue);
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * HTTP Status Codes - Standard RFC 7231 compliant status codes
 */
export const HTTP_STATUS = {
  // 2xx Success
  OK: getEnvNumber('VITE_HTTP_STATUS_OK', 200),
  CREATED: getEnvNumber('VITE_HTTP_STATUS_CREATED', 201),
  ACCEPTED: getEnvNumber('VITE_HTTP_STATUS_ACCEPTED', 202),
  NO_CONTENT: getEnvNumber('VITE_HTTP_STATUS_NO_CONTENT', 204),

  // 3xx Redirection
  MOVED_PERMANENTLY: getEnvNumber('VITE_HTTP_STATUS_MOVED_PERMANENTLY', 301),
  FOUND: getEnvNumber('VITE_HTTP_STATUS_FOUND', 302),
  NOT_MODIFIED: getEnvNumber('VITE_HTTP_STATUS_NOT_MODIFIED', 304),
  TEMPORARY_REDIRECT: getEnvNumber('VITE_HTTP_STATUS_TEMPORARY_REDIRECT', 307),
  PERMANENT_REDIRECT: getEnvNumber('VITE_HTTP_STATUS_PERMANENT_REDIRECT', 308),

  // 4xx Client Errors
  BAD_REQUEST: getEnvNumber('VITE_HTTP_STATUS_BAD_REQUEST', 400),
  UNAUTHORIZED: getEnvNumber('VITE_HTTP_STATUS_UNAUTHORIZED', 401),
  FORBIDDEN: getEnvNumber('VITE_HTTP_STATUS_FORBIDDEN', 403),
  NOT_FOUND: getEnvNumber('VITE_HTTP_STATUS_NOT_FOUND', 404),
  METHOD_NOT_ALLOWED: getEnvNumber('VITE_HTTP_STATUS_METHOD_NOT_ALLOWED', 405),
  REQUEST_TIMEOUT: getEnvNumber('VITE_HTTP_STATUS_REQUEST_TIMEOUT', 408),
  CONFLICT: getEnvNumber('VITE_HTTP_STATUS_CONFLICT', 409),
  GONE: getEnvNumber('VITE_HTTP_STATUS_GONE', 410),
  UNPROCESSABLE_ENTITY: getEnvNumber('VITE_HTTP_STATUS_UNPROCESSABLE_ENTITY', 422),
  TOO_MANY_REQUESTS: getEnvNumber('VITE_HTTP_STATUS_TOO_MANY_REQUESTS', 429),

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: getEnvNumber('VITE_HTTP_STATUS_INTERNAL_SERVER_ERROR', 500),
  NOT_IMPLEMENTED: getEnvNumber('VITE_HTTP_STATUS_NOT_IMPLEMENTED', 501),
  BAD_GATEWAY: getEnvNumber('VITE_HTTP_STATUS_BAD_GATEWAY', 502),
  SERVICE_UNAVAILABLE: getEnvNumber('VITE_HTTP_STATUS_SERVICE_UNAVAILABLE', 503),
  GATEWAY_TIMEOUT: getEnvNumber('VITE_HTTP_STATUS_GATEWAY_TIMEOUT', 504),
} as const;

/**
 * HTTP Status Ranges - For range-based checks
 */
export const HTTP_STATUS_RANGES = {
  INFORMATIONAL: { MIN: 100, MAX: 199 },
  SUCCESS: { MIN: 200, MAX: 299 },
  REDIRECTION: { MIN: 300, MAX: 399 },
  CLIENT_ERROR: { MIN: 400, MAX: 499 },
  SERVER_ERROR: { MIN: 500, MAX: 599 },
} as const;

/**
 * Retry Configuration - Which status codes should be retried
 */
export const RETRY_STATUS_CONFIG = {
  // Status codes that should always be retried
  ALWAYS_RETRY: [
    HTTP_STATUS.REQUEST_TIMEOUT,    // 408
    HTTP_STATUS.TOO_MANY_REQUESTS,  // 429
    HTTP_STATUS.BAD_GATEWAY,        // 502
    HTTP_STATUS.SERVICE_UNAVAILABLE, // 503
    HTTP_STATUS.GATEWAY_TIMEOUT,    // 504
  ],
  
  // Status codes that are fatal (should not be retried)
  FATAL_CLIENT_ERRORS: {
    MIN: HTTP_STATUS_RANGES.CLIENT_ERROR.MIN,
    MAX: HTTP_STATUS_RANGES.CLIENT_ERROR.MAX,
    EXCLUDE: [HTTP_STATUS.REQUEST_TIMEOUT, HTTP_STATUS.TOO_MANY_REQUESTS],
  },
} as const;

/**
 * Type guard to check if a status code is in a specific range
 */
export const isStatusInRange = (
  status: number, 
  min: number, 
  max: number
): boolean => status >= min && status <= max;

/**
 * Check if a status code is a client error (4xx)
 */
export const isClientError = (status: number): boolean => 
  isStatusInRange(status, HTTP_STATUS_RANGES.CLIENT_ERROR.MIN, HTTP_STATUS_RANGES.CLIENT_ERROR.MAX);

/**
 * Check if a status code is a server error (5xx)
 */
export const isServerError = (status: number): boolean => 
  isStatusInRange(status, HTTP_STATUS_RANGES.SERVER_ERROR.MIN, HTTP_STATUS_RANGES.SERVER_ERROR.MAX);

/**
 * Check if a status code should be retried
 */
export const shouldRetryStatus = (status: number): boolean => {
  if (RETRY_STATUS_CONFIG.ALWAYS_RETRY.includes(status)) return true;
  if (isServerError(status)) return true;
  return false;
};

/**
 * Check if a status code represents a fatal client error
 */
export const isFatalClientError = (status: number): boolean => {
  if (!isClientError(status)) return false;
  if (RETRY_STATUS_CONFIG.FATAL_CLIENT_ERRORS.EXCLUDE.includes(status)) return false;
  return true;
};

/**
 * MIME Types - Standard MIME type definitions for Content-Type headers
 * All values can be overridden via environment variables.
 */
const getEnvString = (key: string, defaultValue: string): string => {
  const value = (import.meta as unknown as Record<string, Record<string, string>>)?.env?.[key]
    ?? (typeof process !== 'undefined' ? process.env?.[key] : undefined)
    ?? defaultValue;
  return value;
};

export const MIME_TYPES = {
  // Application types
  JSON: getEnvString('VITE_MIME_TYPE_JSON', 'application/json'),
  XML: getEnvString('VITE_MIME_TYPE_XML', 'application/xml'),
  FORM: getEnvString('VITE_MIME_TYPE_FORM', 'application/x-www-form-urlencoded'),
  JAVASCRIPT: getEnvString('VITE_MIME_TYPE_JAVASCRIPT', 'application/javascript'),
  PDF: getEnvString('VITE_MIME_TYPE_PDF', 'application/pdf'),
  ZIP: getEnvString('VITE_MIME_TYPE_ZIP', 'application/zip'),
  
  // Text types
  TEXT: getEnvString('VITE_MIME_TYPE_TEXT', 'text/plain'),
  HTML: getEnvString('VITE_MIME_TYPE_HTML', 'text/html'),
  CSS: getEnvString('VITE_MIME_TYPE_CSS', 'text/css'),
  EVENT_STREAM: getEnvString('VITE_MIME_TYPE_EVENT_STREAM', 'text/event-stream'),
  
  // Image types
  PNG: getEnvString('VITE_MIME_TYPE_PNG', 'image/png'),
  JPEG: getEnvString('VITE_MIME_TYPE_JPEG', 'image/jpeg'),
  GIF: getEnvString('VITE_MIME_TYPE_GIF', 'image/gif'),
  SVG: getEnvString('VITE_MIME_TYPE_SVG', 'image/svg+xml'),
  WEBP: getEnvString('VITE_MIME_TYPE_WEBP', 'image/webp'),
  
  // Multipart
  MULTIPART: getEnvString('VITE_MIME_TYPE_MULTIPART', 'multipart/form-data'),
} as const;

/**
 * HTTP Headers - Common HTTP header names
 */
export const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  CONTENT_LENGTH: 'Content-Length',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  ACCEPT_ENCODING: 'Accept-Encoding',
  ACCEPT_LANGUAGE: 'Accept-Language',
  CACHE_CONTROL: 'Cache-Control',
  ETAG: 'ETag',
  IF_NONE_MATCH: 'If-None-Match',
  LAST_MODIFIED: 'Last-Modified',
  LOCATION: 'Location',
  
  // CORS headers
  CORS_ORIGIN: 'Access-Control-Allow-Origin',
  CORS_METHODS: 'Access-Control-Allow-Methods',
  CORS_HEADERS: 'Access-Control-Allow-Headers',
  CORS_CREDENTIALS: 'Access-Control-Allow-Credentials',
  CORS_MAX_AGE: 'Access-Control-Max-Age',
  
  // Security headers
  X_CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
  X_FRAME_OPTIONS: 'X-Frame-Options',
  X_XSS_PROTECTION: 'X-XSS-Protection',
  STRICT_TRANSPORT_SECURITY: 'Strict-Transport-Security',
  REFERRER_POLICY: 'Referrer-Policy',
} as const;

/**
 * CORS Configuration
 * Default CORS settings, can be overridden via environment variables
 */
export const CORS_CONFIG = {
  ALLOWED_ORIGINS: getEnvString('VITE_CORS_ALLOWED_ORIGINS', '*'),
  ALLOWED_METHODS: getEnvString('VITE_CORS_ALLOWED_METHODS', 'GET,POST,PUT,DELETE,OPTIONS'),
  ALLOWED_HEADERS: getEnvString('VITE_CORS_ALLOWED_HEADERS', 'authorization,x-client-info,apikey,content-type'),
  ALLOW_CREDENTIALS: getEnvString('VITE_CORS_ALLOW_CREDENTIALS', 'false') === 'true',
  MAX_AGE: getEnvNumber('VITE_CORS_MAX_AGE', 86400),
} as const;

export default {
  HTTP_STATUS,
  HTTP_STATUS_RANGES,
  RETRY_STATUS_CONFIG,
  MIME_TYPES,
  HTTP_HEADERS,
  CORS_CONFIG,
  isStatusInRange,
  isClientError,
  isServerError,
  shouldRetryStatus,
  isFatalClientError,
};
