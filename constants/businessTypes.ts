/**
 * Business Types Configuration
 * Centralized business type definitions - Flexy hates hardcoded enums!
 * 
 * All business types can be configured via environment variables
 * to support custom business models without code changes
 */

import { getEnvArray } from '../utils/envUtils';

/**
 * Default business types used throughout the application
 * Flexy: No more hardcoded 'SaaS' | 'Agency' | etc. in types.ts!
 */
export const DEFAULT_BUSINESS_TYPES = [
  'SaaS',
  'Agency', 
  'Content',
  'E-commerce',
  'Platform',
] as const;

/**
 * Extended business types that can be added via environment variables
 */
export const EXTENDED_BUSINESS_TYPES = getEnvArray('VITE_BUSINESS_TYPES', []);

/**
 * All available business types (default + extended from env)
 */
export const BUSINESS_TYPES = [
  ...DEFAULT_BUSINESS_TYPES,
  ...EXTENDED_BUSINESS_TYPES,
] as const;

/**
 * Type definition for business types
 * Flexy: Now dynamically generated from configurable types!
 */
export type BusinessType = typeof BUSINESS_TYPES[number];

/**
 * Business type metadata for UI display
 */
export interface BusinessTypeMeta {
  readonly type: BusinessType;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
  readonly color: string;
}

/**
 * Default business type metadata
 * Can be extended via environment variable VITE_BUSINESS_TYPE_META
 */
export const BUSINESS_TYPE_METADATA: Record<string, BusinessTypeMeta> = {
  SaaS: {
    type: 'SaaS',
    label: 'SaaS',
    description: 'Software as a Service - Cloud-based applications',
    icon: 'Cloud',
    color: 'blue',
  },
  Agency: {
    type: 'Agency',
    label: 'Agency',
    description: 'Service-based business offering expertise',
    icon: 'Briefcase',
    color: 'purple',
  },
  Content: {
    type: 'Content',
    label: 'Content',
    description: 'Content creation and media business',
    icon: 'FileText',
    color: 'orange',
  },
  'E-commerce': {
    type: 'E-commerce',
    label: 'E-commerce',
    description: 'Online retail and product sales',
    icon: 'ShoppingCart',
    color: 'emerald',
  },
  Platform: {
    type: 'Platform',
    label: 'Platform',
    description: 'Multi-sided marketplace or platform',
    icon: 'Layers',
    color: 'indigo',
  },
};

/**
 * Validation helper to check if a string is a valid business type
 */
export const isValidBusinessType = (type: string): type is BusinessType => {
  return BUSINESS_TYPES.includes(type as BusinessType);
};

/**
 * Get metadata for a business type
 */
export const getBusinessTypeMeta = (type: string): BusinessTypeMeta | undefined => {
  return BUSINESS_TYPE_METADATA[type];
};

// Default export
export default {
  DEFAULT_BUSINESS_TYPES,
  EXTENDED_BUSINESS_TYPES,
  BUSINESS_TYPES,
  BUSINESS_TYPE_METADATA,
  isValidBusinessType,
  getBusinessTypeMeta,
};
