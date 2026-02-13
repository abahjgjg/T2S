/**
 * Vite Build Configuration
 * Centralized build settings - Flexy hates hardcoded manual chunks!
 * 
 * All build configuration can be customized via environment variables
 */

import { getEnv, getEnvNumber, getEnvArray, getEnvJSON } from './utils/envUtils';

/**
 * Manual chunks configuration for code splitting
 * Flexy: No more hardcoded chunk definitions!
 */
export interface ManualChunksConfig {
  readonly [chunkName: string]: string[];
}

/**
 * Lazy loaded patterns for module preload removal
 * Flexy: Now configurable via environment!
 */
export interface LazyLoadedPatterns {
  readonly patterns: string[];
}

/**
 * Build optimization settings
 */
export interface BuildOptimization {
  readonly sourcemap: boolean;
  readonly chunkSizeWarningLimit: number;
  readonly cssCodeSplit: boolean;
  readonly target: string;
  readonly minify: 'terser' | 'esbuild' | false;
}

/**
 * Server configuration
 */
export interface ServerConfig {
  readonly port: number;
  readonly host: string;
}

// Default manual chunks - Flexy: Now configurable!
// BroCula: Optimized chunk splitting to reduce unused JavaScript
const DEFAULT_MANUAL_CHUNKS: ManualChunksConfig = {
  'vendor-react': ['react', 'react-dom', '@tanstack/react-query'],
  // BroCula: Keep charts together but ensure lazy loading
  'vendor-charts': ['recharts'],
  'vendor-markdown': ['react-markdown', 'remark-gfm'],
  'vendor-ui': ['lucide-react'],
  'vendor-zod': ['zod'],
  'vendor-supabase': ['@supabase/supabase-js'],
  'feature-admin': ['./components/AdminPanel'],
  'feature-dashboard': ['./components/UserDashboard'],
  // BroCula: Split blueprint into smaller chunks
  'feature-blueprint-core': ['./components/BlueprintView'],
  'feature-blueprint-modals': ['./components/LivePitchModal', './components/LocationScoutModal', './components/CompetitorAnalysisModal', './components/BlueprintAuditModal'],
  'feature-blueprint-sections': ['./components/PresentationMode', './components/SwotAnalysis', './components/BlueprintRoadmap', './components/BlueprintRevenue', './components/BlueprintLaunchpad', './components/BlueprintAgents', './components/BusinessModelCanvas', './components/BrandStudio', './components/CustomerPersonas', './components/BlueprintChat'],
};

// Default lazy loaded patterns - Flexy: Now configurable!
// BroCula: Updated to match new granular chunk names
const DEFAULT_LAZY_LOADED_PATTERNS = [
  'vendor-charts',
  'vendor-markdown',
  'vendor-zod',
  'vendor-supabase',
  'feature-blueprint-core',
  'feature-blueprint-modals',
  'feature-blueprint-sections',
  'feature-admin',
  'feature-dashboard',
  'TrendAnalysis',
  'ResearchChat',
  'TrendDeepDiveModal',
  'PublicBlogView',
  'Directory',
  'AdminPanel',
  'UserDashboard',
  'ProjectLibrary',
  'BlueprintView',
];

/**
 * Manual chunks configuration
 * Can be customized via VITE_MANUAL_CHUNKS environment variable (JSON)
 */
export const MANUAL_CHUNKS: ManualChunksConfig = getEnvJSON(
  'VITE_MANUAL_CHUNKS',
  DEFAULT_MANUAL_CHUNKS
);

/**
 * Lazy loaded patterns for preload removal
 * Can be customized via VITE_LAZY_LOADED_PATTERNS environment variable
 */
export const LAZY_LOADED_PATTERNS: string[] = getEnvArray(
  'VITE_LAZY_LOADED_PATTERNS',
  DEFAULT_LAZY_LOADED_PATTERNS
);

/**
 * Build optimization configuration
 */
export const BUILD_OPTIMIZATION: BuildOptimization = {
  sourcemap: getEnv('VITE_BUILD_SOURCEMAP', 'true') !== 'false',
  chunkSizeWarningLimit: getEnvNumber('VITE_CHUNK_SIZE_WARNING_LIMIT', 1500),
  cssCodeSplit: getEnv('VITE_CSS_CODE_SPLIT', 'true') !== 'false',
  target: getEnv('VITE_BUILD_TARGET', 'es2020'),
  minify: getEnv('VITE_BUILD_MINIFY', 'terser') as 'terser' | 'esbuild' | false,
};

/**
 * Terser minification options
 */
export const TERSER_OPTIONS = {
  compress: {
    drop_console: getEnv('VITE_BUILD_DROP_CONSOLE', 'true') === 'true',
    drop_debugger: getEnv('VITE_BUILD_DROP_DEBUGGER', 'true') === 'true',
    pure_funcs: getEnvArray('VITE_BUILD_PURE_FUNCS', [
      'console.log',
      'console.info',
      'console.debug',
      'console.trace',
    ]),
    passes: getEnvNumber('VITE_BUILD_COMPRESS_PASSES', 2),
  },
  format: {
    comments: getEnv('VITE_BUILD_KEEP_COMMENTS', 'false') === 'true',
  },
};

/**
 * File naming patterns
 */
export const FILE_NAMING = {
  entry: getEnv('VITE_ENTRY_FILE_PATTERN', 'assets/[name]-[hash].js'),
  chunk: getEnv('VITE_CHUNK_FILE_PATTERN', 'assets/[name]-[hash].js'),
  css: getEnv('VITE_CSS_FILE_PATTERN', 'assets/[name]-[hash][extname]'),
  asset: getEnv('VITE_ASSET_FILE_PATTERN', 'assets/[name]-[hash][extname]'),
};

/**
 * Server configuration
 */
export const SERVER_CONFIG: ServerConfig = {
  port: getEnvNumber('VITE_DEV_DEFAULT_PORT', 3000),
  host: getEnv('VITE_DEV_HOST', '0.0.0.0'),
};

/**
 * HTML environment plugin defaults
 * Flexy: No more hardcoded defaults in vite.config.ts!
 */
export const HTML_ENV_DEFAULTS = {
  VITE_APP_NAME: getEnv('VITE_APP_NAME', 'TrendVentures AI'),
  VITE_APP_DEFAULT_TITLE: getEnv('VITE_APP_DEFAULT_TITLE', 'TrendVentures AI | Market Research Suite'),
  VITE_APP_DEFAULT_DESCRIPTION: getEnv(
    'VITE_APP_DEFAULT_DESCRIPTION',
    'Generate comprehensive business blueprints and revenue models with AI-powered market intelligence. Transform ideas into actionable strategies.'
  ),
  VITE_OG_DESCRIPTION: getEnv(
    'VITE_OG_DESCRIPTION',
    'AI-powered market intelligence suite that generates business blueprints.'
  ),
  VITE_OG_IMAGE_WIDTH: getEnv('VITE_OG_IMAGE_WIDTH', '1200'),
  VITE_OG_IMAGE_HEIGHT: getEnv('VITE_OG_IMAGE_HEIGHT', '630'),
  VITE_PLACEHOLDER_BASE_URL: getEnv('VITE_PLACEHOLDER_BASE_URL', 'https://placehold.co'),
  VITE_COLOR_SLATE_50: getEnv('VITE_COLOR_SLATE_50', '#f8fafc'),
  VITE_COLOR_SLATE_600: getEnv('VITE_COLOR_SLATE_600', '#475569'),
  VITE_COLOR_SLATE_700: getEnv('VITE_COLOR_SLATE_700', '#334155'),
  VITE_COLOR_SLATE_800: getEnv('VITE_COLOR_SLATE_800', '#1e293b'),
  VITE_COLOR_SLATE_900: getEnv('VITE_COLOR_SLATE_900', '#0f172a'),
  VITE_COLOR_SLATE_950: getEnv('VITE_COLOR_SLATE_950', '#020617'),
  VITE_COLOR_PRIMARY_EMERALD: getEnv('VITE_COLOR_PRIMARY_EMERALD', '#10b981'),
  VITE_APP_BASE_URL: getEnv('VITE_APP_BASE_URL', 'https://trendventures.ai'),
  VITE_GOOGLE_FONTS_URL: getEnv(
    'VITE_GOOGLE_FONTS_URL',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Fira+Code&display=swap'
  ),
};

// Default export
export default {
  MANUAL_CHUNKS,
  LAZY_LOADED_PATTERNS,
  BUILD_OPTIMIZATION,
  TERSER_OPTIONS,
  FILE_NAMING,
  SERVER_CONFIG,
  HTML_ENV_DEFAULTS,
};
