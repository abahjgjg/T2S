/**
 * CSS Variables Configuration Tests
 * Flexy: Ensuring modularity through comprehensive testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CSS_VARIABLES,
  CSS_COLORS,
  CSS_ANIMATIONS,
  CSS_LAYOUT,
  CSS_TYPOGRAPHY,
  generateCSSVariables,
  getCSSVariable,
  generateStyleObject,
} from './cssVariables';

describe('CSS Variables Configuration', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('CSS_COLORS', () => {
    it('should have all required color variables defined', () => {
      expect(CSS_COLORS['--color-primary-emerald']).toBeDefined();
      expect(CSS_COLORS['--color-slate-900']).toBeDefined();
      expect(CSS_COLORS['--color-scrollbar-track']).toBeDefined();
      expect(CSS_COLORS['--color-focus']).toBeDefined();
    });

    it('should have valid hex color values', () => {
      const hexColorRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;
      
      Object.entries(CSS_COLORS).forEach(([key, value]) => {
        if (typeof value === 'string' && value.startsWith('#')) {
          expect(value).toMatch(hexColorRegex);
        }
      });
    });

    it('should have default values for essential colors', () => {
      expect(CSS_COLORS['--color-primary-emerald']).toBe('#10b981');
      expect(CSS_COLORS['--color-slate-950']).toBe('#020617');
      expect(CSS_COLORS['--color-success']).toBe('#10b981');
    });
  });

  describe('CSS_ANIMATIONS', () => {
    it('should have all animation duration variables defined', () => {
      expect(CSS_ANIMATIONS['--animation-duration-shimmer']).toBeDefined();
      expect(CSS_ANIMATIONS['--animation-duration-marquee']).toBeDefined();
      expect(CSS_ANIMATIONS['--animation-duration-spin-slow']).toBeDefined();
      expect(CSS_ANIMATIONS['--animation-duration-float']).toBeDefined();
      expect(CSS_ANIMATIONS['--animation-duration-shake']).toBeDefined();
    });

    it('should have duration values in milliseconds format', () => {
      Object.values(CSS_ANIMATIONS).forEach((value) => {
        expect(value).toMatch(/^\d+ms$/);
      });
    });

    it('should have sensible default durations', () => {
      expect(CSS_ANIMATIONS['--animation-duration-shimmer']).toBe('2000ms');
      expect(CSS_ANIMATIONS['--animation-duration-marquee']).toBe('30000ms');
      expect(CSS_ANIMATIONS['--animation-duration-shake']).toBe('500ms');
    });
  });

  describe('CSS_LAYOUT', () => {
    it('should have all layout variables defined', () => {
      expect(CSS_LAYOUT['--scrollbar-width']).toBeDefined();
      expect(CSS_LAYOUT['--scrollbar-height']).toBeDefined();
      expect(CSS_LAYOUT['--outline-width']).toBeDefined();
      expect(CSS_LAYOUT['--outline-offset']).toBeDefined();
    });

    it('should have pixel values for layout variables', () => {
      Object.values(CSS_LAYOUT).forEach((value) => {
        expect(value).toMatch(/^\d+px$/);
      });
    });
  });

  describe('CSS_TYPOGRAPHY', () => {
    it('should have all typography variables defined', () => {
      expect(CSS_TYPOGRAPHY['--font-family-sans']).toBeDefined();
      expect(CSS_TYPOGRAPHY['--font-family-mono']).toBeDefined();
    });

    it('should have valid font family values', () => {
      expect(CSS_TYPOGRAPHY['--font-family-sans']).toContain('Inter');
      expect(CSS_TYPOGRAPHY['--font-family-mono']).toContain('Fira Code');
    });
  });

  describe('CSS_VARIABLES', () => {
    it('should combine all variable groups', () => {
      const allKeys = Object.keys(CSS_VARIABLES);
      
      // Check for colors
      expect(allKeys).toContain('--color-primary-emerald');
      
      // Check for animations
      expect(allKeys).toContain('--animation-duration-shimmer');
      
      // Check for layout
      expect(allKeys).toContain('--scrollbar-width');
      
      // Check for typography
      expect(allKeys).toContain('--font-family-sans');
    });
  });

  describe('generateCSSVariables', () => {
    it('should generate valid CSS :root block', () => {
      const css = generateCSSVariables();
      
      expect(css).toContain(':root {');
      expect(css).toContain('}');
      expect(css).toContain('--color-primary-emerald:');
      expect(css).toContain('--animation-duration-shimmer:');
    });

    it('should include all CSS variables', () => {
      const css = generateCSSVariables();
      const variableCount = Object.keys(CSS_VARIABLES).length;
      
      // Count how many variables appear in the CSS
      const matches = css.match(/--[\w-]+:/g);
      expect(matches?.length).toBe(variableCount);
    });
  });

  describe('getCSSVariable', () => {
    it('should return the correct variable value', () => {
      const value = getCSSVariable('--color-primary-emerald');
      expect(value).toBe('#10b981');
    });

    it('should return animation duration values', () => {
      const value = getCSSVariable('--animation-duration-shimmer');
      expect(value).toBe('2000ms');
    });
  });

  describe('generateStyleObject', () => {
    it('should return a plain object with CSS variables', () => {
      const styleObj = generateStyleObject();
      
      expect(typeof styleObj).toBe('object');
      expect(styleObj['--color-primary-emerald']).toBe('#10b981');
      expect(styleObj['--animation-duration-shimmer']).toBe('2000ms');
    });

    it('should contain all CSS variables', () => {
      const styleObj = generateStyleObject();
      const variableCount = Object.keys(CSS_VARIABLES).length;
      
      expect(Object.keys(styleObj).length).toBe(variableCount);
    });
  });
});
