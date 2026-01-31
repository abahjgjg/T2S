
import { PromptKey } from "./systemPrompts";

export interface PitchPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  promptKey: PromptKey;
  customData?: Record<string, any>;
}

export const LIVE_AUDIO_CONFIG = {
  SAMPLE_RATE_INPUT: 16000,
  SAMPLE_RATE_OUTPUT: 24000,
  BUFFER_SIZE: 4096,
  MIME_TYPE: 'audio/pcm;rate=16000'
};

export const PITCH_PERSONAS: PitchPersona[] = [
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
