
/**
 * Route Constants
 * Centralized route path definitions for the application
 * Eliminates hardcoded route strings throughout the codebase
 * Flexy: All external URLs are now configurable via environment variables
 */

import { getEnv } from '../utils/envUtils';

export const ROUTES = {
  // Main routes
  HOME: '/',
  DASHBOARD: '/dashboard',
  IDEA: '/idea',
  BLUEPRINT: '/blueprint',
  ADMIN: '/admin',
  DIRECTORY: '/directory',
  
  // Feature routes
  LIVE_PITCH: '/live-pitch',
  RESEARCH: '/research',
  ANALYTICS: '/analytics',
} as const;

// Route parameter builders
export const buildRoute = {
  idea: (params?: { niche?: string }): string => {
    if (params?.niche) {
      return `${ROUTES.IDEA}?niche=${encodeURIComponent(params.niche)}`;
    }
    return ROUTES.IDEA;
  },
  
  blueprint: (params?: { id?: string }): string => {
    if (params?.id) {
      return `${ROUTES.BLUEPRINT}?id=${encodeURIComponent(params.id)}`;
    }
    return ROUTES.BLUEPRINT;
  },
  
  dashboard: (params?: { tab?: string }): string => {
    if (params?.tab) {
      return `${ROUTES.DASHBOARD}?tab=${encodeURIComponent(params.tab)}`;
    }
    return ROUTES.DASHBOARD;
  },
} as const;

// Query parameter keys
export const QUERY_PARAMS = {
  NICHE: 'niche',
  ID: 'id',
  TAB: 'tab',
  REF: 'ref',
  SOURCE: 'source',
} as const;

// External routes - Flexy: Made configurable via environment variables
export const EXTERNAL_ROUTES = {
  GITHUB: getEnv('VITE_EXTERNAL_GITHUB', 'https://github.com/trendventures'),
  DOCUMENTATION: getEnv('VITE_EXTERNAL_DOCS', 'https://docs.trendventures.ai'),
  SUPPORT: getEnv('VITE_EXTERNAL_SUPPORT', 'https://support.trendventures.ai'),
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
export type QueryParamKey = typeof QUERY_PARAMS[keyof typeof QUERY_PARAMS];
