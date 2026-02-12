/**
 * Chat Role Constants
 * Flexy: Centralized chat role definitions for consistent usage across the application
 * Eliminates hardcoded 'user', 'model', 'system' strings
 * All values can be overridden via environment variables.
 */

import { getEnv } from '../utils/envUtils';

/**
 * Chat message roles for AI conversations
 * Use these instead of hardcoded strings
 */
export const CHAT_ROLES = {
  /**
   * Role for user messages
   * Environment override: VITE_CHAT_ROLE_USER
   */
  USER: getEnv('VITE_CHAT_ROLE_USER', 'user'),
  
  /**
   * Role for AI model/agent responses
   * Environment override: VITE_CHAT_ROLE_MODEL
   */
  MODEL: getEnv('VITE_CHAT_ROLE_MODEL', 'model'),
  
  /**
   * Role for system/instruction messages
   * Environment override: VITE_CHAT_ROLE_SYSTEM
   */
  SYSTEM: getEnv('VITE_CHAT_ROLE_SYSTEM', 'system'),
  
  /**
   * Role for assistant messages (OpenAI format)
   * Environment override: VITE_CHAT_ROLE_ASSISTANT
   */
  ASSISTANT: getEnv('VITE_CHAT_ROLE_ASSISTANT', 'assistant'),
} as const;

/**
 * Type for chat role values
 */
export type ChatRole = typeof CHAT_ROLES[keyof typeof CHAT_ROLES];

/**
 * Role mapping for different AI providers
 * Maps internal roles to provider-specific formats
 */
export const PROVIDER_ROLE_MAP = {
  /**
   * OpenAI uses: system, user, assistant
   */
  openai: {
    [CHAT_ROLES.SYSTEM]: CHAT_ROLES.SYSTEM,
    [CHAT_ROLES.USER]: CHAT_ROLES.USER,
    [CHAT_ROLES.MODEL]: CHAT_ROLES.ASSISTANT,
    [CHAT_ROLES.ASSISTANT]: CHAT_ROLES.ASSISTANT,
  },
  
  /**
   * Gemini uses: user, model (no system role in the same way)
   */
  gemini: {
    [CHAT_ROLES.SYSTEM]: CHAT_ROLES.USER,
    [CHAT_ROLES.USER]: CHAT_ROLES.USER,
    [CHAT_ROLES.MODEL]: CHAT_ROLES.MODEL,
    [CHAT_ROLES.ASSISTANT]: CHAT_ROLES.MODEL,
  },
} as const;

/**
 * Get the provider-specific role mapping
 * @param provider - The AI provider (openai, gemini)
 * @param role - The internal role constant
 * @returns The provider-specific role string
 */
export const getProviderRole = (
  provider: keyof typeof PROVIDER_ROLE_MAP,
  role: ChatRole
): string => {
  return PROVIDER_ROLE_MAP[provider][role] || role;
};

/**
 * Check if a role is a user role
 */
export const isUserRole = (role: string): boolean => 
  role === CHAT_ROLES.USER;

/**
 * Check if a role is a model/assistant role
 */
export const isModelRole = (role: string): boolean => 
  role === CHAT_ROLES.MODEL || role === CHAT_ROLES.ASSISTANT;

/**
 * Check if a role is a system role
 */
export const isSystemRole = (role: string): boolean => 
  role === CHAT_ROLES.SYSTEM;

export default {
  CHAT_ROLES,
  PROVIDER_ROLE_MAP,
  getProviderRole,
  isUserRole,
  isModelRole,
  isSystemRole,
};
