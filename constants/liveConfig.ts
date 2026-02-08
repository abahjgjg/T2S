/**
 * Live Configuration
 * Configuration for live audio, pitch personas, and real-time features
 * All values can be overridden via environment variables.
 */

import { PromptKey } from "./systemPrompts";

// Helper to safely get env var with fallback
const getEnv = (key: string, defaultValue: string): string => {
  const value = (import.meta as unknown as Record<string, Record<string, string>>)?.env?.[key] 
    ?? (typeof process !== 'undefined' ? process.env?.[key] : undefined);
  return value || defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = getEnv(key, String(defaultValue));
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

export interface PitchPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  promptKey: PromptKey;
  customData?: Record<string, unknown>;
}

export const LIVE_AUDIO_CONFIG = {
  SAMPLE_RATE_INPUT: getEnvNumber('VITE_LIVE_SAMPLE_RATE_INPUT', 16000),
  SAMPLE_RATE_OUTPUT: getEnvNumber('VITE_LIVE_SAMPLE_RATE_OUTPUT', 24000),
  BUFFER_SIZE: getEnvNumber('VITE_LIVE_BUFFER_SIZE', 4096),
  MIME_TYPE: getEnv('VITE_LIVE_MIME_TYPE', 'audio/pcm;rate=16000')
};

// Parse personas from env or use defaults
const parsePersonas = (): PitchPersona[] => {
  const envPersonas = getEnv('VITE_LIVE_PITCH_PERSONAS', '');
  if (envPersonas) {
    try {
      return JSON.parse(envPersonas);
    } catch {
      // Fall back to defaults if parsing fails
    }
  }
  return [
    {
      id: 'vc_skeptic',
      name: 'Marcus',
      role: 'Skeptical VC',
      description: 'Hard-nosed investor focused on ROI, moats, and revenue.',
      icon: 'Briefcase',
      voiceName: 'Fenrir',
      promptKey: 'PERSONA_VC_SKEPTIC'
    },
    {
      id: 'customer_curious',
      name: 'Sarah',
      role: 'Potential Customer',
      description: 'Curious but budget-conscious buyer looking for value.',
      icon: 'User',
      voiceName: 'Kore',
      promptKey: 'PERSONA_CUSTOMER_CURIOUS'
    },
    {
      id: 'tech_cto',
      name: 'Alex',
      role: 'Technical Co-founder',
      description: 'Senior engineer focused on scalability, stack, and feasibility.',
      icon: 'Cpu',
      voiceName: 'Puck',
      promptKey: 'PERSONA_TECH_CTO'
    }
  ];
};

export const PITCH_PERSONAS: PitchPersona[] = parsePersonas();

// Default export for convenience
export default {
  LIVE_AUDIO_CONFIG,
  PITCH_PERSONAS,
};
