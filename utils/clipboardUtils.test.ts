
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyToClipboard, copyWithFeedback } from './clipboardUtils';

describe('clipboardUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', async () => {
      const result = await copyToClipboard('test text');
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
    });

    it('should handle copy failure', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Copy failed')),
        },
      });

      const result = await copyToClipboard('test text');
      expect(result).toBe(false);
    });

    it('should use custom success message', async () => {
      await copyToClipboard('test', { 
        successMessage: 'Custom message',
        showToast: false 
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test');
    });
  });

  describe('copyWithFeedback', () => {
    it('should set copied state on success', async () => {
      const setCopied = vi.fn();
      
      await copyWithFeedback('test', setCopied, 100);
      
      expect(setCopied).toHaveBeenCalledWith(true);
      
      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(setCopied).toHaveBeenCalledWith(false);
    });

    it('should not set copied state on failure', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Copy failed')),
        },
      });

      const setCopied = vi.fn();
      await copyWithFeedback('test', setCopied);
      
      expect(setCopied).not.toHaveBeenCalled();
    });
  });
});
