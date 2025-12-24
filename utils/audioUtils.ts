
// Utility to handle audio encoding/decoding for Gemini Live API and standard formats

/**
 * Decodes a base64 string into a Uint8Array
 */
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes a Uint8Array to a base64 string
 */
export function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes audio data into an AudioBuffer.
 * Tries native browser decoding first (for MP3/WAV from OpenAI).
 * Falls back to raw PCM decoding (for Gemini).
 */
export async function decodeAudioData(
  base64Data: string,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const data = decodeBase64(base64Data);
  
  // 1. Try Native Decoding (Works for MP3, WAV, etc. - OpenAI)
  try {
    // We clone the buffer because decodeAudioData might detach/neutering the ArrayBuffer
    const bufferCopy = data.buffer.slice(0);
    return await ctx.decodeAudioData(bufferCopy);
  } catch (e) {
    // Ignore error, assume it's raw PCM and proceed to manual decoding
  }

  // 2. Manual Raw PCM Decoding (Works for Gemini Int16 PCM)
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert Int16 to Float32 [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Converts Float32 audio data (Web Audio API default) to raw PCM Int16 Base64 (Gemini API requirement)
 */
export function float32ToPcm16Base64(float32Data: Float32Array): string {
  const l = float32Data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp values to [-1, 1]
    const s = Math.max(-1, Math.min(1, float32Data[i]));
    // Scale to Int16 range
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return encodeBase64(new Uint8Array(int16.buffer));
}
