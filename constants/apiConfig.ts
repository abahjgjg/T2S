/**
 * API Configuration
 * Centralized configuration for all API endpoints and AI parameters
 * 
 * All values can be overridden via environment variables.
 * @deprecated Use config/index.ts instead for direct access to environment-aware configuration
 */

import {
  API_CONFIG,
  API_ENDPOINTS,
  TOKEN_LIMITS,
  THINKING_BUDGETS,
  AI_TEMPERATURES,
  RESPONSE_FORMATS,
  VOICE_NAMES,
  IMAGE_SIZES,
  SPEECH_CONFIG,
  PLACEHOLDER_CONFIG,
} from '../config';

// Re-export for backward compatibility
export {
  API_ENDPOINTS,
  TOKEN_LIMITS,
  THINKING_BUDGETS,
  AI_TEMPERATURES,
  RESPONSE_FORMATS,
  VOICE_NAMES,
  IMAGE_SIZES,
  SPEECH_CONFIG,
  PLACEHOLDER_CONFIG,
  API_CONFIG,
};

// Default export for convenience
export default API_CONFIG;
