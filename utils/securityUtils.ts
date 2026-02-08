
/**
 * Security utilities for input sanitization and validation.
 * Implements "Trust No Input" principle.
 */

import { VALIDATION_CONFIG } from "../constants/appConfig";

// Re-export from config for backward compatibility
export const MAX_SEARCH_LENGTH = VALIDATION_CONFIG.MAX_SEARCH_LENGTH;
export const MAX_PROMPT_LENGTH = VALIDATION_CONFIG.MAX_PROMPT_LENGTH;

// Regex patterns for sanitization
const HTML_TAG_PATTERN = /<[^>]*>/g;
const SCRIPT_PATTERN = /<script\b[^>]*>([\s\S]*?)<\/script>/gim;
const EVENT_HANDLER_PATTERN = /\bon\w+\s*=/gim;
const JAVASCRIPT_PROTOCOL_PATTERN = /javascript:/gim;

// Patterns common in LLM Jailbreaks (DAN, Developer Mode, etc.)
const INJECTION_PATTERNS = [
  /ignore previous/i,
  /system prompt/i,
  /ignore all instructions/i,
  /you are now/i,
  /developer mode/i,
  /do anything now/i,
  /always answer/i,
  /unfiltered/i,
  /act as/i // Context-dependent, but risky in raw search
];

/**
 * Sanitizes user input to prevent basic injection attacks and format issues.
 * Strips HTML, Script tags, and neutralizes common delimiters.
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // 1. Trim whitespace
  let clean = input.trim();
  
  // 2. Remove non-printable control characters (ASCII 0-31, 127)
  clean = clean.replace(/[\x00-\x1F\x7F]/g, " ");

  // 3. Anti-XSS: Strip script tags and HTML
  clean = clean.replace(SCRIPT_PATTERN, "");
  clean = clean.replace(HTML_TAG_PATTERN, "");
  clean = clean.replace(EVENT_HANDLER_PATTERN, "");
  clean = clean.replace(JAVASCRIPT_PROTOCOL_PATTERN, "");

  // 4. Truncate to avoid token exhaustion or buffer overflow issues
  if (clean.length > MAX_SEARCH_LENGTH) {
    clean = clean.substring(0, MAX_SEARCH_LENGTH);
  }

  // 5. Prompt Injection Defense: 
  // Neutralize common delimiters that might confuse the LLM prompt structure
  for (const pattern of INJECTION_PATTERNS) {
    clean = clean.replace(pattern, "[CLEANED]");
  }

  clean = clean.replace(/```/g, "'''"); // Code blocks
  clean = clean.replace(/\$\{\s*.*\s*\}/g, ""); // Template literal injection attempts
  
  // Neutralize potential JSON breaking characters if injected into JSON context
  clean = clean.replace(/\}\}/g, "} }").replace(/\{\{/g, "{ {");

  return clean;
};

/**
 * Validates input against security constraints.
 * Checks for known Jailbreak patterns and length violations.
 */
export const validateInput = (input: string): { isValid: boolean; error?: string } => {
  if (!input || input.trim().length === 0) {
    return { isValid: false, error: "Input cannot be empty." };
  }
  
  if (input.length > MAX_SEARCH_LENGTH) {
    return { isValid: false, error: `Input too long (max ${MAX_SEARCH_LENGTH} chars).` };
  }
  
  // Check for XSS attempts in raw input
  if (SCRIPT_PATTERN.test(input) || EVENT_HANDLER_PATTERN.test(input)) {
    return { isValid: false, error: "Illegal characters detected." };
  }

  // Heuristic for Prompt Injection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      console.warn(`[Security] Blocked input matching pattern: ${pattern}`);
      return { isValid: false, error: "Invalid input pattern detected (Policy Violation)." };
    }
  }

  return { isValid: true };
};
