
/**
 * Security utilities for input sanitization and validation.
 * Implements "Trust No Input" principle.
 * 
 * Flexy: Now using modular security configuration!
 * No more hardcoded regex patterns - all configurable via env vars
 */

import { VALIDATION_CONFIG } from "../constants/appConfig";
import {
  XSS_PATTERNS,
  INJECTION_PATTERNS,
  SECURITY_VALIDATION,
  SANITIZATION_CONFIG,
} from "../constants/securityConfig";

// Re-export from config for backward compatibility
export const MAX_SEARCH_LENGTH = VALIDATION_CONFIG.MAX_SEARCH_LENGTH;
export const MAX_PROMPT_LENGTH = VALIDATION_CONFIG.MAX_PROMPT_LENGTH;

// Flexy: Patterns now imported from securityConfig - no more hardcoded!

/**
 * Sanitizes user input to prevent basic injection attacks and format issues.
 * Strips HTML, Script tags, and neutralizes common delimiters.
 * 
 * Flexy: All sanitization steps are now configurable via securityConfig!
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  let clean = input;
  
  // 1. Trim whitespace (if enabled)
  if (SANITIZATION_CONFIG.ENABLED.TRIM) {
    clean = clean.trim();
  }
  
  // 2. Remove non-printable control characters (if enabled)
  if (SANITIZATION_CONFIG.ENABLED.CONTROL_CHARS) {
    clean = clean.replace(XSS_PATTERNS.CONTROL_CHARS, " ");
  }

  // 3. Anti-XSS: Strip script tags and HTML (if enabled)
  if (SANITIZATION_CONFIG.ENABLED.SCRIPTS) {
    clean = clean.replace(XSS_PATTERNS.SCRIPT_TAG, "");
  }
  if (SANITIZATION_CONFIG.ENABLED.HTML_TAGS) {
    clean = clean.replace(XSS_PATTERNS.HTML_TAG, "");
  }
  if (SANITIZATION_CONFIG.ENABLED.EVENT_HANDLERS) {
    clean = clean.replace(XSS_PATTERNS.EVENT_HANDLER, "");
  }
  if (SANITIZATION_CONFIG.ENABLED.JS_PROTOCOL) {
    clean = clean.replace(XSS_PATTERNS.JAVASCRIPT_PROTOCOL, "");
  }

  // 4. Truncate to avoid token exhaustion or buffer overflow issues
  if (clean.length > MAX_SEARCH_LENGTH) {
    clean = clean.substring(0, MAX_SEARCH_LENGTH);
  }

  // 5. Prompt Injection Defense (if enabled)
  if (SANITIZATION_CONFIG.ENABLED.INJECTION_PATTERNS) {
    for (const pattern of INJECTION_PATTERNS.patterns) {
      clean = clean.replace(pattern, INJECTION_PATTERNS.replacement);
    }
  }

  // 6. Code blocks (if enabled)
  if (SANITIZATION_CONFIG.ENABLED.CODE_BLOCKS) {
    clean = clean.replace(XSS_PATTERNS.CODE_BLOCK, SANITIZATION_CONFIG.REPLACEMENTS.CODE_BLOCK);
  }
  
  // 7. Template literal injection attempts (if enabled)
  if (SANITIZATION_CONFIG.ENABLED.TEMPLATE_LITERALS) {
    clean = clean.replace(XSS_PATTERNS.TEMPLATE_LITERAL, SANITIZATION_CONFIG.REPLACEMENTS.TEMPLATE_LITERAL);
  }
  
  // 8. JSON breaking characters (if enabled)
  if (SANITIZATION_CONFIG.ENABLED.JSON_CHARS) {
    clean = clean
      .replace(/\}\}/g, SANITIZATION_CONFIG.REPLACEMENTS.JSON_DOUBLE_CLOSE)
      .replace(/\{\{/g, SANITIZATION_CONFIG.REPLACEMENTS.JSON_DOUBLE_OPEN);
  }

  return clean;
};

/**
 * Validates input against security constraints.
 * Checks for known Jailbreak patterns and length violations.
 * 
 * Flexy: All validation steps are now configurable via securityConfig!
 */
export const validateInput = (input: string): { isValid: boolean; error?: string } => {
  if (!input || input.trim().length === 0) {
    return { isValid: false, error: "Input cannot be empty." };
  }
  
  if (input.length > MAX_SEARCH_LENGTH) {
    return { isValid: false, error: `Input too long (max ${MAX_SEARCH_LENGTH} chars).` };
  }
  
  // Check for XSS attempts in raw input (if enabled)
  if (SECURITY_VALIDATION.enableXSSCheck) {
    if (XSS_PATTERNS.SCRIPT_TAG.test(input) || XSS_PATTERNS.EVENT_HANDLER.test(input)) {
      return { isValid: false, error: "Illegal characters detected." };
    }
  }

  // Heuristic for Prompt Injection (if enabled)
  if (SECURITY_VALIDATION.enableInjectionCheck) {
    for (const pattern of INJECTION_PATTERNS.patterns) {
      if (pattern.test(input)) {
        if (SECURITY_VALIDATION.logBlockedPatterns) {
          console.warn(`[Security] Blocked input matching pattern: ${pattern}`);
        }
        return { isValid: false, error: "Invalid input pattern detected (Policy Violation)." };
      }
    }
  }

  return { isValid: true };
};
