
/**
 * Helper to clean AI response text by removing Markdown code blocks if present,
 * and extracting the first valid JSON array or object structure found using bracket balancing.
 */
export const cleanJsonOutput = (text: string): string => {
  let clean = text.trim();

  // 1. Remove markdown code blocks wraps if they exist (common in LLM output)
  clean = clean.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

  // 2. Locate the start of JSON
  const objectStart = clean.indexOf('{');
  const arrayStart = clean.indexOf('[');
  
  // If neither exists, return original (it might be a simple string or malformed)
  if (objectStart === -1 && arrayStart === -1) return clean;

  // Determine which structure comes first
  const isObject = objectStart !== -1 && (arrayStart === -1 || objectStart < arrayStart);
  const startIndex = isObject ? objectStart : arrayStart;
  const openChar = isObject ? '{' : '[';
  const closeChar = isObject ? '}' : ']';

  // 3. Extract using bracket balancing
  // This prevents greedy regex issues where multiple JSON objects might be in the text
  let balance = 0;
  let endIndex = -1;
  let inString = false;
  let isEscaped = false;

  for (let i = startIndex; i < clean.length; i++) {
    const char = clean[i];

    // Handle strings to ignore brackets inside them
    if (char === '"' && !isEscaped) {
      inString = !inString;
    }
    
    if (!inString) {
      if (char === openChar) {
        balance++;
      } else if (char === closeChar) {
        balance--;
        if (balance === 0) {
          endIndex = i;
          break;
        }
      }
    }

    // Track escape char for string logic
    if (char === '\\' && !isEscaped) {
      isEscaped = true;
    } else {
      isEscaped = false;
    }
  }

  if (endIndex !== -1) {
    return clean.substring(startIndex, endIndex + 1);
  }

  // Fallback: If balancing failed (malformed), return from start to end of string
  // attempting to salvage whatever is there.
  return clean.substring(startIndex);
};
