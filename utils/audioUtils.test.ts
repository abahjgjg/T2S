
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { encodeBase64, float32ToPcm16Base64, decodeAudioData } from './audioUtils';

describe('audioUtils', () => {
  describe('encodeBase64', () => {
    it('should correctly encode a Uint8Array to base64', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const result = encodeBase64(bytes);
      expect(result).toBe('SGVsbG8=');
    });

    it('should handle empty arrays', () => {
      const bytes = new Uint8Array([]);
      const result = encodeBase64(bytes);
      expect(result).toBe('');
    });
  });

  describe('float32ToPcm16Base64', () => {
    it('should convert Float32 [-1.0, 1.0] to Int16 PCM Base64', () => {
      // 0.0 -> 0
      // 1.0 -> 32767
      // -1.0 -> -32768
      const input = new Float32Array([0, 1.0, -1.0, 0.5]);
      
      const base64 = float32ToPcm16Base64(input);
      expect(base64).toBeDefined();
      
      // Decode manually to verify values
      const binary = atob(base64);
      const buffer = new ArrayBuffer(binary.length);
      const view = new DataView(buffer);
      for (let i = 0; i < binary.length; i++) {
        view.setUint8(i, binary.charCodeAt(i));
      }
      
      const int16Result = new Int16Array(buffer);
      
      expect(int16Result[0]).toBe(0); // 0.0
      expect(int16Result[1]).toBe(32767); // 1.0
      expect(int16Result[2]).toBe(-32768); // -1.0
      expect(int16Result[3]).toBeCloseTo(16384, -1); // 0.5 (~16384)
    });

    it('should clamp values outside [-1, 1]', () => {
      const input = new Float32Array([1.5, -2.0]);
      // Should become 32767 and -32768
      const base64 = float32ToPcm16Base64(input);
      
      const binary = atob(base64);
      const buffer = new ArrayBuffer(binary.length);
      const view = new DataView(buffer);
      for (let i = 0; i < binary.length; i++) {
        view.setUint8(i, binary.charCodeAt(i));
      }
      const int16Result = new Int16Array(buffer);

      expect(int16Result[0]).toBe(32767);
      expect(int16Result[1]).toBe(-32768);
    });
  });

  describe('decodeAudioData', () => {
    let mockCtx: any;
    let mockBufferSource: any;

    beforeEach(() => {
      // Mock AudioContext and related standard APIs
      mockBufferSource = {
        getChannelData: vi.fn().mockReturnValue(new Float32Array(100)),
      };
      
      mockCtx = {
        decodeAudioData: vi.fn().mockResolvedValue('native-decoded'),
        createBuffer: vi.fn().mockReturnValue(mockBufferSource),
      };
    });

    it('should fallback to manual PCM decoding if native decode fails', async () => {
      // Force native decode fail
      mockCtx.decodeAudioData.mockRejectedValue(new Error('Encoding error'));
      
      const base64 = 'SGVsbG8='; // Dummy data
      const result = await decodeAudioData(base64, mockCtx);
      
      expect(mockCtx.decodeAudioData).toHaveBeenCalled();
      // Should fall through to createBuffer (Manual PCM)
      expect(mockCtx.createBuffer).toHaveBeenCalled();
      expect(result).toBe(mockBufferSource);
    });
  });
});
