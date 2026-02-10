/**
 * Error Messages Configuration
 * Centralized configuration for error messages and user-friendly error mappings
 * 
 * All messages can be overridden via environment variables.
 */

// Helper to safely get env var with fallback
const getEnv = (key: string, defaultValue: string): string => {
  const value = (import.meta as unknown as Record<string, Record<string, string>>)?.env?.[key] 
    ?? (typeof process !== 'undefined' ? process.env?.[key] : undefined);
  return value || defaultValue;
};

/**
 * HTTP Error Messages - User-friendly messages mapped to HTTP status codes
 */
export const HTTP_ERROR_MESSAGES = {
  // 4xx Client Errors
  [403]: getEnv(
    'VITE_ERROR_MESSAGE_403', 
    'API Key invalid or quota exceeded.'
  ),
  [404]: getEnv(
    'VITE_ERROR_MESSAGE_404', 
    'Model not found or unavailable.'
  ),
  [408]: getEnv(
    'VITE_ERROR_MESSAGE_408', 
    'Request timed out. Please try again.'
  ),
  [429]: getEnv(
    'VITE_ERROR_MESSAGE_429', 
    'Too many requests. Please wait a moment.'
  ),

  // 5xx Server Errors
  [500]: getEnv(
    'VITE_ERROR_MESSAGE_500', 
    'Internal server error. Please try again later.'
  ),
  [502]: getEnv(
    'VITE_ERROR_MESSAGE_502', 
    'Service temporarily unavailable. Please retry shortly.'
  ),
  [503]: getEnv(
    'VITE_ERROR_MESSAGE_503', 
    'Service overloaded. Retry shortly.'
  ),
  [504]: getEnv(
    'VITE_ERROR_MESSAGE_504', 
    'Gateway timeout. Please try again.'
  ),
} as const;

/**
 * Generic Error Messages - Fallback messages for various scenarios
 */
export const GENERIC_ERROR_MESSAGES = {
  CONNECTION_ERROR: getEnv(
    'VITE_ERROR_MESSAGE_CONNECTION',
    'Connection error occurred.'
  ),
  MICROPHONE_ACCESS_DENIED: getEnv(
    'VITE_ERROR_MESSAGE_MICROPHONE',
    'Microphone access denied. Please allow audio permissions.'
  ),
  LIVE_SESSION_FAILED: getEnv(
    'VITE_ERROR_MESSAGE_LIVE_SESSION',
    'Failed to access microphone or connect.'
  ),
  UNKNOWN_ERROR: getEnv(
    'VITE_ERROR_MESSAGE_UNKNOWN',
    'An unexpected error occurred.'
  ),
  NETWORK_ERROR: getEnv(
    'VITE_ERROR_MESSAGE_NETWORK',
    'Network error. Please check your connection.'
  ),
  AUTH_ERROR: getEnv(
    'VITE_ERROR_MESSAGE_AUTH',
    'Authentication failed. Please sign in again.'
  ),
} as const;

/**
 * API Provider Specific Error Messages
 */
export const PROVIDER_ERROR_MESSAGES = {
  GEMINI: {
    API_KEY_INVALID: getEnv(
      'VITE_ERROR_GEMINI_API_KEY',
      'Gemini API key is invalid or expired.'
    ),
    QUOTA_EXCEEDED: getEnv(
      'VITE_ERROR_GEMINI_QUOTA',
      'Gemini API quota exceeded. Please try again later.'
    ),
    MODEL_UNAVAILABLE: getEnv(
      'VITE_ERROR_GEMINI_MODEL',
      'Gemini model is currently unavailable.'
    ),
  },
  OPENAI: {
    API_KEY_INVALID: getEnv(
      'VITE_ERROR_OPENAI_API_KEY',
      'OpenAI API key is invalid or expired.'
    ),
    QUOTA_EXCEEDED: getEnv(
      'VITE_ERROR_OPENAI_QUOTA',
      'OpenAI API quota exceeded. Please try again later.'
    ),
    MODEL_UNAVAILABLE: getEnv(
      'VITE_ERROR_OPENAI_MODEL',
      'OpenAI model is currently unavailable.'
    ),
  },
} as const;

/**
 * Retry Error Messages - Messages shown during retry attempts
 */
export const RETRY_MESSAGES = {
  ATTEMPT_FAILED: (attempt: number, maxRetries: number, delayMs: number): string =>
    `Attempt ${attempt}/${maxRetries} failed. Retrying in ${delayMs}ms...`,
  MAX_RETRIES_EXCEEDED: getEnv(
    'VITE_ERROR_MAX_RETRIES',
    'Maximum retry attempts exceeded.'
  ),
  FATAL_ERROR: getEnv(
    'VITE_ERROR_FATAL',
    'A fatal error occurred that cannot be resolved by retrying.'
  ),
} as const;

/**
 * Get user-friendly error message for an HTTP status code
 */
export const getHttpErrorMessage = (statusCode: number | string): string => {
  const code = typeof statusCode === 'string' ? parseInt(statusCode, 10) : statusCode;
  
  if (isNaN(code)) {
    return GENERIC_ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  
  return HTTP_ERROR_MESSAGES[code as keyof typeof HTTP_ERROR_MESSAGES] 
    ?? GENERIC_ERROR_MESSAGES.CONNECTION_ERROR;
};

/**
 * Get error message from an error object (handles various error formats)
 */
export const getErrorMessageFromError = (error: any): string => {
  // If it's a string, check if it contains a status code
  if (typeof error === 'string') {
    // Try to extract status code from error message
    const statusMatch = error.match(/\b(\d{3})\b/);
    if (statusMatch) {
      return getHttpErrorMessage(statusMatch[1]);
    }
    return error;
  }
  
  // If it's an Error object
  if (error instanceof Error) {
    const statusMatch = error.message.match(/\b(\d{3})\b/);
    if (statusMatch) {
      return getHttpErrorMessage(statusMatch[1]);
    }
    return error.message || GENERIC_ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  
  // If it has a status property
  if (error?.status) {
    return getHttpErrorMessage(error.status);
  }
  
  // If it has a response.status
  if (error?.response?.status) {
    return getHttpErrorMessage(error.response.status);
  }
  
  return GENERIC_ERROR_MESSAGES.UNKNOWN_ERROR;
};

export default {
  HTTP_ERROR_MESSAGES,
  GENERIC_ERROR_MESSAGES,
  PROVIDER_ERROR_MESSAGES,
  RETRY_MESSAGES,
  getHttpErrorMessage,
  getErrorMessageFromError,
};
