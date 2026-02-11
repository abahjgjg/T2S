/**
 * Security Configuration
 * Centralized security settings including regex patterns for input sanitization
 * 
 * Flexy: No more hardcoded regex patterns!
 * All patterns can be configured via environment variables
 */

import { getEnv, getEnvArray } from '../utils/envUtils';

/**
 * XSS Prevention Patterns
 * Configurable regex patterns for detecting and sanitizing XSS attempts
 */
export interface XSSPatterns {
  readonly HTML_TAG: RegExp;
  readonly SCRIPT_TAG: RegExp;
  readonly EVENT_HANDLER: RegExp;
  readonly JAVASCRIPT_PROTOCOL: RegExp;
  readonly CONTROL_CHARS: RegExp;
  readonly TEMPLATE_LITERAL: RegExp;
  readonly CODE_BLOCK: RegExp;
  readonly JSON_BREAKING: RegExp;
}

/**
 * Prompt Injection Patterns
 * Patterns to detect and neutralize LLM jailbreak attempts
 */
export interface InjectionPatterns {
  readonly patterns: RegExp[];
  readonly replacement: string;
}

/**
 * Security Validation Settings
 */
export interface SecurityValidation {
  readonly enableXSSCheck: boolean;
  readonly enableInjectionCheck: boolean;
  readonly logBlockedPatterns: boolean;
}

// Default injection patterns (Flexy: Now configurable!)
const DEFAULT_INJECTION_PATTERNS = [
  'ignore previous',
  'system prompt',
  'ignore all instructions',
  'you are now',
  'developer mode',
  'do anything now',
  'always answer',
  'unfiltered',
  'act as',
];

/**
 * XSS Sanitization Patterns
 * All regex patterns are now configurable via environment variables
 */
export const XSS_PATTERNS: XSSPatterns = {
  // HTML tag pattern
  HTML_TAG: new RegExp(
    getEnv('VITE_SECURITY_HTML_TAG_PATTERN', '<[^>]*>'),
    'g'
  ),
  
  // Script tag pattern (case insensitive, multiline)
  SCRIPT_TAG: new RegExp(
    getEnv('VITE_SECURITY_SCRIPT_PATTERN', '<script\\b[^>]*>([\\s\\S]*?)<\\/script>'),
    'gim'
  ),
  
  // Event handler pattern (onload, onclick, etc.)
  EVENT_HANDLER: new RegExp(
    getEnv('VITE_SECURITY_EVENT_HANDLER_PATTERN', '\\bon\\w+\\s*='),
    'gim'
  ),
  
  // JavaScript protocol pattern
  JAVASCRIPT_PROTOCOL: new RegExp(
    getEnv('VITE_SECURITY_JS_PROTOCOL_PATTERN', 'javascript:'),
    'gim'
  ),
  
  // Control characters (ASCII 0-31, 127)
  CONTROL_CHARS: new RegExp(
    getEnv('VITE_SECURITY_CONTROL_CHARS_PATTERN', '[\\x00-\\x1F\\x7F]'),
    'g'
  ),
  
  // Template literal injection attempts
  TEMPLATE_LITERAL: new RegExp(
    getEnv('VITE_SECURITY_TEMPLATE_LITERAL_PATTERN', '\\$\\{\\s*.*\\s*\\}'),
    'g'
  ),
  
  // Code block markers
  CODE_BLOCK: new RegExp(
    getEnv('VITE_SECURITY_CODE_BLOCK_PATTERN', '```'),
    'g'
  ),
  
  // JSON breaking characters
  JSON_BREAKING: new RegExp(
    getEnv('VITE_SECURITY_JSON_BREAKING_PATTERN', '\\}\\}|\\{\\{'),
    'g'
  ),
};

/**
 * LLM Prompt Injection Patterns
 * Configurable list of patterns that indicate jailbreak attempts
 */
export const INJECTION_PATTERNS: InjectionPatterns = {
  patterns: getEnvArray(
    'VITE_SECURITY_INJECTION_PATTERNS',
    DEFAULT_INJECTION_PATTERNS
  ).map(pattern => new RegExp(pattern, 'i')),
  replacement: getEnv('VITE_SECURITY_INJECTION_REPLACEMENT', '[CLEANED]'),
};

/**
 * Security Validation Configuration
 */
export const SECURITY_VALIDATION: SecurityValidation = {
  enableXSSCheck: getEnv('VITE_SECURITY_ENABLE_XSS_CHECK', 'true') === 'true',
  enableInjectionCheck: getEnv('VITE_SECURITY_ENABLE_INJECTION_CHECK', 'true') === 'true',
  logBlockedPatterns: getEnv('VITE_SECURITY_LOG_BLOCKED', 'true') === 'true',
};

/**
 * Sanitization Configuration
 * Settings for input sanitization behavior
 */
export const SANITIZATION_CONFIG = {
  // Replacement strings
  REPLACEMENTS: {
    CODE_BLOCK: getEnv('VITE_SECURITY_CODE_BLOCK_REPLACEMENT', "'''"),
    TEMPLATE_LITERAL: getEnv('VITE_SECURITY_TEMPLATE_LITERAL_REPLACEMENT', ''),
    JSON_DOUBLE_CLOSE: getEnv('VITE_SECURITY_JSON_CLOSE_REPLACEMENT', '} }'),
    JSON_DOUBLE_OPEN: getEnv('VITE_SECURITY_JSON_OPEN_REPLACEMENT', '{ {'),
  },
  
  // Enable/disable specific sanitization steps
  ENABLED: {
    TRIM: getEnv('VITE_SECURITY_ENABLE_TRIM', 'true') === 'true',
    CONTROL_CHARS: getEnv('VITE_SECURITY_ENABLE_CONTROL_CHARS', 'true') === 'true',
    HTML_TAGS: getEnv('VITE_SECURITY_ENABLE_HTML_TAGS', 'true') === 'true',
    SCRIPTS: getEnv('VITE_SECURITY_ENABLE_SCRIPTS', 'true') === 'true',
    EVENT_HANDLERS: getEnv('VITE_SECURITY_ENABLE_EVENT_HANDLERS', 'true') === 'true',
    JS_PROTOCOL: getEnv('VITE_SECURITY_ENABLE_JS_PROTOCOL', 'true') === 'true',
    INJECTION_PATTERNS: getEnv('VITE_SECURITY_ENABLE_INJECTION_PATTERNS', 'true') === 'true',
    CODE_BLOCKS: getEnv('VITE_SECURITY_ENABLE_CODE_BLOCKS', 'true') === 'true',
    TEMPLATE_LITERALS: getEnv('VITE_SECURITY_ENABLE_TEMPLATE_LITERALS', 'true') === 'true',
    JSON_CHARS: getEnv('VITE_SECURITY_ENABLE_JSON_CHARS', 'true') === 'true',
  },
};

// Default export for convenience
export default {
  XSS_PATTERNS,
  INJECTION_PATTERNS,
  SECURITY_VALIDATION,
  SANITIZATION_CONFIG,
};
