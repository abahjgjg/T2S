import { describe, it, expect } from 'vitest';
import { REGIONS, TIMEFRAMES, DEFAULT_SEARCH_CONFIG, STANDARD_SEARCH_CONFIG } from './searchConfig';
import type { SearchRegion, SearchTimeframe } from '../types';

describe('Search Config', () => {
  describe('REGIONS', () => {
    it('should have all expected regions', () => {
      expect(REGIONS).toContain('Global');
      expect(REGIONS).toContain('USA');
      expect(REGIONS).toContain('Indonesia');
      expect(REGIONS).toContain('Europe');
      expect(REGIONS).toContain('Asia');
      expect(REGIONS).toHaveLength(5);
    });

    it('should have Global as first region', () => {
      expect(REGIONS[0]).toBe('Global');
    });
  });

  describe('TIMEFRAMES', () => {
    it('should have all expected timeframes', () => {
      const values = TIMEFRAMES.map(t => t.value);
      expect(values).toContain('24h');
      expect(values).toContain('7d');
      expect(values).toContain('30d');
      expect(values).toContain('90d');
      expect(TIMEFRAMES).toHaveLength(4);
    });

    it('should have labels for all timeframes', () => {
      TIMEFRAMES.forEach(tf => {
        expect(tf.label).toBeDefined();
        expect(tf.label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('DEFAULT_SEARCH_CONFIG', () => {
    it('should have valid default region', () => {
      expect(REGIONS).toContain(DEFAULT_SEARCH_CONFIG.REGION);
    });

    it('should have valid default timeframe', () => {
      const validTimeframes: SearchTimeframe[] = ['24h', '7d', '30d', '90d'];
      expect(validTimeframes).toContain(DEFAULT_SEARCH_CONFIG.TIMEFRAME);
    });

    it('should have deep mode disabled by default', () => {
      expect(DEFAULT_SEARCH_CONFIG.DEEP_MODE).toBe(false);
    });

    it('should use Global as default region', () => {
      expect(DEFAULT_SEARCH_CONFIG.REGION).toBe('Global');
    });

    it('should use 30d as default timeframe', () => {
      expect(DEFAULT_SEARCH_CONFIG.TIMEFRAME).toBe('30d');
    });
  });

  describe('STANDARD_SEARCH_CONFIG', () => {
    it('should match cache standard criteria', () => {
      expect(STANDARD_SEARCH_CONFIG.REGION).toBe('Global');
      expect(STANDARD_SEARCH_CONFIG.TIMEFRAME).toBe('30d');
    });

    it('should be a subset of DEFAULT_SEARCH_CONFIG', () => {
      expect(STANDARD_SEARCH_CONFIG.REGION).toBe(DEFAULT_SEARCH_CONFIG.REGION);
      expect(STANDARD_SEARCH_CONFIG.TIMEFRAME).toBe(DEFAULT_SEARCH_CONFIG.TIMEFRAME);
    });
  });
});
