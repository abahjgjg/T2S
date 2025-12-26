
import { describe, it, expect } from 'vitest';
import { cleanJsonOutput } from './textUtils';

describe('textUtils', () => {
  describe('cleanJsonOutput', () => {
    it('should return valid JSON string unchanged', () => {
      const input = '{"key": "value"}';
      expect(cleanJsonOutput(input)).toBe(input);
    });

    it('should remove markdown code blocks', () => {
      const input = '```json\n{"key": "value"}\n```';
      expect(cleanJsonOutput(input)).toBe('{"key": "value"}');
    });

    it('should remove markdown without language identifier', () => {
      const input = '```\n{"key": "value"}\n```';
      expect(cleanJsonOutput(input)).toBe('{"key": "value"}');
    });

    it('should extract JSON object from surrounding text', () => {
      const input = 'Here is the response: {"key": "value"} Hope this helps.';
      expect(cleanJsonOutput(input)).toBe('{"key": "value"}');
    });

    it('should extract JSON array from surrounding text', () => {
      const input = 'Sure, look at this: [{"id": 1}, {"id": 2}]';
      expect(cleanJsonOutput(input)).toBe('[{"id": 1}, {"id": 2}]');
    });

    it('should prioritize the first found structure (Object vs Array)', () => {
      const input = 'Data: {"a": 1} and also [1, 2]';
      expect(cleanJsonOutput(input)).toBe('{"a": 1}');
    });

    it('should handle nested brackets correctly', () => {
      const input = '{"a": {"b": [1, 2]}, "c": "text"}';
      expect(cleanJsonOutput(input)).toBe(input);
    });

    it('should handle brackets inside strings (Edge Case)', () => {
      const input = '{"key": "This is a bracket } inside a string"}';
      // The parser logic must be smart enough to ignore the } inside the string
      expect(cleanJsonOutput(input)).toBe(input);
    });

    it('should handle escaped quotes inside strings', () => {
      const input = '{"key": "He said \\"hello\\""}';
      expect(cleanJsonOutput(input)).toBe(input);
    });

    it('should handle multiple nested objects', () => {
      const input = 'Prefix {"outer": {"inner": {"deep": "value"}}} Suffix';
      expect(cleanJsonOutput(input)).toBe('{"outer": {"inner": {"deep": "value"}}}');
    });

    it('should return trimmed input if no JSON structure found', () => {
      const input = '  Just plain text  ';
      expect(cleanJsonOutput(input)).toBe('Just plain text');
    });

    it('should attempt salvage if unbalanced (return rest of string)', () => {
      // Logic fallback: If balancing fails, it returns startIndex substring
      const input = 'Prefix {"key": "value" missing closing brace';
      expect(cleanJsonOutput(input)).toBe('{"key": "value" missing closing brace');
    });
  });
});
