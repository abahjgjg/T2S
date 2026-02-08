
/**
 * Feature Flags
 * Centralized feature flag configuration for toggling features
 * All environment-dependent features should be defined here
 */

// Helper to safely parse boolean from environment variable
const parseBooleanEnv = (value: string | undefined): boolean => {
  if (!value) return false;
  return value.toLowerCase() === 'true' || value === '1';
};

// Access env vars using process.env (shimmed by Vite)
declare const process: {
  env: Record<string, string | undefined>;
};

export const FEATURE_FLAGS = {
  // Media generation features
  ENABLE_VIDEO_GENERATION: parseBooleanEnv(process.env.VITE_ENABLE_VIDEO),
  ENABLE_IMAGE_GENERATION: parseBooleanEnv(process.env.VITE_ENABLE_IMAGES),
  
  // Audio features
  ENABLE_LIVE_PITCH: parseBooleanEnv(process.env.VITE_ENABLE_LIVE_PITCH),
  ENABLE_VOICE_SEARCH: parseBooleanEnv(process.env.VITE_ENABLE_VOICE_SEARCH),
  
  // Admin and management
  ENABLE_ADMIN_PANEL: parseBooleanEnv(process.env.VITE_ENABLE_ADMIN),
  ENABLE_AFFILIATE_SYSTEM: parseBooleanEnv(process.env.VITE_ENABLE_AFFILIATE),
  
  // Community features
  ENABLE_COMMENTS: parseBooleanEnv(process.env.VITE_ENABLE_COMMENTS),
  ENABLE_VOTING: parseBooleanEnv(process.env.VITE_ENABLE_VOTING),
  ENABLE_LEAD_CAPTURE: parseBooleanEnv(process.env.VITE_ENABLE_LEAD_CAPTURE),
  
  // Analytics and telemetry
  ENABLE_TELEMETRY: parseBooleanEnv(process.env.VITE_ENABLE_TELEMETRY),
  ENABLE_ANALYTICS: parseBooleanEnv(process.env.VITE_ENABLE_ANALYTICS),
  
  // Development features
  ENABLE_DEBUG_MODE: parseBooleanEnv(process.env.VITE_DEBUG_MODE),
  ENABLE_MOCK_DATA: parseBooleanEnv(process.env.VITE_ENABLE_MOCK_DATA),
} as const;

// Runtime feature checks
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};

// Feature groups for common checks
export const FEATURE_GROUPS = {
  MEDIA_GENERATION: FEATURE_FLAGS.ENABLE_VIDEO_GENERATION || FEATURE_FLAGS.ENABLE_IMAGE_GENERATION,
  COMMUNITY: FEATURE_FLAGS.ENABLE_COMMENTS || FEATURE_FLAGS.ENABLE_VOTING,
  ADMIN_FEATURES: FEATURE_FLAGS.ENABLE_ADMIN_PANEL || FEATURE_FLAGS.ENABLE_AFFILIATE_SYSTEM,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;
