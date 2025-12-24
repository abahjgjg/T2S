
import { sanitizeInput } from "./securityUtils";

/**
 * Replaces {{variable}} placeholders in a template string with values from a variables object.
 * Handles strings, numbers, and JSON stringifies objects/arrays.
 * 
 * SECURITY: Automatically sanitizes string values to prevent basic prompt injection.
 */
export const interpolate = (template: string, variables: Record<string, any>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = variables[key];
    
    if (value === undefined || value === null) {
      console.warn(`Missing variable for interpolation: ${key}`);
      return `{{${key}}}`;
    }
    
    if (Array.isArray(value) || typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    // Auto-sanitize strings to neutralize potential injection patterns
    if (typeof value === 'string') {
      return sanitizeInput(value);
    }

    return String(value);
  });
};
